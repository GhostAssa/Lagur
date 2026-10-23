import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function POST(request:Request,{params}:{params:Promise<{threadId:string}>}){
  const auth=await requireApiUser();if(!auth.user)return auth.response;
  if(!rateLimit(`inspection:${auth.user.id}`,8,60_000).allowed)return Response.json({error:"Please wait before sending another request."},{status:429});
  const {threadId}=await params;if(!z.uuid().safeParse(threadId).success)return Response.json({error:"Conversation not found."},{status:404});
  const parsed=z.object({proposed_at:z.iso.datetime()}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Choose an inspection time."},{status:400});
  const proposedAt=new Date(parsed.data.proposed_at);if(proposedAt.getTime()<Date.now()+60*60*1000||proposedAt.getTime()>Date.now()+180*24*60*60*1000)return Response.json({error:"Choose a time at least an hour from now and within six months."},{status:400});
  const supabase=await createClient();if(!supabase)return Response.json({error:"Inspection booking is unavailable."},{status:503});
  const {data,error}=await supabase.from("inspections").insert({thread_id:threadId,created_by:auth.user.id,proposed_at:proposedAt.toISOString()}).select("id,proposed_at,status").single();
  if(error)return Response.json({error:"Inspection could not be requested."},{status:403});
  return Response.json({inspection:data,message:`Inspection requested for ${proposedAt.toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short",timeZone:"Africa/Lagos"})}`},{status:201});
}
