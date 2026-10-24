import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getUser, requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const demoMode = () => !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const naira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);

export default async function DashboardPage() {
  const isDemoMode = demoMode();
  const demoUser = {
    id: "demo-customer",
    email: "demo@lagur.app",
    role: "customer" as "customer" | "agent" | "company" | "admin",
    fullName: "Demo Customer",
  };

  const user = isDemoMode ? demoUser : await requireUser();
  const supabase = isDemoMode ? null : await createClient();
  const userRecord = isDemoMode ? demoUser : await getUser();

  const customer = user.role === "customer";
  const admin = user.role === "admin";
  const agent = user.role === "agent" || user.role === "company";

  const { count: unreadCount } = supabase
    ? await supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null).eq("user_id", user.id)
    : { count: 0 };

  const { count: savedCount } = supabase
    ? await supabase.from("saved_properties").select("property_id", { count: "exact", head: true }).eq("user_id", user.id)
    : { count: 0 };

  const recentSavedResponse = supabase
    ? await supabase
        .from("saved_properties")
        .select("properties(id,title,city,state,category,type,price_kobo,property_media(url,alt))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3)
    : { data: [] as any[] };

  const recentSaved = (recentSavedResponse.data ?? []) as any[];
  const latestSaved = recentSaved.length > 0
    ? (Array.isArray(recentSaved[0].properties) ? recentSaved[0].properties[0] : recentSaved[0].properties)
    : null;

  const { count: activeCount } = supabase && (user.role === "agent" || user.role === "company")
    ? await supabase.from("properties").select("id", { count: "exact", head: true }).in("status", ["verified", "pending_review"]).eq("agency_id", (await supabase.from("agencies").select("id").eq("owner_id", user.id).single()).data?.id ?? "00000000-0000-0000-0000-000000000000")
    : { count: null };

  const cards = customer
    ? [
        ["AI search", "Describe the home you need in plain language and compare verified matches.", "/search", "Start a search"],
        ["Map view", "Explore homes around the cities and areas you care about.", "/map", "Open map"],
        ["Saved homes", "Keep the properties you want to revisit without losing track.", "/saved", "View saved"],
        ["Inbox & chat", "Message agents, ask for inspection dates and keep every conversation in one place.", "/inbox", "Open inbox"],
        ["Profile", "Review your details, saved search preferences and account status.", "/profile", "View profile"],
      ]
    : admin
      ? [
          ["Review queue", "Review listing documents and clear duplicate parcel flags.", "/admin/review", "Open reviews"],
          ["Fee table", "Maintain fixed fees by zone tier and property type.", "/admin/fees", "Manage fees"],
          ["Reports", "Review customer safety reports and take action.", "/admin/reports", "Open reports"],
        ]
      : [
          ["Your listings", `${activeCount ?? 0} listings are in review or currently visible.`, "/agent/listings", "Manage listings"],
          ["Add a listing", "Add property details, photos and the documents required for review.", "/agent/listings/new", "Add a property"],
          ["Hosting plan", "Review your hosting status and available plans.", "/agent/billing", "View plan"],
        ];

  const agentLocations = [
    ["Lekki Phase 1", 42],
    ["Yaba", 33],
    ["Wuse", 26],
    ["Ikeja", 21],
  ];

  const propertyTypes = [
    ["Residential rentals", 48],
    ["Land plots", 35],
    ["Duplexes", 27],
    ["Commercial space", 18],
  ];

  const metrics = [
    { label: "Searches this week", value: "4,820", note: "+18%" },
    { label: "Times you appeared", value: "1,260", note: "+12%" },
    { label: "Sold / allocated", value: "84", note: "+9%" },
  ];

  return (
    <AppShell user={userRecord ?? user}>
      <div className="dashboard-overview">
        <header className="dashboard-hero glass-surface">
          <div className="dashboard-hero-copy">
            <p className="eyebrow">AGENT PERFORMANCE</p>
            <h1>
              Hello <span>{user.fullName.split(" ")[0] || "there"}</span>
            </h1>
            <p>
              {customer
                ? "Search at your pace. Your next place starts with the homes, cities, and trust signals that matter to you."
                : admin
                  ? "Your review decisions keep the marketplace useful and accountable."
                  : "See what is moving, where demand is strongest, and which property types are winning right now."}
            </p>
          </div>

          <div className="dashboard-range" aria-label="Date range selector">
            <button type="button" className="is-active">Today</button>
            <button type="button">Week</button>
            <button type="button">Month</button>
          </div>
        </header>

        {agent && (
          <>
            <section className="dashboard-signal glass-surface">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">MARKET SIGNAL</p>
                  <h2>Performance overview</h2>
                </div>
                <span className="trend-pill">+18.4% this week</span>
              </div>

              <div className="signal-chart-wrap">
                <svg viewBox="0 0 820 220" className="signal-chart" role="img" aria-label="Performance chart">
                  <defs>
                    <linearGradient id="signalFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(52, 185, 105, 0.35)" />
                      <stop offset="100%" stopColor="rgba(52, 185, 105, 0.02)" />
                    </linearGradient>
                  </defs>
                  <g className="chart-grid">
                    {[0,1,2,3,4].map((line) => (
                      <line key={line} x1="0" x2="820" y1={26 + line * 42} y2={26 + line * 42} />
                    ))}
                  </g>
                  <path d="M0,170 C90,150,110,132,150,138 S230,128,280,98 S380,76,430,96 S530,72,620,52 S720,22,820,68 L820,220 L0,220 Z" fill="url(#signalFill)"/>
                  <path d="M0,170 C90,150,110,132,150,138 S230,128,280,98 S380,76,430,96 S530,72,620,52 S720,22,820,68" fill="none" stroke="#1b7d4e" strokeWidth="4" strokeLinecap="round"/>
                  <circle cx="620" cy="52" r="7" fill="#0d5b39" />
                </svg>
              </div>

              <div className="chart-axis">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </section>

            <section className="dashboard-metric-grid">
              {metrics.map((metric) => (
                <article key={metric.label} className="dashboard-metric glass-surface">
                  <span className="eyebrow">{metric.label}</span>
                  <div className="metric-row">
                    <strong>{metric.value}</strong>
                    <span>{metric.note}</span>
                  </div>
                </article>
              ))}
            </section>

            <section className="dashboard-breakdown">
              <article className="dashboard-panel glass-surface">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">TOP LOCATIONS</p>
                    <h2>Best locations selling</h2>
                  </div>
                  <Link href="/search">See all</Link>
                </div>

                <div className="listing-bars">
                  {agentLocations.map(([location, count]) => (
                    <div key={location} className="listing-row">
                      <div className="listing-labels">
                        <span>{location}</span>
                        <b>{count}%</b>
                      </div>
                      <div className="bar-track">
                        <span style={{ width: `${count}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="dashboard-panel glass-surface">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">TOP TYPES</p>
                    <h2>Best property types</h2>
                  </div>
                  <Link href="/search">See all</Link>
                </div>

                <div className="listing-bars">
                  {propertyTypes.map(([type, count]) => (
                    <div key={type} className="listing-row">
                      <div className="listing-labels">
                        <span>{type}</span>
                        <b>{count}%</b>
                      </div>
                      <div className="bar-track">
                        <span style={{ width: `${count}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}

        {customer && (
          <>
            <section className="workspace-summary">
              <div>
                <span className="eyebrow">SAVED HOMES</span>
                <strong>{savedCount ?? 0}</strong>
              </div>
              <div>
                <span className="eyebrow">UNREAD UPDATES</span>
                <strong>{unreadCount ?? 0}</strong>
              </div>
              <div>
                <span className="eyebrow">NEXT STEP</span>
                <strong>Search now</strong>
              </div>
            </section>

            {latestSaved && (
              <section className="browse-section" style={{ marginBottom: 32 }}>
                <div className="browse-heading">
                  <div>
                    <p className="eyebrow">YOUR SHORTLIST</p>
                    <h2>Recently saved</h2>
                  </div>
                  <Link href="/saved">View all saved</Link>
                </div>

                <div className="listing-grid">
                  <article className="listing-card" key={latestSaved.id}>
                    <Link href={`/listings/${latestSaved.id}`} className="listing-photo">
                      {latestSaved.property_media && latestSaved.property_media.length > 0 ? (
                        <img src={latestSaved.property_media[0].url} alt={latestSaved.property_media[0].alt ?? latestSaved.title} loading="lazy" />
                      ) : (
                        <span className="listing-photo-placeholder">{latestSaved.type?.replaceAll("_", " ") ?? "Home"}</span>
                      )}
                      <span className="verified-chip">✓ Verified</span>
                    </Link>
                    <div className="listing-card-body">
                      <p className="eyebrow">{latestSaved.category} · {latestSaved.type?.replaceAll("_", " ")}</p>
                      <h3>
                        <Link href={`/listings/${latestSaved.id}`}>{latestSaved.title}</Link>
                      </h3>
                      <p>{latestSaved.city}, {latestSaved.state}</p>
                      <strong>{naira(latestSaved.price_kobo)}</strong>
                      <Link className="listing-card-link" href={`/listings/${latestSaved.id}`}>
                        View details <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                </div>
              </section>
            )}
          </>
        )}

        {admin && (
          <section className="workspace-grid">
            {cards.map(([title, description, href, action], index) => (
              <article className="workspace-card" key={href}>
                <span className="workspace-card-number">0{index + 1}</span>
                <p className="eyebrow">ADMIN</p>
                <h2>{title}</h2>
                <p>{description}</p>
                <Link href={href}>
                  {action}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </section>
        )}

        {agent && (
          <section className="workspace-grid">
            {cards.map(([title, description, href, action], index) => (
              <article className="workspace-card" key={href}>
                <span className="workspace-card-number">0{index + 1}</span>
                <p className="eyebrow">PROPERTY PROFESSIONAL</p>
                <h2>{title}</h2>
                <p>{description}</p>
                <Link href={href}>
                  {action}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </section>
        )}

        {customer && (
          <section className="workspace-grid">
            {cards.map(([title, description, href, action], index) => (
              <article className="workspace-card" key={href}>
                <span className="workspace-card-number">0{index + 1}</span>
                <p className="eyebrow">CUSTOMER</p>
                <h2>{title}</h2>
                <p>{description}</p>
                <Link href={href}>
                  {action}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </section>
        )}

        {customer && (
          <p className="honest-note">
            <strong>Before you pay:</strong> Lagur reviews submitted documents and checks for duplicate listings. We do not guarantee legal title. Use a lawyer and a surveyor.
          </p>
        )}
      </div>
    </AppShell>
  );
}
