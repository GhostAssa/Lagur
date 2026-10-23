import { z } from "zod";
import { requireApiUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request:Request,{params}:{params:Promise<{propertyId:string}>}){
  const auth=await requireApiUser(["customer"]);if(!auth.user)return auth.response;
  const {propertyId}=await params;if(!z.uuid().safeParse(propertyId).success)return Response.json({error:"Listing not found."},{status:404});
  const supabase=await createClient();if(!supabase)return Response.json({error:"Saved listings are unavailable."},{status:503});
  const {data:existing}=await supabase.from("saved_properties").select("property_id").eq("user_id",auth.user.id).eq("property_id",propertyId).maybeSingle();
  if(existing){const {error}=await supabase.from("saved_properties").delete().eq("user_id",auth.user.id).eq("property_id",propertyId);if(error)return Response.json({error:"Could not update saved homes."},{status:400});return Response.json({saved:false});}
  const {error}=await supabase.from("saved_properties").insert({user_id:auth.user.id,property_id:propertyId});
  if(error)return Response.json({error:"Could not save this home."},{status:400});return Response.json({saved:true});
}
