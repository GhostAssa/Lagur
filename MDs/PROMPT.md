# PROMPT.md

Master build prompt for Claude Code or Codex. Attach UI reference images of the two reference sites (desktop and phone) alongside this file.

---

You are building a mobile-first web app for the Nigerian property market: an AI-powered house-hunting platform where customers describe what they need, an AI assistant finds matching verified listings, and customers chat with agents to arrange inspections.

## Read first
Read these files in the project `docs/` folder, in this order: DESIGN.md, ARCHITECTURE.md, FEATURES.md, SECURITY.md, COPY.md. They are the source of truth. If something is unclear, make a sensible decision, state it, and keep going.

## Design: replicate the reference sites
The visual design must replicate the look, feel and scroll behaviour of:
- https://oftheoak.co.uk/ (primary reference)
- https://www.storeyarchitecture.co.uk/ (secondary reference)

Similar, not identical: do not copy their text, images, logos or proprietary code.

1. Open both sites at phone and desktop widths. Inspect them with DevTools and write your findings in `docs/reference-notes.md` (section order, spacing scale, type scale, container widths, every scroll effect, hover states).
2. Rebuild those patterns with Tailwind CSS, in the same utility-first, mobile-first style, using the tokens in DESIGN.md.
3. Result: minimalistic, beautiful, calm. Light mode only. Mostly white and green, dark green for emphasis, subtle sand-toned glassmorphism. No dark mode.

## Non-negotiables
- Mobile-first, smooth on a mid-range Android phone over 4G. Follow the performance budget in DESIGN.md.
- Scroll animations: CSS scroll-driven animations first, with static fallbacks; GSAP and Lenis only if truly needed. Respect `prefers-reduced-motion`.
- Map: MapLibre GL, lazy-loaded, with a layered SVG fallback. No video backgrounds.
- Fees are fixed by location zone and property type, read from the fee table. Agents cannot edit them.
- A listing cannot go live without submitted documents (CofO, survey plan, other) and admin approval. Detect duplicate parcels.
- Agents and companies pay a monthly plan to host. Customers browse free, get a daily free allowance of AI searches, and pay for additional AI searches. Read all amounts and the allowance from the `plans` table. Do not hardcode or display prices in copy.
- The AI assistant uses tool calling only, with validated arguments, and never has direct database access.
- Do not invent statistics, testimonials, or prices. Use placeholders in [brackets] from COPY.md.
- Follow SECURITY.md for every feature.

## Work plan
Follow the build order in ARCHITECTURE.md. After each step:
1. Run the app, lint and tests.
2. Compare the result to the reference sites on a phone-sized viewport and fix visible differences.
3. Commit with a clear message.

Start with: project setup, Tailwind tokens and fonts from DESIGN.md, the layout shell, and the landing page hero and scroll story. Show me the landing page before moving to the backend.

## Definition of done
- All MVP stories in FEATURES.md pass their acceptance criteria.
- The landing page and app screens match the reference feel at phone and desktop widths.
- The SECURITY.md checklist is addressed.
- `README.md` explains setup, environment variables (names only), and how to run tests.
