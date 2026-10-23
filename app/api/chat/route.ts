import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

const startSchema=z.object({property_id:z.uuid(),body:z.string().trim().min(1).max(4000)});
export async function POST(request:Request){
  const auth=await requireApiUser(["customer"]);if(!auth.user)return auth.response;
  if(!rateLimit(`chat:${auth.user.id}`,20,60_000).allowed)return Response.json({error:"Please wait before sending another message."},{status:429});
  const body=startSchema.safeParse(await request.json().catch(()=>null));if(!body.success)return Response.json({error:"Write a short message about the listing."},{status:400});
  const supabase=await createClient();if(!supabase)return Response.json({error:"Messaging is unavailable."},{status:503});
  const {data:property}=await supabase.from("properties").select("id,agency_id,agencies(owner_id)").eq("id",body.data.property_id).eq("status","verified").single();
  const propertyRecord = property as any;
  const agent=Array.isArray(propertyRecord?.agencies)?propertyRecord.agencies[0]?.owner_id:propertyRecord?.agencies?.owner_id;
  if(!property || !agent)return Response.json({error:"This listing is not available for messaging."},{status:404});
  let {data:thread}=await supabase.from("chat_threads").select("id").eq("property_id",property.id).eq("customer_id",auth.user.id).maybeSingle();
  if(!thread){const created=await supabase.from("chat_threads").insert({property_id:property.id,customer_id:auth.user.id,agent_id:agent}).select("id").single();thread=created.data;if(created.error)return Response.json({error:"Could not start a conversation."},{status:400});}
  const threadId = thread?.id;
  if(!threadId)return Response.json({error:"Could not start a conversation."},{status:400});
  const result=await supabase.from("messages").insert({thread_id:threadId,sender_id:auth.user.id,body:body.data.body}).select("id,thread_id,body,created_at").single();
  if(result.error)return Response.json({error:"Your message could not be sent."},{status:400});
  return Response.json({thread_id:threadId,message:result.data},{status:201});
}
