import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

const feeSchema=z.object({id:z.uuid().optional(),zone_tier:z.enum(["standard","hot_zone","place_of_interest"]),property_type:z.string().trim().min(2).max(80),fixed_fee_naira:z.number().int().nonnegative().max(10_000_000),active:z.boolean()});
export async function PUT(request:Request){
  const auth=await requireApiUser(["admin"]);if(!auth.user)return auth.response;
  if(!rateLimit(`fees:${auth.user.id}`,20,60_000).allowed)return Response.json({error:"Wait before making more fee changes."},{status:429});
  const parsed=feeSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Check the fee values."},{status:400});
  const supabase=await createClient();if(!supabase)return Response.json({error:"Fee table is unavailable."},{status:503});
  const {id,...input}=parsed.data;const row={...input,fixed_fee_kobo:input.fixed_fee_naira*100};delete (row as Partial<typeof row>).fixed_fee_naira;
  const result=id?await supabase.from("fee_table").update(row).eq("id",id).select().single():await supabase.from("fee_table").upsert(row,{onConflict:"zone_tier,property_type"}).select().single();
  if(result.error)return Response.json({error:"Fee change could not be saved."},{status:400});
  return Response.json({fee:result.data});
}
