import Link from "next/link";
import ListingsMap from "@/components/listings-map";
import { createClient } from "@/lib/supabase/server";

export default async function MapPage() {
  const supabase = await createClient();
  const response = supabase
    ? await supabase
        .from("properties")
        .select("id,title,city,state,latitude,longitude,price_kobo")
        .eq("status", "verified")
        .not("latitude", "is", null)
        .limit(300)
    : { data: [] as any[] };
  const properties = (response.data ?? []) as any[];

  return (
    <main className="product-public-page">
      <header className="public-app-header">
        <Link className="product-brand" href="/">
          Lagur<span>+</span>
        </Link>
        <nav>
          <Link href="/search">Browse homes</Link>
          <Link className="primary-button" href="/sign-in">
            Sign in
          </Link>
        </nav>
      </header>

      <div className="public-page-content map-page">
        <header className="page-heading">
          <p className="eyebrow">ACROSS NIGERIA</p>
          <h1>
            Every city,
            <br />
            <span>one search.</span>
          </h1>
          <p>Explore verified listings on a map. Choose a city to zoom in, then open a listing to see its details.</p>
        </header>

        <ListingsMap properties={properties} />
      </div>
    </main>
  );
}

