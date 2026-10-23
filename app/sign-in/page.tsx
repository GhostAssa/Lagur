import Link from "next/link";
import { signIn, signInWithGoogle } from "@/app/actions/auth";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; role?: string }> }) {
  const { error, message, role } = await searchParams;
  const selectedRole = role === "agent" || role === "company" ? "agent" : "customer";
  const roleCopy = selectedRole === "customer"
    ? {
        eyebrow: "CUSTOMER ACCESS",
        title: "Search smarter.",
        intro: "Sign in to save homes, compare places and keep your shortlist moving without the back-and-forth.",
        helper: "Customer accounts are built for discovery, shortlist management and inspection planning.",
      }
    : {
        eyebrow: "AGENT & COMPANY ACCESS",
        title: "Manage your portfolio.",
        intro: "Sign in to add listings, review document status, message buyers and keep your property pipeline organised.",
        helper: "Agent accounts include business details, document review and listing management tools.",
      };

  return <main className="auth-page"><Link href="/" className="product-brand">Lagur<span>+</span></Link><section className="auth-card"><div className="auth-card-header"><p className="eyebrow">{roleCopy.eyebrow}</p><h1>{roleCopy.title}</h1><p className="auth-intro">{roleCopy.intro}</p></div>{message && <p className="form-success" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="auth-role-toggle" aria-label="Choose account type"><Link href="/sign-in?role=customer" className={selectedRole === "customer" ? "is-active" : ""}>Customer</Link><Link href="/sign-in?role=agent" className={selectedRole === "agent" ? "is-active" : ""}>Agent / company</Link></div><form action={signInWithGoogle} className="product-form"><input type="hidden" name="role" value={selectedRole}/><button className="auth-social-button" type="submit"><span aria-hidden="true">G</span>Continue with Google</button></form><div className="auth-divider"><span>or continue with email</span></div><form action={signIn} className="product-form auth-form"><input type="hidden" name="role" value={selectedRole}/><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label><label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" /></label><button className="primary-button" type="submit">Sign in <span aria-hidden="true">→</span></button></form><p className="auth-switch">{selectedRole === "customer" ? "Need a place to begin?" : "Need to create a business profile?"} <Link href={`/sign-up?role=${selectedRole}`}>{selectedRole === "customer" ? "Create a customer account" : "Create an agent account"}</Link></p><p className="auth-legal">{roleCopy.helper} Always use a lawyer and surveyor before making a commitment.</p></section></main>;
}
