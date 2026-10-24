import { NextResponse, after, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, landingFor } from "@/lib/auth/profile";
import { sendWelcomeEmail } from "@/lib/email/resend";

function publicOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.nextUrl.origin;
  const proto = host.startsWith("localhost")
    ? "http"
    : (request.headers.get("x-forwarded-proto") ?? "https");
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);
  const fail = (message: string) =>
    NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(message)}`);

  const params = request.nextUrl.searchParams;
  const oauthError = params.get("error_description") ?? params.get("error");
  if (oauthError) return fail(oauthError);

  const code = params.get("code");
  if (!code) {
    return fail("No sign-in code came back. Check the Redirect URLs in Supabase.");
  }

  const supabase = await createClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return fail(error?.message ?? "Could not create a session.");
  }

  const cookieStore = await cookies();
  const wanted = cookieStore.get("lagur_role")?.value ?? "customer";
  cookieStore.delete("lagur_role");

  let role: string;
  try {
    ({ role } = await ensureProfile(supabase, data.user, wanted));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Profile could not be saved.");
  }

  const user = data.user;
  after(async () => {
    try {
      await sendWelcomeEmail({
        email: user.email ?? "",
        fullName: user.user_metadata?.full_name ?? "there",
        role,
      });
    } catch (e) {
      console.warn("Welcome email failed", e);
    }
  });

  return NextResponse.redirect(`${origin}${landingFor(role)}`);
}
