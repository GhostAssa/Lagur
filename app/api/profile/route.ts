import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request:Request){const auth=await requireApiUser();if(!auth.user)return auth.response;if(!rateLimit(`profile:${auth.user.id}`,10,60_000).allowed)return Response.json({error:"Please wait before saving again."},{status:429});const parsed=z.object({full_name:z.string().trim().min(2).max(100),phone:z.string().trim().min(7).max(24)}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Check your name and phone number."},{status:400});const supabase=await createClient();if(!supabase)return Response.json({error:"Profile is unavailable."},{status:503});const {error}=await supabase.from("users").update({full_name:parsed.data.full_name,phone:parsed.data.phone}).eq("id",auth.user.id);if(error)return Response.json({error:"Your details could not be saved."},{status:400});return Response.json({ok:true});}
