import Link from "next/link";
import { notFound } from "next/navigation";
import Conversation from "@/components/conversation";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export default async function ChatPage({params}:{params:Promise<{threadId:string}>}){const {threadId}=await params;const user=await requireUser();const supabase=await createClient();const {data:thread}=await supabase?.from("chat_threads").select("id,property_id,customer_id,agent_id,properties(title,city,state)").eq("id",threadId).single()??{data:null};if(!thread)notFound();const [messageResult,inspectionResult]=await Promise.all([supabase!.from("messages").select("id,sender_id,body,created_at").eq("thread_id",threadId).order("created_at"),supabase!.from("inspections").select("id,proposed_at,status,response_note,created_by").eq("thread_id",threadId).order("created_at",{ascending:false})]);const property=Array.isArray(thread.properties)?thread.properties[0]:thread.properties;
 return <AppShell user={user}><div className="chat-page-heading"><Link href="/inbox" className="back-link">← Inbox</Link><p className="eyebrow">{user.id===thread.customer_id?"AGENT CONVERSATION":"CUSTOMER CONVERSATION"}</p><h1>{property?.title??"Property"}</h1><p>{property?.city}, {property?.state}</p></div><Conversation threadId={thread.id} userId={user.id} agentId={thread.agent_id} initialMessages={messageResult.data??[]} initialInspections={inspectionResult.data??[]}/></AppShell>;
}
