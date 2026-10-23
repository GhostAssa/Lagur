import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function POST(request:Request){
  const auth=await requireApiUser(["admin"]);if(!auth.user)return auth.response;
  if(!rateLimit(`admin-review:${auth.user.id}`,40,60_000).allowed)return Response.json({error:"Please wait before reviewing more listings."},{status:429});
  const parsed=z.object({property_id:z.uuid(),action:z.enum(["approve","reject","suspend"]),note:z.string().trim().max(1000).optional()}).safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:"Check the review action and notes."},{status:400});
  const supabase=await createClient();if(!supabase)return Response.json({error:"Review service is unavailable."},{status:503});
  const {data,error}=await supabase.rpc("review_property",{p_property_id:parsed.data.property_id,p_action:parsed.data.action,p_note:parsed.data.note??null});
  if(error)return Response.json({error:error.message.includes("required")||error.message.includes("document")||error.message.includes("duplicate")?error.message:"The review could not be completed."},{status:400});
  return Response.json({result:data});
}
