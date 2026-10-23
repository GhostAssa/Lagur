import Link from "next/link";
import { signUp, signUpWithGoogle } from "@/app/actions/auth";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string; role?: string }> }) {
  const { error, role } = await searchParams;
  const selectedRole = ["agent", "company"].includes(role ?? "") ? "agent" : "customer";
  const isCustomer = selectedRole === "customer";
  const roleCopy = isCustomer
    ? {
        eyebrow: "CUSTOMER ACCOUNT",
        title: "Begin your search.",
        intro: "Create an account to save homes, compare options, and message agents about inspections.",
        helper: "Customers can browse verified listings, keep a shortlist and request viewings.",
      }
    : {
        eyebrow: "AGENT & COMPANY ACCOUNT",
        title: "Showcase your listings.",
        intro: "Create a professional account to add properties, upload documents and manage one or many listings.",
        helper: "Agents and companies need business details before listings can be reviewed and made live.",
      };

  return <main className="auth-page"><Link href="/" className="product-brand">Lagur<span>+</span></Link><section className="auth-card auth-card-wide"><div className="auth-card-header"><p className="eyebrow">{roleCopy.eyebrow}</p><h1>{roleCopy.title}</h1><p className="auth-intro">{roleCopy.intro}</p></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="auth-role-toggle" aria-label="Choose account type"><Link href="/sign-up?role=customer" className={selectedRole === "customer" ? "is-active" : ""}>Customer</Link><Link href="/sign-up?role=agent" className={selectedRole === "agent" ? "is-active" : ""}>Agent / company</Link></div><form action={signUpWithGoogle} className="product-form"><input type="hidden" name="role" value={selectedRole}/><button className="auth-social-button" type="submit"><span aria-hidden="true">G</span>Continue with Google</button></form><div className="auth-divider"><span>or create an account with email</span></div><form action={signUp} className="product-form product-form-grid auth-form">
    <input type="hidden" name="role" value={selectedRole}/><label>Your name<input name="full_name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your full name" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
    <label>Phone number<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={24} placeholder="0803 000 0000" /></label><label>Account type<select name="role" defaultValue={selectedRole}><option value="customer">I’m looking for a home</option><option value="agent">I’m an agent</option><option value="company">I represent a real estate company</option></select></label>
    {isCustomer ? null : <><label className="form-full">Business or agency name<input name="business_name" autoComplete="organization" maxLength={120} placeholder="Required for agents and companies" required /></label><label className="form-full">RC number <span className="optional-label">(optional)</span><input name="rc_number" maxLength={40} placeholder="Enter your RC number" /></label></>}
    <label className="form-full">Create a password<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} aria-describedby="password-help" placeholder="At least 12 characters" /><small id="password-help">Use at least 12 characters.</small></label>
    <button className="primary-button form-full" type="submit">Create account <span aria-hidden="true">→</span></button></form><p className="auth-switch">Already have an account? <Link href={`/sign-in?role=${selectedRole}`}>Sign in</Link></p><p className="auth-legal">{roleCopy.helper} We will send a verification email before you can access the full workspace.</p></section></main>;
}
