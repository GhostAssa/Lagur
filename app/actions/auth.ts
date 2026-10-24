"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/lib/email/resend";

const allowedRoles = ["customer", "agent", "company"] as const;
const signupSchema = z.object({
  role: z.enum(allowedRoles), full_name: z.string().trim().min(2).max(100),
  email: z.email().max(254), phone: z.string().trim().min(7).max(24), password: z.string().min(12).max(128),
  business_name: z.string().trim().max(120).optional(), rc_number: z.string().trim().max(40).optional(),
});

function normaliseRole(value: FormDataEntryValue | null | undefined) {
  const input = typeof value === "string" ? value : "customer";
  return allowedRoles.includes(input as typeof allowedRoles[number]) ? input : "customer";
}

function roleLandingPath(role: string) {
  return role === "customer" ? "/dashboard" : "/agent/listings";
}

function authRedirectBase() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/sign-up?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check your details.")}`);
  const values = parsed.data;
  if (values.role !== "customer" && (!values.business_name || values.business_name.length < 2)) redirect("/sign-up?error=Add+your+business+name.");
  const supabase = await createClient();
  if (!supabase) redirect("/sign-up?error=Add+Supabase+credentials+to+.env.local+to+enable+accounts.");
  const nextPath = roleLandingPath(values.role);
  const { error } = await supabase.auth.signUp({
    email: values.email, password: values.password,
    options: { emailRedirectTo: `${authRedirectBase()}/auth/callback?next=${encodeURIComponent(nextPath)}`, data: { role: values.role, full_name: values.full_name, phone: values.phone, business_name: values.business_name ?? "", rc_number: values.rc_number ?? "" } },
  });
  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);

  await sendVerificationEmail({
    email: values.email,
    fullName: values.full_name,
    role: values.role,
    nextPath,
  });

  redirect("/check-email");
}

export async function signIn(formData: FormData) {
  const role = normaliseRole(formData.get("role"));
  const parsed = z.object({ email: z.email(), password: z.string().min(1) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/sign-in?error=Enter+a+valid+email+and+password.");
  const supabase = await createClient();
  if (!supabase) redirect("/sign-in?error=Add+Supabase+credentials+to+.env.local+to+enable+accounts.");
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  redirect(roleLandingPath(role));
}

export async function signInWithGoogle(formData: FormData) {
  const role = normaliseRole(formData.get("role"));
  const supabase = await createClient();
  if (!supabase) redirect("/sign-in?error=Add+Supabase+credentials+to+.env.local+to+enable+accounts.");
  const nextPath = roleLandingPath(role);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${authRedirectBase()}/auth/callback?next=${encodeURIComponent(nextPath)}&role=${encodeURIComponent(role)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  if (data.url) redirect(data.url);
  redirect(`/sign-in?error=${encodeURIComponent("Google sign-in is unavailable right now.")}`);
}

export async function signUpWithGoogle(formData: FormData) {
  const role = normaliseRole(formData.get("role"));
  const supabase = await createClient();
  if (!supabase) redirect("/sign-up?error=Add+Supabase+credentials+to+.env.local+to+enable+accounts.");
  const nextPath = roleLandingPath(role);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${authRedirectBase()}/auth/callback?next=${encodeURIComponent(nextPath)}&role=${encodeURIComponent(role)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  if (data.url) redirect(data.url);
  redirect(`/sign-up?error=${encodeURIComponent("Google signup is unavailable right now.")}`);
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
