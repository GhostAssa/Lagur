"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, landingFor } from "@/lib/auth/profile";

const allowedRoles = ["customer", "agent", "company"] as const;
type Role = (typeof allowedRoles)[number];

const signupSchema = z.object({
  role: z.enum(allowedRoles),
  full_name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(24),
  password: z.string().min(12).max(128),
  business_name: z.string().trim().max(120).optional(),
  rc_number: z.string().trim().max(40).optional(),
});

function normaliseRole(value: FormDataEntryValue | null | undefined): Role {
  const input = typeof value === "string" ? value : "customer";
  return (allowedRoles as readonly string[]).includes(input) ? (input as Role) : "customer";
}

// Demo mode is ONLY on when explicitly switched on. Never guessed from missing env variables.
function demoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost")
    ? "http"
    : (h.get("x-forwarded-proto") ?? "https");
  return `${proto}://${host}`;
}

const enc = encodeURIComponent;

export async function signUp(formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/sign-up?error=${enc(parsed.error.issues[0]?.message ?? "Check your details.")}`);
  }

  const values = parsed.data;
  if (values.role !== "customer" && (!values.business_name || values.business_name.length < 2)) {
    redirect("/sign-up?error=Add+your+business+name.");
  }

  if (demoMode()) redirect(landingFor(values.role));

  const supabase = await createClient();
  if (!supabase) redirect(`/sign-up?error=${enc("Supabase is not configured.")}`);

  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        role: values.role,
        full_name: values.full_name,
        phone: values.phone,
        business_name: values.business_name ?? "",
        rc_number: values.rc_number ?? "",
      },
    },
  });
  if (error) redirect(`/sign-up?error=${enc(error.message)}`);

  if (data.session && data.user) {
    try {
      await ensureProfile(supabase, data.user, values.role);
    } catch (e) {
      redirect(`/sign-up?error=${enc(e instanceof Error ? e.message : "Profile could not be saved.")}`);
    }
    redirect(landingFor(values.role));
  }

  redirect("/check-email");
}

export async function signIn(formData: FormData) {
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/sign-in?error=Enter+a+valid+email+and+password.");

  if (demoMode()) redirect(landingFor(normaliseRole(formData.get("role"))));

  const supabase = await createClient();
  if (!supabase) redirect(`/sign-in?error=${enc("Supabase is not configured.")}`);

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    redirect(`/sign-in?error=${enc(error?.message ?? "Sign-in failed.")}`);
  }

  let role = "customer";
  try {
    ({ role } = await ensureProfile(supabase, data.user, "customer"));
  } catch (e) {
    redirect(`/sign-in?error=${enc(e instanceof Error ? e.message : "Profile error.")}`);
  }
  redirect(landingFor(role));
}

async function startGoogle(formData: FormData, errorPath: "/sign-in" | "/sign-up") {
  const role = normaliseRole(formData.get("role"));

  if (demoMode()) redirect(landingFor(role));

  const supabase = await createClient();
  if (!supabase) redirect(`${errorPath}?error=${enc("Supabase is not configured.")}`);

  const origin = await requestOrigin();
  (await cookies()).set("lagur_role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https"),
    maxAge: 600,
    path: "/",
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) {
    redirect(`${errorPath}?error=${enc(error?.message ?? "Google sign-in is unavailable right now.")}`);
  }
  redirect(data.url);
}

export async function signInWithGoogle(formData: FormData) {
  return startGoogle(formData, "/sign-in");
}

export async function signUpWithGoogle(formData: FormData) {
  return startGoogle(formData, "/sign-up");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
