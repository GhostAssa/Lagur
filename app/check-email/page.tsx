import Link from "next/link";

export default function CheckEmailPage() { return <main className="auth-page"><Link href="/" className="product-brand">Lagur<span>+</span></Link><section className="auth-card"><p className="eyebrow">ONE LAST STEP</p><h1>Check your<br/>inbox.</h1><p className="auth-intro">Use the verification link we emailed you to confirm your address. Then you can sign in and continue setting up your account.</p><Link href="/sign-in" className="primary-button">Back to sign in <span aria-hidden="true">→</span></Link></section></main>; }
