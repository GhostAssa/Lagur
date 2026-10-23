export type AppRole = "customer" | "agent" | "company" | "admin";
export type AppUser = { id: string; email: string; role: AppRole; fullName: string };

const validRoles: AppRole[] = ["customer", "agent", "company", "admin"];

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
