import { AppShell } from "@/components/app-shell";
import AdminReviewAction from "@/components/admin-review-action";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReviewPage() {
  const user = await requireUser(["admin"]);
  const supabase = await createClient();
  const response = supabase
    ? await supabase
        .from("properties")
        .select(
          "id,title,description,category,type,city,lga,state,address,price_kobo,duplicate_flag,created_at,agencies(business_name),documents(id,kind,status,storage_path,notes)"
        )
        .eq("status", "pending_review")
        .order("created_at")
    : { data: [] as any[] };

  const listings = (response.data ?? []) as any[];
  const rows = await Promise.all(
    listings.map(async (item: any) => ({
      item,
      docs: await Promise.all(
        (Array.isArray(item.documents) ? item.documents : []).map(async (doc: any) => {
          const { data } = supabase
            ? await supabase.storage.from("listing-documents").createSignedUrl(doc.storage_path, 120)
            : { data: null };
          return { ...doc, signedUrl: data?.signedUrl ?? null };
        })
      ),
    }))
  );

  return (
    <AppShell user={user}>
      <header className="page-heading">
        <p className="eyebrow">ADMINISTRATION · DOCUMENTS</p>
        <h1>
          Review the
          <br />
          <span>details.</span>
        </h1>
        <p>Check every required document and duplicate-parcel flag before deciding what can go live.</p>
      </header>

      <div className="workspace-toolbar">
        <p>{listings.length} listings awaiting review</p>
      </div>

      {rows.length === 0 ? (
        <p className="empty-state">The review queue is clear.</p>
      ) : (
        <div className="review-queue">
          {rows.map(({ item, docs }) => (
            <article className="review-card" key={item.id}>
              <div className="review-card-heading">
                <div>
                  <p className="eyebrow">{item.category} · {item.type.replaceAll("_", " ")}</p>
                  <h2>{item.title}</h2>
                  <p>
                    {item.address}, {item.city}, {item.lga}, {item.state}
                  </p>
                </div>
                {item.duplicate_flag && <span className="review-flag">Possible duplicate parcel</span>}
              </div>

              <p>{item.description}</p>
              <p>
                Agency: {Array.isArray(item.agencies) ? item.agencies[0]?.business_name : item.agencies?.business_name} · submitted {new Date(item.created_at).toLocaleDateString("en-NG")}
              </p>

              <div className="review-documents">
                {docs.map((doc: any) => (
                  <div key={doc.id}>
                    <strong>{doc.kind.toUpperCase()}</strong>
                    <span className={`status-chip status-${doc.status}`}>{doc.status}</span>
                    {doc.notes && <p>{doc.notes}</p>}
                    {doc.signedUrl ? (
                      <a href={doc.signedUrl} target="_blank" rel="noreferrer">
                        Open document
                      </a>
                    ) : (
                      <span className="form-notice">No file available</span>
                    )}
                  </div>
                ))}
              </div>

              <AdminReviewAction propertyId={item.id} action="approve" label="Approve listing" />
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
