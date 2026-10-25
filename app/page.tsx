"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LoaderLink } from "@/components/loading/loader-link";
import Logo from "../components/logo";
import SparkleIcon from "../components/sparkle";
import LazyMediaVideo, { type MediaVideoSource } from "../components/lazy-media-video";

const optimizedMedia = "/media-optimized/videos/";
const mediaUrl = (filename: string) => `${optimizedMedia}${filename.split("/").map(encodeURIComponent).join("/")}`;

function AssetPicture({ small, large, width, height, alt, className, sizes }: {
  small: string;
  large: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
  sizes: string;
}) {
  const srcSet = `${mediaUrl(small)} 480w, ${mediaUrl(large)} ${width}w`;
  return (
    <picture className={className}>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img src={mediaUrl(large)} width={width} height={height} alt={alt} sizes={sizes} loading="lazy" decoding="async" />
    </picture>
  );
}

const heroVideoSources: MediaVideoSource[] = [
  { src: mediaUrl("house 2-1080p.webm"), type: "video/webm" },
  { src: mediaUrl("house 2-1080p.mp4"), type: "video/mp4" },
];

const featuredMedia = [
  {
    title: "Lagos",
    label: "01 / LAGOS",
    description: "Aerial view across Lagos.",
    kind: "video" as const,
    sources: [
      { src: mediaUrl("lagos-720p.webm"), type: "video/webm" as const },
      { src: mediaUrl("lagos-720p.mp4"), type: "video/mp4" as const },
    ],
    poster: mediaUrl("lagos-poster.webp"),
    videoLabel: "Aerial footage of the Lagos skyline and waterfront.",
    href: "/search?location=Lagos",
  },
  {
    title: "Surulere",
    label: "02 / SURULERE",
    description: "A residential building in Surulere.",
    kind: "image" as const,
    small: "Lagos Building, Surulere-480w.webp",
    large: "Lagos Building, Surulere-736w.webp",
    width: 736,
    height: 980,
    alt: "A two-storey residential building behind a garden and metal gate in Surulere.",
    href: "/search?location=Surulere",
  },
  {
    title: "Homes",
    label: "03 / RESIDENTIAL HOMES",
    description: "Contemporary homes in a residential estate.",
    kind: "image" as const,
    small: "VictoriaCrestHomes on Instagram_ _The beauty we…-480w.webp",
    large: "VictoriaCrestHomes on Instagram_ _The beauty we…-613w.webp",
    width: 613,
    height: 460,
    alt: "Modern homes with dark roofs, front lawns and driveways in a residential estate.",
    href: "/search?type=home",
  },
  {
    title: "Aerial view",
    label: "04 / NEIGHBOURHOODS",
    description: "A residential neighborhood seen from above.",
    kind: "video" as const,
    sources: [
      { src: mediaUrl("new-720p.webm"), type: "video/webm" as const },
      { src: mediaUrl("new-720p.mp4"), type: "video/mp4" as const },
    ],
    poster: mediaUrl("new-poster.webp"),
    videoLabel: "Aerial footage of a residential neighborhood among green hills.",
    href: "/search",
  },
];

// TODO(owner): These meme files show recognizable people and may be film or other copyrighted stills. Confirm identities, sources and public-use rights before launch.
const memes = [
  { file: "stress meme-729w.webp", width: 729, height: 588, alt: "A person sits on a low step with their head resting on one hand.", caption: "After weeks of house hunting", lagur: "Lagur: ask the AI once, get matches in minutes" },
  { file: "ano meme-633w.webp", width: 633, height: 438, alt: "A child cries with both hands pressed to their forehead.", caption: "When the house you wanted is already taken", lagur: "Lagur: listings show live availability" },
  { file: "look meme-735w.webp", width: 735, height: 589, alt: "A person in a green top gives a sideways look with one hand raised.", caption: "When the agent quotes a ridiculous fee", lagur: "Lagur: fixed fees by zone and property type" },
  { file: "double meme-720w.webp", width: 720, height: 462, alt: "A person in a checked shirt leans forward with a puzzled expression.", caption: "When the land you paid for belongs to someone else", lagur: "Lagur: documents reviewed, duplicate listings flagged" },
];

const audiences = [
  {
    title: "Renters",
    description: "See matches by company, location, type and budget, with commute time from the places you go.",
    detail: "Self-contained, room and parlor, and homes with room to grow.",
    art: "rent-art",
  },
  {
    title: "Buyers",
    description: "Explore verified homes and land, with fixed fees shown clearly on every listing.",
    detail: "Duplexes, bungalows, story buildings and land across Nigeria.",
    art: "buy-art",
  },
  {
    title: "Agents and companies",
    description: "List your properties with verified trust and chat with people ready to inspect.",
    detail: "Submit your documents and manage your listings in one place.",
    art: "agent-art",
  },
];

const services = [
  { title: "AI search", chips: ["Plain language", "Verified matches"], text: "Describe the home you need and compare a useful shortlist.", art: "service-search" },
  { title: "Verified documents", chips: ["CofO", "Survey plan", "Admin review"], text: "Listings are reviewed before they appear in search.", art: "service-docs" },
  { title: "Fixed fees", chips: ["By location", "By property type"], text: "See the fee attached to each listing, set from the fee table.", art: "service-fees" },
  { title: "Map", chips: ["Nigeria", "City to listing"], text: "Explore listings by place, with a layered map fallback.", art: "service-map" },
  { title: "Chat and inspect", chips: ["Message agent", "Request a date"], text: "Talk with the agent and agree when to view the property.", art: "service-chat" },
  { title: "Agent dashboard", chips: ["Add listings", "Review status"], text: "Manage property details, documents and listing status.", art: "service-agent" },
];

const questions = [
  ["How are fees set?", "The agent fee is fixed by location zone and property type. It comes from the fee table and cannot be changed by the agent."],
  ["How do you verify documents?", "Agents submit a Certificate of Occupancy, survey plan and supporting documents. An admin reviews them before a listing can go live."],
  ["Who pays?", "Customers browse for free and get a daily free allowance of AI searches. Additional AI searches are paid. Agents and companies host listings on a monthly plan."],
  ["How does the AI search work?", "Describe the home you need in plain words. The assistant turns that request into filters and searches verified listings."],
  ["Can I inspect before paying?", "Use in-app chat to arrange an inspection with the agent. Use a lawyer and a surveyor before you pay for a property."],
  ["Is my data safe?", "We limit access to account and listing information and store submitted property documents privately. The platform does not guarantee legal title."],
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span className="arrow-icon" aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
}

function PlusMark() { return <span className="plus-mark" aria-hidden="true">+</span>; }

function AudienceArtwork({ audience, desktop = false }: { audience: (typeof audiences)[number]; desktop?: boolean }) {
  const isBuyer = audience.title === "Buyers";
  return (
    <div className={`audience-art ${audience.art}${desktop ? " audience-art-desktop" : ""}${isBuyer ? " has-photo" : ""}`} role="img" aria-label={isBuyer ? "Modern homes in a residential estate." : `Illustration for ${audience.title}`}>
      {isBuyer ? (
        <AssetPicture
          className="audience-art-photo"
          small="VictoriaCrestHomes on Instagram_ _The beauty we…-480w.webp"
          large="VictoriaCrestHomes on Instagram_ _The beauty we…-613w.webp"
          width={613}
          height={460}
          alt="Modern homes with dark roofs, front lawns and driveways in a residential estate."
          sizes="(max-width: 760px) 88vw, 50vw"
        />
      ) : (
        <><div className="audience-building"><i /><i /><i /><span /></div><span className="audience-art-caption">PROPERTY SEARCH</span></>
      )}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAudience, setActiveAudience] = useState<number | null>(0);
  const [activeMeme, setActiveMeme] = useState(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const memeTrack = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = memeTrack.current;
    if (!track) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActiveMeme(Number((entry.target as HTMLElement).dataset.memeIndex));
      }
    }, { root: track, threshold: 0.65 });
    track.querySelectorAll<HTMLElement>("[data-meme-index]").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const scrollToMeme = (index: number) => {
    const card = memeTrack.current?.querySelector<HTMLElement>(`[data-meme-index="${index}"]`);
    card?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest", inline: "center" });
  };

  useEffect(() => {
    let previousY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        if (header.current) {
          header.current.classList.toggle("nav-hidden", currentY > 180 && currentY > previousY + 4);
          if (currentY < 120 || currentY < previousY - 4) header.current.classList.remove("nav-hidden");
        }
        previousY = currentY;
        frame = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onPointer = (event: PointerEvent) => {
      if (!cursor.current) return;
      cursor.current.classList.add("is-visible");
      cursor.current.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY + 12}px, 0)`;
    };
    if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const focusables = () => Array.from(document.querySelectorAll<HTMLElement>(".mobile-menu a, .mobile-menu button"));
    focusables()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); menuButton.current?.focus(); };
  }, [menuOpen]);

  return <main id="top">
    <span className="custom-cursor" ref={cursor} aria-hidden="true"><SparkleIcon size={16} /></span>
    <header ref={header} className="site-header">
      <nav className="nav-pill" aria-label="Main navigation">
        <a className="wordmark" href="#top" aria-label="Lagur home"><Logo /></a>
        <div className="desktop-nav">
          <details className="nav-dropdown"><summary>Rent <span>⌄</span></summary><div><a href="#rent">Rooms and apartments</a><a href="#rent">Browse rentals</a></div></details>
          <details className="nav-dropdown"><summary>Buy <span>⌄</span></summary><div><a href="#buy">Homes for sale</a><a href="#buy">Browse properties</a></div></details>
          <details className="nav-dropdown"><summary>Land <span>⌄</span></summary><div><a href="#land">Find land</a><a href="#land">Browse locations</a></div></details>
          <details className="nav-dropdown"><summary>For agents <span>⌄</span></summary><div><a href="/sign-up?role=agent">List a property</a><a href="#agents">Verification</a></div></details>
          <details className="nav-dropdown"><summary>Resources <span>⌄</span></summary><div><a href="#how-it-works">How it works</a><a href="#safety">Trust and safety</a></div></details>
        </div>
        <LoaderLink className="nav-cta" href="/sign-up?role=customer">Get Started <Arrow /></LoaderLink>
        <button ref={menuButton} className="mobile-menu-trigger" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><span /><span /></button>
      </nav>
    </header>

    {menuOpen && <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Main menu" onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}>
      <div className="mobile-menu-sheet"><div className="mobile-menu-head"><a className="wordmark" href="#top" aria-label="Lagur home" onClick={() => setMenuOpen(false)}><Logo /></a><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">Close <span>×</span></button></div>
        <div className="mobile-menu-links">{[["Rent", "#rent"], ["Buy", "#buy"], ["Land", "#land"], ["For agents", "#agents"], ["Resources", "#how-it-works"]].map(([title, href], index) => <a href={href} onClick={() => setMenuOpen(false)} key={title}><span>0{index + 1}</span>{title}<Arrow diagonal /></a>)}</div>
        <LoaderLink className="mobile-menu-cta" href="/sign-up?role=customer" onClick={() => setMenuOpen(false)}>Get Started <Arrow /></LoaderLink>
      </div>
    </div>}

    <section className="hero-area" aria-labelledby="hero-title">
      <div className="hero-shell">
        <span className="hero-glow hero-glow-a" aria-hidden="true" />
        <span className="hero-glow hero-glow-b" aria-hidden="true" />
        <PlusMark />
        <SparkleIcon className="hero-sparkle twinkle" size={19} />
        <p className="eyebrow reveal">AI-POWERED HOUSE HUNTING</p>
        <h1 className="reveal" id="hero-title">Find your <span>next home</span><br />without the walking.</h1>
        <form className="search-box reveal" action="/search" id="search">
          <label htmlFor="home-search">Good morning, what are you looking for?</label>
          <div className="search-row"><input id="home-search" name="q" placeholder="Room and parlor near campus, budget [amount]" /><button type="submit">Search <Arrow /></button></div>
        </form>
        <div className="hero-annotation font-accent"><span>Just tell the AI!</span><svg viewBox="0 0 112 58" aria-hidden="true"><path d="M108 5C69 2 44 13 32 35 27 44 17 48 5 49m0 0 12-1m-12 1 6-10" /></svg></div>
        <div className="hero-feature-row reveal">
          <div className="hero-stat"><span className="stat-arrow" aria-hidden="true">↘</span><PlusMark /><strong>89%</strong><span className="stat-caption">Easy shortlist</span><span className="stat-subcaption">Homes within a 30-minute commute</span></div>
          <div className="hero-poster"><LazyMediaVideo className="hero-poster-video" sources={heroVideoSources} poster={mediaUrl("house 2-poster.webp")} label="Aerial video gliding above a residential neighborhood." /></div>
          <div className="hero-aside"><p>We bring every listing, and the agent, into one conversation.</p><LoaderLink className="green-cta" href="/sign-up?role=customer">I'm looking for a home <Arrow /></LoaderLink></div>
        </div>
      </div>
    </section>

    <section className="partners-section" aria-label="Designed for property professionals across Nigeria">
      <div className="partners-inner"><span>MADE FOR PEOPLE MOVING IN NIGERIA</span><div className="partner-badges"><i>RENT</i><i>BUY</i><i>LAND</i><i>AGENT</i><i>COMPANY</i><i>INSPECT</i></div></div>
    </section>

    <section className="who-section" id="who" aria-labelledby="who-title">
      <div className="who-inner">
        <div className="who-heading reveal"><p className="eyebrow">A CLEARER WAY HOME</p><h2 id="who-title">Who <span className="title-gradient">it’s for</span><PlusMark /><SparkleIcon className="heading-sparkle twinkle" size={15} /></h2></div>
        <div className="who-layout">
          <div className="audience-list">
            {audiences.map((audience, index) => <article className={`audience-item reveal${activeAudience === index ? " is-active" : ""}`} key={audience.title}>
              <button type="button" aria-expanded={activeAudience === index} aria-controls={`audience-detail-${index}`} onMouseEnter={() => setActiveAudience(index)} onFocus={() => setActiveAudience(index)} onClick={() => setActiveAudience(activeAudience === index ? null : index)}>
                <span className="audience-index">0{index + 1}</span><span className="audience-title">{audience.title}</span><span className="audience-plus" aria-hidden="true">{activeAudience === index ? "−" : "+"}</span>
              </button>
              <div className="audience-mobile-detail" id={`audience-detail-${index}`} hidden={activeAudience !== index}>
                <p>{audience.description}</p><p className="audience-detail-small">{audience.detail}</p>
                <AudienceArtwork audience={audience} />
              </div>
            </article>)}
          </div>
          <aside className="audience-preview" aria-live="polite">
            {activeAudience === null ? <div className="preview-placeholder"><PlusMark /><span>Choose who you are searching for</span></div> : <>
              <AudienceArtwork audience={audiences[activeAudience]} desktop />
              <div className="audience-preview-copy"><p className="eyebrow">0{activeAudience + 1} / {audiences[activeAudience].title.toUpperCase()}</p><p>{audiences[activeAudience].description}</p><span>{audiences[activeAudience].detail}</span></div>
            </>}
          </aside>
        </div>
      </div>
    </section>

    <section className="trusted-section" aria-labelledby="trusted-title">
      <div className="trusted-heading"><p className="eyebrow">A NETWORK BUILT AROUND VERIFIED LISTINGS</p><h2 id="trusted-title">Trusted by <span>350+</span><br />agencies across Nigeria</h2><p>Helping buyers, renters and developers compare the right moves in one place.</p></div>
      <div className="agency-marquee" aria-label="Agency name placeholders"><div className="marquee-track">{Array.from({ length: 2 }, (_, loop) => <div className="marquee-group" aria-hidden={loop === 1} key={loop}>{["Lagos Homes", "Property Care", "City Crest", "Urban Nest", "Prime Living"].map((name, i) => <span key={`${loop}-${i}`}>{name}</span>)}</div>)}</div></div>
    </section>

    <section className="featured-section" aria-labelledby="featured-title">
      <div className="featured-heading"><div><p className="eyebrow">LISTINGS WITH CONTEXT</p><h2 id="featured-title">Places and homes<br /><span>in focus.</span></h2></div><p>Get a feel for the places and homes customers can search across Nigeria.</p></div>
      <div className="featured-stack">
        {featuredMedia.map((item, index) => <article className={`featured-card featured-card-${index + 1}`} key={item.title}>
          {item.kind === "video" ? <LazyMediaVideo className="featured-card-media" sources={item.sources} poster={item.poster} label={item.videoLabel} /> : <AssetPicture className="featured-card-picture" small={item.small} large={item.large} width={item.width} height={item.height} alt={item.alt} sizes="(max-width: 760px) 90vw, 70vw" />}
          <div className="featured-overlay"><span className="featured-index">{item.label}</span><h3>{item.title}</h3><p>{item.description}</p><a href={item.href}>Explore listings <Arrow /></a></div>
        </article>)}
      </div>
    </section>

    <section className="services-section" id="services" aria-labelledby="services-title">
      <div className="services-heading"><div><p className="eyebrow">A CLEARER WAY TO FIND A HOME</p><h2 id="services-title">What we <span>bring together.</span></h2></div><span className="services-hint">Scroll to explore <Arrow /></span></div>
      <div className="services-pin"><div className="services-track">{services.map((service, index) => <article className="service-card" key={service.title}><div className={`service-art ${service.art}`} aria-hidden="true"><span className="art-orbit"/><span className="art-object"><i/><i/><i/></span><span className="art-glint">+</span></div><div className="service-content"><span className="service-number">0{index + 1}</span><h3>{service.title}</h3><p>{service.text}</p><div className="service-chips">{service.chips.map((chip) => <span key={chip}>{chip}</span>)}</div></div></article>)}</div></div>
    </section>

    <section className="outro-section" aria-label="Property search preview"><div className="outro-frame"><LazyMediaVideo className="outro-video" sources={[{ src: mediaUrl("houses-720p.webm"), type: "video/webm" }, { src: mediaUrl("houses-720p.mp4"), type: "video/mp4" }]} poster={mediaUrl("houses-poster.webp")} label="Aerial video over a residential estate of detached homes." /><span className="outro-video-shade" aria-hidden="true"/><div className="outro-map" aria-hidden="true"><span/><i>+</i><i>+</i><i>+</i></div><div className="outro-copy"><p className="eyebrow">A CLEARER WAY TO SEARCH</p><h2>Find a place<br /><span>worth seeing.</span></h2><p>One conversation can take you from a plain-language search to a real inspection.</p><a href="/search">Start exploring <Arrow /></a></div><span className="outro-caption">AERIAL VIEW OF A RESIDENTIAL ESTATE</span></div></section>
    <section className="journey-section" id="how-it-works" aria-labelledby="journey-title">
      <div className="journey-inner">
        <header className="journey-heading reveal">
          <p className="eyebrow">FROM FIRST THOUGHT TO FRONT DOOR</p>
          <h2 id="journey-title">One clear path<br /><span>to your next move.</span><SparkleIcon className="heading-sparkle twinkle" size={18} /></h2>
          <p>Customers and property professionals meet through verified listings, thoughtful search and a conversation that leads to an inspection.</p>
          <div className="journey-roles"><a href="#customer-path">For customers <Arrow /></a><a href="#agent-path">For agents and companies <Arrow /></a></div>
        </header>

        <div className="journey-track" id="customer-path">
          <svg className="journey-route" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
            <path className="journey-route-base" d="M50 0 C50 55 82 65 76 120 C70 175 22 190 25 250 C28 310 79 325 75 385 C71 445 24 460 26 520 C28 580 79 595 75 655 C71 715 23 730 26 790 C29 850 69 865 50 1000" />
            <path className="journey-route-progress" d="M50 0 C50 55 82 65 76 120 C70 175 22 190 25 250 C28 310 79 325 75 385 C71 445 24 460 26 520 C28 580 79 595 75 655 C71 715 23 730 26 790 C29 850 69 865 50 1000" />
          </svg>
          <div className="journey-stop stop-one reveal"><span className="stop-marker">01</span><article className="journey-card"><p className="eyebrow">CUSTOMER · START HERE</p><h3>Tell us what home means to you.</h3><p>Sign in as a customer, then describe what you need in everyday words: a room and parlor near campus, your budget, and the places you travel to.</p><div className="journey-prompt"><span>YOUR SEARCH</span><strong>Room and parlor near campus, budget [amount]</strong><Arrow /></div></article></div>
          <div className="journey-stop stop-two reveal"><span className="stop-marker">02</span><article className="journey-card"><p className="eyebrow">AI SEARCH</p><h3>Your words become a useful shortlist.</h3><p>The assistant turns your request into search filters and looks through verified listings. Results are grouped by company, location, type and budget, then ranked to help you compare.</p><div className="journey-tags"><span>By company</span><span>By location</span><span>By type</span><span>By budget</span></div></article></div>
          <div className="agent-join reveal" id="agent-path"><div className="agent-join-line"><span>THE TWO SIDES MEET HERE</span><i /></div><div className="agent-join-card"><div className="agent-join-index">AGENT / COMPANY <span>01</span></div><div><h3>Professionals add the homes behind each match.</h3><p>Agents and companies create an account with business details, add property information and photos, then submit a Certificate of Occupancy, survey plan and supporting documents for review.</p><LoaderLink href="/sign-up?role=agent">List your properties <Arrow /></LoaderLink></div><div className="document-stack" aria-hidden="true"><span>PROPERTY DETAILS <b>READY</b></span><span>Survey plan <b>UPLOADED</b></span><span>Documents <b>FOR REVIEW</b></span></div></div></div>
          <div className="journey-stop stop-three reveal"><span className="stop-marker">03</span><article className="journey-card"><p className="eyebrow">REVIEW AND TRUST</p><h3>A listing is reviewed before it goes live.</h3><p>Submitted documents are checked by an admin, and duplicate parcels are flagged. Only approved listings appear in search. Fixed agent fees come from the property's location zone and type.</p><div className="verification-stamp"><span aria-hidden="true">✓</span><div><strong>Verified documents</strong><small>Reviewed before publication</small></div></div></article></div>
          <div className="journey-stop stop-four reveal"><span className="stop-marker">04</span><article className="journey-card"><p className="eyebrow">CUSTOMER · COMPARE</p><h3>Choose with the details in view.</h3><p>Open a match to see its location, property type, price, fixed fee and document status. Compare the options that fit your budget and the places you need to reach.</p><div className="listing-mini"><span className="listing-mini-image"><i /></span><span><b>[PROPERTY TYPE]</b><small>[LOCATION] · [PRICE]</small></span><em>Fixed fee: [amount]</em></div></article></div>
          <div className="journey-stop stop-five reveal"><span className="stop-marker">05</span><article className="journey-card"><p className="eyebrow">A DIRECT CONNECTION</p><h3>Chat with the agent. Arrange a visit.</h3><p>Start an in-app conversation from the listing. Suggest an inspection day; the agent can confirm or suggest another time. You can discuss the home before you travel.</p><div className="chat-preview"><span className="chat-avatar">A</span><span><b>Agent</b><small>Inspection requested for [date]</small></span><span className="chat-bubble">Let’s arrange a time.</span></div></article></div>
        </div>

        <div className="journey-notes reveal" id="safety"><span className="journey-notes-icon">i</span><p><strong>Search at your pace.</strong> Browsing is free and customers have a daily free allowance of AI searches. Additional AI searches are paid. The platform reviews submitted documents and detects duplicate listings, but does not guarantee legal title. Use a lawyer and a surveyor before you pay.</p></div>
      </div>
    </section>

    <section className="program-section" aria-labelledby="program-title"><div className="program-heading"><p className="eyebrow">A SIMPLE THREE-STEP SEARCH</p><h2 id="program-title">From a question<br /><span>to a viewing.</span></h2></div><div className="program-grid"><article><span>01</span><p className="eyebrow">ASK THE AI</p><h3>Describe what you need.</h3><p>Your words shape the search filters and the matches you see.</p></article><article><span>02</span><p className="eyebrow">COMPARE SMARTLY</p><h3>Review verified options.</h3><p>Compare by company, location, type, budget and fixed fee.</p></article><article><span>03</span><p className="eyebrow">CHAT AND INSPECT</p><h3>Talk, then arrange a visit.</h3><p>Message the agent and agree a day to inspect the property.</p></article></div></section>

    <section className="memes-section" aria-labelledby="memes-title">
      <div className="meme-heading"><p className="eyebrow">SOUND FAMILIAR?</p><h2 id="memes-title">House hunting without Lagur:<br /><span>Sound familiar?</span></h2><p>We've all been there.</p></div>
      <div className="meme-track" ref={memeTrack} aria-label="House-hunting situations and how Lagur helps">
        {memes.map((meme, index) => <article className={`meme-card meme-card-${index + 1}`} data-meme-index={index} key={meme.file}>
          <div className="meme-image-frame"><Image src={mediaUrl(meme.file)} alt={meme.alt} width={meme.width} height={meme.height} sizes="(max-width: 760px) 82vw, 42vw" unoptimized className="meme-image" /></div>
          <p className="meme-caption">{meme.caption}</p>
          <p className="meme-benefit"><SparkleIcon size={15} /><span>{meme.lagur}</span></p>
        </article>)}
      </div>
      <div className="meme-dots" role="group" aria-label="Choose a meme">
        {memes.map((meme, index) => <button key={meme.file} type="button" aria-label={`Show meme ${index + 1}`} aria-current={activeMeme === index ? "true" : undefined} onClick={() => scrollToMeme(index)} />)}
      </div>
    </section>
    {/* Real testimonials stay here until customers provide publishable stories.
        <section className="testimonials-section" aria-labelledby="testimonials-title"><div className="testimonial-heading"><p className="eyebrow">CUSTOMER STORIES</p><h2 id="testimonials-title">Hear from [people]<br /><span>we’ve helped.</span></h2><p>Stories will appear here as customers choose to share them.</p></div><div className="testimonial-cards"><article className="testimonial-card testimonial-left"><span className="quote-mark">“</span><p>[CUSTOMER QUOTE]</p><small>[CUSTOMER NAME] · [CITY]</small><div className="testimonial-media"><span>▶</span><b>[CUSTOMER STORY]</b></div></article><article className="testimonial-card testimonial-right"><span className="quote-mark">“</span><p>[CUSTOMER QUOTE]</p><small>[CUSTOMER NAME] · [CITY]</small><div className="testimonial-media media-green"><span>▶</span><b>[CUSTOMER STORY]</b></div></article></div></section>
    */}

    <section className="faq-section" aria-labelledby="faq-title"><div className="faq-heading"><p className="eyebrow">GOOD TO KNOW</p><h2 id="faq-title">Answers to<br /><span>popular questions.</span><SparkleIcon className="heading-sparkle twinkle" size={18} /></h2></div><div className="faq-list">{questions.map(([question, answer], index) => <details className="faq-item" key={question} open={index === 0}><summary><h4>{question}</h4><i aria-hidden="true"><Arrow /></i></summary><div className="faq-answer"><p>{answer}</p></div></details>)}</div></section>

    <section className="sign-in-section" aria-labelledby="sign-in-title">
      <div className="signin-glow glow-a" /><div className="signin-glow glow-b" />
      <div className="cta-sparkles" aria-hidden="true"><SparkleIcon size={18} /><SparkleIcon size={11} /><SparkleIcon size={14} /><SparkleIcon size={9} /></div>
      <div className="signin-card reveal"><div className="signin-orbit orbit-one" /><div className="signin-orbit orbit-two" />
        <p className="eyebrow">YOUR NEXT MOVE STARTS HERE</p>
        <h2 id="sign-in-title">Where your next home<br /><span>gets found.</span></h2>
        <p className="signin-copy">Sign in to access your Lagur search, explore verified listings and speak with the agent. New here? Get started as a customer, agent or company.</p>
        <div className="signin-actions"><LoaderLink className="signin-primary" href="/sign-up?role=customer">Get Started <Arrow /></LoaderLink><LoaderLink className="signin-secondary" href="/sign-in">Sign in <Arrow /></LoaderLink></div>
        <div className="signin-agent">Listing homes instead? <LoaderLink href="/sign-up?role=agent">Join as an agent or company <Arrow /></LoaderLink></div>
        <span className="signin-footnote">Verified listings. Fixed fees. A clearer way home.</span>
      </div>
    </section>

    <footer className="site-footer"><div className="footer-waves" aria-hidden="true"><i/><i/><i/></div><div className="footer-content"><div className="footer-brand"><a className="wordmark" href="#top" aria-label="Lagur home"><Logo variant="light" /></a><div className="footer-social"><a href="#top" aria-label="Social link placeholder">in</a><a href="#top" aria-label="Social link placeholder">◎</a><a href="#top" aria-label="Social link placeholder">×</a></div><small>© 2026 Lagur. Verified listings. Fixed fees.</small></div><div className="footer-links"><div><span>Explore</span><a href="#services">How it works</a><a href="#who">Rent</a><a href="#who">Buy</a><a href="#who">Land</a></div><div><span>Site map</span><a href="#featured-title">Agencies</a><a href="#services">Services</a><a href="#faq-title">FAQs</a><a href="/sign-up?role=agent">List a property</a></div><div><span>Secure</span><a href="#safety">Trust and safety</a><a href="#safety">Privacy</a><a href="#safety">Terms</a></div></div></div><div className="footer-large-logo" aria-hidden="true"><Logo variant="light" /></div></footer>
  </main>;
}
