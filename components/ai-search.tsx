"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Result = { id: string; title: string; description: string; category: string; type: string; city: string; state: string; price_kobo: number; bedrooms: number | null; plots: number | null; fixed_fee_kobo: number | null; property_media: Array<{url:string;alt:string}>; agencies: {business_name:string}|null };
type SearchReply = { results?: Result[]; results_intro?: string; limited?: boolean; message?: string; error?: string; allowance?: {used:number;limit:number;remaining:number} };

const naira = (kobo: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

export default function AiSearch() {
  const [prompt, setPrompt] = useState(""); const [reply, setReply] = useState<SearchReply|null>(null); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setReply(null);
    try { const response = await fetch("/api/ai/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) }); const data = await response.json(); setReply(data); }
    catch { setReply({ error: "Search could not be completed. Check your connection and try again." }); }
    finally { setLoading(false); }
  }
  return <section className="ai-search-panel"><div className="ai-search-heading"><p className="eyebrow">PLAIN WORDS, USEFUL MATCHES</p><h2>What are you<br/><span>looking for?</span></h2><p>Tell the assistant what matters. It searches approved listings and gives you filters to compare.</p></div><form className="ai-search-form" onSubmit={submit}><label htmlFor="ai-request">Describe the home you need</label><textarea id="ai-request" value={prompt} onChange={(event)=>setPrompt(event.target.value)} required minLength={5} maxLength={1000} placeholder="Room and parlor near campus, budget [amount]"/><div className="ai-search-actions"><span>Your request is used to find listings, not to give the assistant access to your account.</span><button className="primary-button" disabled={loading}>{loading?"Searching…":"Search with AI"}<span aria-hidden="true">→</span></button></div></form>
    {reply?.error && <p role="alert" className="form-error">{reply.error}</p>}{reply?.limited && <div className="allowance-notice"><strong>That’s today’s free allowance.</strong><p>{reply.message}</p><Link href="/search">Browse and filter listings</Link><Link href="/search/more">Get more searches</Link></div>}
    {reply?.results && <div className="ai-results"><div className="ai-result-header"><div><p className="eyebrow">VERIFIED MATCHES</p><h3>{reply.results_intro}</h3></div>{reply.allowance&&<span>{reply.allowance.remaining} free today</span>}</div><div className="result-groups">{["By company","By location","By type","By budget"].map((group)=>{const key=group==="By company"?"agencies":group==="By location"?"city":group==="By type"?"type":"price_kobo";return <span key={group}>{group}<b>{new Set(reply.results!.map((result)=>String((result as unknown as Record<string,unknown>)[key]??"Other"))).size}</b></span>})}</div>{reply.results.length===0?<p className="empty-state">Nothing matches yet. Try a different location or budget.</p>:<div className="listing-grid">{reply.results.map((item)=>{const photo=item.property_media?.[0];return <article className="listing-card" key={item.id}><Link href={`/listings/${item.id}`} className="listing-photo" aria-label={`View ${item.title}`}>{photo?<img src={photo.url} alt={photo.alt} loading="lazy"/>:<span className="listing-photo-placeholder">{item.type.replaceAll("_"," ")}</span>}<span className="verified-chip">✓ Verified documents</span></Link><div className="listing-card-body"><p className="eyebrow">{item.category} · {item.type.replaceAll("_"," ")}</p><h4><Link href={`/listings/${item.id}`}>{item.title}</Link></h4><p>{item.city}, {item.state}</p><strong>{naira(item.price_kobo)}</strong>{item.fixed_fee_kobo!==null&&<span className="fee-chip">Fixed fee: {naira(item.fixed_fee_kobo)}</span>}<small>{item.agencies?.business_name??"Verified agency"}</small><Link className="listing-card-link" href={`/listings/${item.id}`}>View home <span aria-hidden="true">→</span></Link></div></article>})}</div>}</div>}
  </section>;
}
