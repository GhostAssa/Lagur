import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AppRole = "customer" | "agent" | "company" | "admin";
export type AppUser = { id: string; email: string; role: AppRole; fullName: string };

const validRoles: AppRole[] = ["customer", "agent", "company", "admin"];

export const landingFor = (role: string) =>
  role === "customer" ? "/dashboard" : "/agent/listings";

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
  fallbackRole = "customer",
) {
  const { data: existing } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return { role: existing.role as string };

  const meta = user.user_metadata ?? {};
  const role = validRoles.includes(String(meta.role ?? "") as AppRole)
    ? (String(meta.role) as AppRole)
    : validRoles.includes(fallbackRole as AppRole)
      ? fallbackRole
      : "customer";

  const { error } = await supabase.from("users").insert({
    id: user.id,
    role,
    full_name: String(meta.full_name ?? meta.name ?? "").trim(),
    phone: meta.phone ?? null,
  });
  if (error) throw new Error(error.message);

  if (role !== "customer") {
    const { error: agencyError } = await supabase.from("agencies").upsert(
      {
        owner_id: user.id,
        business_name: String(meta.business_name ?? "My agency").trim() || "My agency",
        rc_number: meta.rc_number ?? null,
        status: "pending",
      },
      { onConflict: "owner_id" },
    );
    if (agencyError) throw new Error(agencyError.message);
  }

  return { role };
}

export function normaliseAppRole(value: unknown): AppRole {
  const role = typeof value === "string" ? value.trim().toLowerCase() : "customer";
  return validRoles.includes(role as AppRole) ? (role as AppRole) : "customer";
}

export function buildAppUser(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null,
  profile?: { role?: string | null; full_name?: string | null } | null,
): AppUser | null {
  if (!user) return null;
  const role = normaliseAppRole(profile?.role ?? user.user_metadata?.role ?? "customer");
  const fullName = String(profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? "").trim();
  return {
    id: user.id,
    email: user.email ?? "",
    role,
    fullName: fullName || "Lagur user",
  };
}
