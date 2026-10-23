import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request:Request,{params}:{params:Promise<{reportId:string}>}){
  const auth=await requireApiUser(["admin"]);if(!auth.user)return auth.response;
  const {reportId}=await params;if(!z.uuid().safeParse(reportId).success)return Response.json({error:"Report not found."},{status:404});
  const parsed=z.object({status:z.enum(["reviewing","resolved","dismissed"]),suspend_listing:z.boolean().optional()}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Check the report action."},{status:400});
  const supabase=await createClient();if(!supabase)return Response.json({error:"Reports are unavailable."},{status:503});
  const {data:report}=await supabase.from("reports").select("id,property_id").eq("id",reportId).single();if(!report)return Response.json({error:"Report not found."},{status:404});
  if(parsed.data.suspend_listing){const {error:suspendError}=await supabase.from("properties").update({status:"suspended",verified_at:null}).eq("id",report.property_id);if(suspendError)return Response.json({error:"Listing could not be suspended."},{status:400});}
  const {error}=await supabase.from("reports").update({status:parsed.data.status}).eq("id",reportId);if(error)return Response.json({error:"Report could not be updated."},{status:400});
  return Response.json({ok:true});
}
