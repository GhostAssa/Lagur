import { AppShell } from "@/components/app-shell";
import FeeEditor from "@/components/fee-editor";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export default async function AdminFeesPage(){const user=await requireUser(["admin"]);const supabase=await createClient();const response=supabase?await supabase.from("fee_table").select("id,zone_tier,property_type,fixed_fee_kobo,active").order("zone_tier").order("property_type"):{data:[] as any[]};const fees=(response.data ?? []) as any[];return <AppShell user={user}><header className="page-heading"><p className="eyebrow">ADMINISTRATION · FEE TABLE</p><h1>Keep fees<br/><span>straightforward.</span></h1><p>Set one fixed agent fee for each location zone tier and property type.</p></header>{fees.length===0&&<p className="form-notice">No fee rules are configured yet. Add rules before listings can show a fixed fee.</p>}<FeeEditor fees={fees}/></AppShell>} 
