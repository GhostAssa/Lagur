import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/resend";

const validRoles = new Set(["customer", "agent", "company"]);

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const store = await cookies();
  const roleFromCookie = store.get("lagur_auth_role")?.value;
  const role = validRoles.has(roleFromCookie ?? "") ? roleFromCookie : "customer";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        const fullName = data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? "";
        const phone = data.user.user_metadata?.phone ?? "";
        const businessName = data.user.user_metadata?.business_name ?? "";
        const rcNumber = data.user.user_metadata?.rc_number ?? "";

        const profile = {
          id: data.user.id,
          role,
          full_name: fullName || "Google user",
          phone: phone || null,
        };

        await supabase.from("users").upsert(profile, { onConflict: "id" });

        if (role === "agent" || role === "company") {
          await supabase.from("agencies").upsert({
            owner_id: data.user.id,
            business_name: businessName || "My agency",
            rc_number: rcNumber || null,
            status: "pending",
          }, { onConflict: "owner_id" });
        }

        await supabase.auth.updateUser({
          data: {
            role,
            full_name: fullName || "Google user",
            phone: phone || "",
            business_name: businessName || "",
            rc_number: rcNumber || "",
          },
        });

        await sendWelcomeEmail({
          email: data.user.email ?? "",
          fullName: fullName || "there",
          role,
        });

        store.set("lagur_auth_role", "", { path: "/", maxAge: 0, sameSite: "lax", httpOnly: true });
        return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/dashboard", request.url));
      }

      const errorMessage = error?.message ?? "Verification link could not be used.";
      store.set("lagur_auth_role", "", { path: "/", maxAge: 0, sameSite: "lax", httpOnly: true });
      return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(errorMessage)}`, request.url));
    }
  }

  store.set("lagur_auth_role", "", { path: "/", maxAge: 0, sameSite: "lax", httpOnly: true });
  return NextResponse.redirect(new URL("/sign-in?error=Verification+link+could+not+be+used.+Check+your+Supabase+redirect+settings+and+try+again.", request.url));
}
