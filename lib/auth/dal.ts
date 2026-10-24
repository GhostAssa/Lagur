import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildAppUser, ensureProfile, type AppRole, type AppUser } from "@/lib/auth/profile";

export type { AppRole, AppUser } from "@/lib/auth/profile";

export const verifySession = cache(async () => {
  const supabase = await createClient();
  if (!supabase) redirect("/sign-in?error=Server+is+not+configured");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { role } = await ensureProfile(supabase, user, "customer");
  return { user, role };
});

export async function getUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role,full_name")
    .eq("id", user.id)
    .maybeSingle();

  let role = "customer";
  if (!profile || profileError) {
    try {
      ({ role } = await ensureProfile(supabase, user, "customer"));
    } catch {
      return buildAppUser(user, { role: "customer", full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "" }) ?? null;
    }
  } else {
    role = profile.role ?? "customer";
  }

  const finalProfile = profile ?? {
    role,
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
  };

  return buildAppUser(user, finalProfile) ?? null;
}

export async function requireUser(roles?: AppRole[]) {
  const user = await getUser();
  if (!user) redirect("/sign-in");
  if (roles && !roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export async function requireApiUser(roles?: AppRole[]) {
  const user = await getUser();
  if (!user) return { user: null, response: Response.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (roles && !roles.includes(user.role)) return { user: null, response: Response.json({ error: "You do not have access to this action." }, { status: 403 }) };
  return { user, response: null };
}
