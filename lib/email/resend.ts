import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM_EMAIL;

export async function sendVerificationEmail({
  email,
  fullName,
  role,
  nextPath,
}: {
  email: string;
  fullName?: string;
  role?: string;
  nextPath?: string;
}) {
  if (!apiKey || !fromAddress) return { sent: false, reason: "missing_resend_config" };

  const resend = new Resend(apiKey);
  const destination = nextPath ?? "/dashboard";
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const verificationLink = `${appUrl}${destination.startsWith("/") ? destination : `/${destination}`}`;

  await resend.emails.send({
    from: fromAddress,
    to: [email],
    subject: `Verify your ${role === "customer" ? "customer" : "agent"} account on Lagur`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1b1f;max-width:600px;margin:0 auto;">
        <h2 style="margin-bottom:12px;">Welcome to Lagur, ${fullName || "there"}.</h2>
        <p>Thanks for signing up. Before you continue, please verify your email address so we can activate your account.</p>
        <p><a href="${verificationLink}" style="display:inline-block;padding:12px 18px;background:#1a6d46;color:#ffffff;text-decoration:none;border-radius:999px;">Verify my account</a></p>
        <p>If the button does not work, use this link: <a href="${verificationLink}">${verificationLink}</a></p>
        <p>Once confirmed, you can continue using your Lagur workspace.</p>
      </div>
    `,
    text: `Welcome to Lagur, ${fullName || "there"}. Verify your account here: ${verificationLink}`,
  });

  return { sent: true };
}

export async function sendWelcomeEmail({
  email,
  fullName,
  role,
}: {
  email: string;
  fullName?: string;
  role?: string;
}) {
  if (!apiKey || !fromAddress) return { sent: false, reason: "missing_resend_config" };

  const resend = new Resend(apiKey);
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const dashboardLink = `${appUrl}/${role === "customer" ? "dashboard" : "agent/listings"}`;

  await resend.emails.send({
    from: fromAddress,
    to: [email],
    subject: `Your Lagur ${role === "customer" ? "customer" : "agent"} workspace is ready`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1b1f;max-width:600px;margin:0 auto;">
        <h2 style="margin-bottom:12px;">Welcome aboard, ${fullName || "there"}.</h2>
        <p>Your Lagur account is live. Continue into your workspace and set up your next move.</p>
        <p><a href="${dashboardLink}" style="display:inline-block;padding:12px 18px;background:#1a6d46;color:#ffffff;text-decoration:none;border-radius:999px;">Open dashboard</a></p>
      </div>
    `,
    text: `Welcome to Lagur, ${fullName || "there"}. Open your dashboard here: ${dashboardLink}`,
  });

  return { sent: true };
}
