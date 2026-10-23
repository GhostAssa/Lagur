import Link from "next/link";
import AiSearch from "@/components/ai-search";
import { createClient } from "@/lib/supabase/server";

const naira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);

const types = [
  ["self_contained", "Self-contained (1 bedroom)"],
  ["room_and_parlor", "Room and parlor"],
  ["two_bedroom", "2 bedroom"],
  ["two_bedroom_and_parlor", "2 bedroom and parlor"],
  ["three_bedroom", "3 bedroom"],
  ["five_bedroom", "5 bedroom"],
  ["duplex", "Duplex"],
  ["two_bedroom_duplex", "2 bedroom duplex"],
  ["bungalow", "Bungalow"],
  ["story_building", "Story building"],
  ["land", "Land"],
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase?.from("properties")
    .select(
      "id,title,description,category,type,city,state,price_kobo,bedrooms,plots,property_media(url,alt),agencies(business_name),zones(tier)"
    )
    .eq("status", "verified")
    .order("created_at", { ascending: false })
    .limit(40);

  if (query && params.location) {
    const cleaned = params.location.replace(/[,%()]/g, " ");
    query = query.or(`city.ilike.%${cleaned}%,state.ilike.%${cleaned}%`);
  }

  if (query && params.category) query = query.eq("category", params.category);
  if (query && params.type) query = query.eq("type", params.type);
  if (query && params.min_price) query = query.gte("price_kobo", Number(params.min_price) * 100);
  if (query && params.max_price) query = query.lte("price_kobo", Number(params.max_price) * 100);

  const queryResponse = query ? await query : { data: [] as any[], error: null };
  const items = (queryResponse.data ?? []) as any[];
  const { error } = queryResponse;
  const feeResponse = supabase
    ? await supabase.from("fee_table").select("zone_tier,property_type,fixed_fee_kobo").eq("active", true)
    : { data: [] as any[] };
  const fees = (feeResponse.data ?? []) as any[];

  const formatType = (value: string) => value.replaceAll("_", " ");

  return (
    <main className="product-public-page">
      <header className="public-app-header">
        <Link className="product-brand" href="/">
          Lagur<span>+</span>
        </Link>
        <nav>
          <Link href="/sign-in">Sign in</Link>
          <Link className="primary-button" href="/sign-up?role=customer">
            Create account
          </Link>
        </nav>
      </header>

      <div className="public-page-content">
        <header className="page-heading">
          <p className="eyebrow">VERIFIED HOMES ACROSS NIGERIA</p>
          <h1>
            A search shaped
            <br />
            <span>around you.</span>
          </h1>
          <p>Browse and filter for free, or describe what you need to search with AI.</p>
        </header>

        <AiSearch />

        <section className="browse-section">
          <div className="browse-heading">
            <div>
              <p className="eyebrow">THE LISTINGS</p>
              <h2>Browse verified homes</h2>
            </div>
            <span>{items.length} homes</span>
          </div>

          <form action="/search" className="browse-filters">
            <label>
              Location
              <input name="location" defaultValue={params.location} placeholder="City or state" />
            </label>

            <label>
              Looking to
              <select name="category" defaultValue={params.category ?? ""}>
                <option value="">Any category</option>
                <option value="rent">Rent</option>
                <option value="sale">Buy</option>
                <option value="land">Land</option>
              </select>
            </label>

            <label>
              Property type
              <select name="type" defaultValue={params.type ?? ""}>
                <option value="">Any type</option>
                {types.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Min price (₦)
              <input name="min_price" inputMode="numeric" type="number" min="0" defaultValue={params.min_price} />
            </label>

            <label>
              Max price (₦)
              <input name="max_price" inputMode="numeric" type="number" min="0" defaultValue={params.max_price} />
            </label>

            <button className="secondary-button" type="submit">
              Apply filters
            </button>
          </form>

          {error ? (
            <p role="alert" className="form-error">
              Listings could not be loaded.
            </p>
          ) : items.length === 0 ? (
            <p className="empty-state">Nothing matches yet. Try a different location or budget.</p>
          ) : (
            <div className="listing-grid">
              {items.map((item: any) => {
                const media = Array.isArray(item.property_media) ? item.property_media[0] : null;
                const tiers = Array.isArray(item.zones) ? item.zones : item.zones ? [item.zones] : [];
                const tier = tiers[0]?.tier ?? null;
                const fee = fees.find((row: any) => row.zone_tier === tier && row.property_type === item.type)?.fixed_fee_kobo;
                const agencyName = Array.isArray(item.agencies)
                  ? item.agencies[0]?.business_name
                  : (item.agencies as any)?.business_name;

                return (
                  <article className="listing-card" key={item.id}>
                    <Link href={`/listings/${item.id}`} className="listing-photo">
                      {media ? (
                        <img
                          src={media.url}
                          alt={media.alt ?? `Property in ${item.city}, ${item.state}`}
                          loading="lazy"
                        />
                      ) : (
                        <span className="listing-photo-placeholder">{formatType(item.type)}</span>
                      )}
                      <span className="verified-chip">✓ Verified documents</span>
                    </Link>

                    <div className="listing-card-body">
                      <p className="eyebrow">
                        {item.category} · {formatType(item.type)}
                      </p>

                      <h3>
                        <Link href={`/listings/${item.id}`}>{item.title}</Link>
                      </h3>

                      <p>
                        {item.city}, {item.state}
                      </p>

                      <strong>{naira(item.price_kobo)}</strong>

                      {fee !== undefined && <span className="fee-chip">Fixed fee: {naira(fee)}</span>}

                      <small>{agencyName}</small>

                      <Link className="listing-card-link" href={`/listings/${item.id}`}>
                        View home <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="product-public-footer">
        <p>Lagur. Verified listings. Fixed fees.</p>
        <p>We review documents and check for duplicate listings. We do not guarantee legal title.</p>
      </footer>
    </main>
  );
}

