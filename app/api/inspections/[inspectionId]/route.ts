import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

const responseSchema=z.object({status:z.enum(["confirmed","suggested","declined","cancelled"]),proposed_at:z.iso.datetime().optional(),response_note:z.string().trim().max(500).optional()});
export async function PATCH(request:Request,{params}:{params:Promise<{inspectionId:string}>}){
  const auth=await requireApiUser();if(!auth.user)return auth.response;
  if(!rateLimit(`inspection:${auth.user.id}`,12,60_000).allowed)return Response.json({error:"Please wait before sending another request."},{status:429});
  const {inspectionId}=await params;if(!z.uuid().safeParse(inspectionId).success)return Response.json({error:"Inspection not found."},{status:404});
  const parsed=responseSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Check your inspection response."},{status:400});
  const supabase=await createClient();if(!supabase)return Response.json({error:"Inspection booking is unavailable."},{status:503});
  const {data:inspection}=await supabase.from("inspections").select("id,thread_id,created_by,chat_threads(customer_id,agent_id)").eq("id",inspectionId).single();
  const thread=Array.isArray(inspection?.chat_threads)?inspection.chat_threads[0]:inspection?.chat_threads;
  if(!inspection||!thread)return Response.json({error:"Inspection not found."},{status:404});
  const isAgent=thread.agent_id===auth.user.id;const isCustomer=thread.customer_id===auth.user.id;
  if((parsed.data.status==="cancelled"&&!isCustomer)||(parsed.data.status!=="cancelled"&&!isAgent))return Response.json({error:"Only the agent can respond to a request; customers can cancel their own request."},{status:403});
  if(parsed.data.status==="suggested"&&!parsed.data.proposed_at)return Response.json({error:"Choose the suggested inspection time."},{status:400});
  const {data,error}=await supabase.from("inspections").update({status:parsed.data.status,proposed_at:parsed.data.proposed_at??undefined,response_note:parsed.data.response_note??null}).eq("id",inspection.id).select("id,status,proposed_at,response_note").single();
  if(error)return Response.json({error:"Your response could not be saved."},{status:400});
  return Response.json({inspection:data});
}
