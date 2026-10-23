import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "customer" | "agent" | "company" | "admin";
export type AppUser = { id: string; email: string; role: AppRole; fullName: string };

export async function getUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase.from("users").select("role,full_name").eq("id", user.id).single();
  if (!profile) return null;
  return { id: user.id, email: user.email ?? "", role: profile.role as AppRole, fullName: profile.full_name ?? "" };
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
