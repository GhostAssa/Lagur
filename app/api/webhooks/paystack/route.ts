import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime="nodejs";
export async function POST(request:Request){const secret=process.env.PAYSTACK_SECRET_KEY;const signature=request.headers.get("x-paystack-signature");if(!secret||!signature)return Response.json({error:"Unauthorized"},{status:401});const raw=await request.text();const expected=createHmac("sha512",secret).update(raw).digest("hex");const left=Buffer.from(signature,"hex"),right=Buffer.from(expected,"hex");if(left.length!==right.length||!timingSafeEqual(left,right))return Response.json({error:"Unauthorized"},{status:401});let event:Record<string,any>;try{event=JSON.parse(raw);}catch{return Response.json({error:"Invalid event"},{status:400});}const admin=createAdminClient();if(!admin)return Response.json({error:"Webhook service unavailable"},{status:503});const data=event.data??{};
 if(event.event==="charge.success"){
   const reference=String(data.reference??"");if(!reference)return Response.json({received:true});
   const result=await admin.rpc("fulfill_paystack_checkout",{p_reference:reference,p_amount:Number(data.amount),p_currency:String(data.currency??""),p_subscription_code:data.subscription?.subscription_code??data.subscription_code??null});
   if(result.error)return Response.json({error:"Payment confirmation could not be saved."},{status:500});
   if(result.data?.reason==="checkout not found"&&data.subscription_code){const renewal=await admin.rpc("fulfill_paystack_renewal",{p_subscription_code:String(data.subscription_code),p_reference:reference,p_amount:Number(data.amount),p_currency:String(data.currency??"")});if(renewal.error)return Response.json({error:"Renewal confirmation could not be saved."},{status:500});}
   return Response.json({received:true});
 }
 if(event.event==="invoice.payment_failed"&&data.subscription?.subscription_code){await admin.from("subscriptions").update({status:"past_due"}).eq("provider_subscription_code",data.subscription.subscription_code);}
 if(event.event==="subscription.disable"&&data.subscription_code){await admin.from("subscriptions").update({status:"cancelled"}).eq("provider_subscription_code",data.subscription_code);}
 return Response.json({received:true});}
