import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function POST(request:Request){
  const auth=await requireApiUser();if(!auth.user)return auth.response;
  if(!rateLimit(`report:${auth.user.id}`,5,60*60_000).allowed)return Response.json({error:"You have sent several reports recently. Please try again later."},{status:429});
  const parsed=z.object({property_id:z.uuid(),reason:z.string().trim().min(10).max(1000)}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Choose a reason and add at least 10 characters."},{status:400});
  const supabase=await createClient();if(!supabase)return Response.json({error:"Reports are unavailable."},{status:503});
  const {error}=await supabase.from("reports").insert({property_id:parsed.data.property_id,reporter_id:auth.user.id,reason:parsed.data.reason});
  if(error)return Response.json({error:"The report could not be submitted."},{status:400});
  return Response.json({message:"Thank you. Your report has been sent to the review team."},{status:201});
}
