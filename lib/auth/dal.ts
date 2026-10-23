import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildAppUser, type AppRole, type AppUser } from "@/lib/auth/profile";

export type { AppRole, AppUser } from "@/lib/auth/profile";

export async function getUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile, error: profileError } = await supabase.from("users").select("role,full_name").eq("id", user.id).maybeSingle();
  const resolvedUser = buildAppUser(user, profile ?? null);

  if (!resolvedUser) return null;

  if (profileError || !profile) {
    await supabase.from("users").upsert({
      id: user.id,
      role: resolvedUser.role,
      full_name: resolvedUser.fullName,
      phone: typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null,
    }, { onConflict: "id" });
    return resolvedUser;
  }

  return resolvedUser;
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
