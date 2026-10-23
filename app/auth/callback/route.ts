import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/resend";

const validRoles = new Set(["customer", "agent", "company"]);

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const oauthError = request.nextUrl.searchParams.get("error_description") ?? request.nextUrl.searchParams.get("error") ?? "";
  const store = await cookies();
  const roleFromCookie = store.get("lagur_auth_role")?.value;

  store.set("lagur_auth_role", "", { path: "/", maxAge: 0, sameSite: "lax", httpOnly: true });

  if (oauthError) {
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(oauthError)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=Google+sign-in+was+cancelled+or+the+redirect+was+misconfigured.+Please+try+again.", request.url));
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/sign-in?error=Add+Supabase+credentials+to+the+app+environment+before+signing+in.", request.url));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error && data.user) {
    const role = validRoles.has(roleFromCookie ?? "") ? roleFromCookie : (data.user.user_metadata?.role ?? "customer");
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

    try {
      await sendWelcomeEmail({
        email: data.user.email ?? "",
        fullName: fullName || "there",
        role,
      });
    } catch {
      // Intentionally ignore email failures so users are still taken to their dashboard.
    }

    const destination = next.startsWith("/") ? next : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const errorMessage = error?.message ?? "Verification link could not be used.";
  return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(errorMessage)}`, request.url));
}
