import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth/dal";

const plans = [
  {
    name: "Starter",
    price: "₦25,000",
    cadence: "/ month",
    summary: "For agents starting a lean pipeline and testing demand in a few locations.",
    features: ["Up to 8 active listings", "Basic verification support", "Inbox and contact access"],
    highlight: false,
  },
  {
    name: "Growth",
    price: "₦75,000",
    cadence: "/ month",
    summary: "Built for active agents managing listings across multiple neighborhoods.",
    features: ["Unlimited active listings", "Priority customer inquiries", "Performance insights dashboard"],
    highlight: true,
  },
  {
    name: "Premium",
    price: "₦150,000",
    cadence: "/ month",
    summary: "For teams and companies that want deeper visibility and premium support.",
    features: ["Multi-user access", "Advanced document workflows", "Dedicated review and operations support"],
    highlight: false,
  },
];

export default async function AgentBillingPage() {
  const user = await requireUser();

  if (!["agent", "company"].includes(user.role)) {
    return (
      <AppShell user={user}>
        <header className="page-heading">
          <p className="eyebrow">ACCESS</p>
          <h1>Agent plans<br /><span>are for professionals.</span></h1>
          <p>This workspace is available to agents and companies managing property listings.</p>
        </header>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <header className="page-heading">
        <p className="eyebrow">HOSTING PLAN</p>
        <h1>Choose the plan<br /><span>that fits your pipeline.</span></h1>
        <p>Keep your listings live, maintain visibility and get the support you need as demand grows.</p>
      </header>

      <section className="workspace-summary">
        <div>
          <span className="eyebrow">CURRENT PLAN</span>
          <strong>Growth</strong>
        </div>
        <div>
          <span className="eyebrow">ACTIVE LISTINGS</span>
          <strong>18</strong>
        </div>
        <div>
          <span className="eyebrow">NEXT REVIEW</span>
          <strong>2 pending</strong>
        </div>
      </section>

      <section className="workspace-grid">
        {plans.map((plan) => (
          <article key={plan.name} className={`workspace-card ${plan.highlight ? "is-highlighted" : ""}`} style={plan.highlight ? { borderColor: "rgba(0,166,81,0.4)", boxShadow: "0 0 0 2px rgba(25,229,122,0.12), 0 20px 45px rgba(0,122,61,0.12)" } : undefined}>
            <span className="workspace-card-number">{plan.highlight ? "MOST POPULAR" : "PLAN"}</span>
            <p className="eyebrow">{plan.name}</p>
            <h2>{plan.price}<span style={{ fontSize: 16, opacity: 0.65 }}>{plan.cadence}</span></h2>
            <p>{plan.summary}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "grid", gap: 8, color: "#405448" }}>
              {plan.features.map((feature) => (
                <li key={feature} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span aria-hidden="true" style={{ color: "#00A651", fontWeight: 700 }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/agent/listings/new" aria-label={`Choose ${plan.name}`}>
              {plan.highlight ? "Current plan" : "Choose plan"} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
