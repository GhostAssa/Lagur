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
    role: "customer" as const,
    fullName: "Demo Customer",
  };

  const user = isDemoMode ? demoUser : await requireUser();
  const supabase = isDemoMode ? null : await createClient();
  const userRecord = isDemoMode ? demoUser : await getUser();

  const customer = user.role === "customer";
  const admin = user.role === "admin";

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

  return (
    <AppShell user={userRecord ?? user}>
      <header className="page-heading">
        <p className="eyebrow">YOUR LAGUR WORKSPACE</p>
        <h1>
          Good to see you,<br />
          <span>{user.fullName.split(" ")[0] || "welcome"}.</span>
        </h1>
        <p>
          {customer
            ? "Search at your pace. Your next place starts with the homes, cities, and trust signals that matter to you."
            : admin
              ? "Your review decisions keep the marketplace useful and accountable."
              : "Keep your property information, documents and conversations together."}
        </p>
      </header>

      {customer && (
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
      )}

      {!customer && !admin && (
        <section className="workspace-summary">
          <div>
            <span className="eyebrow">ACCOUNT</span>
            <strong>{user.role === "company" ? "Real estate company" : user.role[0].toUpperCase() + user.role.slice(1)}</strong>
          </div>
          <div>
            <span className="eyebrow">NOTIFICATIONS</span>
            <strong>{unreadCount ?? 0} unread</strong>
          </div>
          <div>
            <span className="eyebrow">LISTINGS</span>
            <strong>{activeCount ?? 0} in progress</strong>
          </div>
        </section>
      )}

      {customer && latestSaved && (
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

      <section className="workspace-grid">
        {cards.map(([title, description, href, action], index) => (
          <article className="workspace-card" key={href}>
            <span className="workspace-card-number">0{index + 1}</span>
            <p className="eyebrow">{customer ? "CUSTOMER" : admin ? "ADMIN" : "PROPERTY PROFESSIONAL"}</p>
            <h2>{title}</h2>
            <p>{description}</p>
            <Link href={href}>
              {action}
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>

      {customer && (
        <p className="honest-note">
          <strong>Before you pay:</strong> Lagur reviews submitted documents and checks for duplicate listings. We do not guarantee legal title. Use a lawyer and a surveyor.
        </p>
      )}
    </AppShell>
  );
}
