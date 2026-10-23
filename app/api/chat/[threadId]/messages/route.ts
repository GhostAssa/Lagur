import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function POST(request:Request,{params}:{params:Promise<{threadId:string}>}){
  const auth=await requireApiUser();if(!auth.user)return auth.response;
  if(!rateLimit(`chat:${auth.user.id}`,20,60_000).allowed)return Response.json({error:"Please wait before sending another message."},{status:429});
  const {threadId}=await params;if(!z.uuid().safeParse(threadId).success)return Response.json({error:"Conversation not found."},{status:404});
  const parsed=z.object({body:z.string().trim().min(1).max(4000)}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Write a message up to 4,000 characters."},{status:400});
  const supabase=await createClient();if(!supabase)return Response.json({error:"Messaging is unavailable."},{status:503});
  const {data,error}=await supabase.from("messages").insert({thread_id:threadId,sender_id:auth.user.id,body:parsed.data.body}).select("id,thread_id,sender_id,body,created_at").single();
  if(error)return Response.json({error:"Message could not be sent."},{status:403});
  return Response.json({message:data},{status:201});
}
