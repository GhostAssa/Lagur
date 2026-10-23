import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import ListingForm from "@/components/listing-form";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export default async function NewListingPage() {
  const user = await requireUser(["agent", "company"]);
  const supabase = await createClient();
  const agencyResponse = supabase
    ? await supabase.from("agencies").select("id,status").eq("owner_id", user.id).single()
    : { data: null };
  const agency = (agencyResponse.data ?? null) as any;

  const zonesResponse = supabase
    ? await supabase.from("zones").select("id,name,city,state").eq("active", true).order("state").order("city")
    : { data: [] as any[] };
  const zones = (zonesResponse.data ?? []) as any[];

  return (
    <AppShell user={user}>
      <Link className="back-link" href="/agent/listings">
        ← Your listings
      </Link>

      <header className="page-heading">
        <p className="eyebrow">AGENT WORKSPACE · ADD A PROPERTY</p>
        <h1>
          Give the home
          <br />
          <span>a clear start.</span>
        </h1>
        <p>Complete each section carefully. Customers only see a listing after document review and approval.</p>
      </header>

      {agency?.status !== "approved" && (
        <p className="form-notice">
          Your business details are still being reviewed. You can submit this listing, and it will stay hidden while the agency account is pending.
        </p>
      )}

      {zones.length === 0 ? (
        <p className="empty-state">There are no active location zones yet. An administrator needs to configure zones before properties can be submitted.</p>
      ) : (
        <ListingForm zones={zones} />
      )}
    </AppShell>
  );
}
