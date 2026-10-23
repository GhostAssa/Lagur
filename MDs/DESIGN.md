# DESIGN.md

Design system for the PropTech house-hunting web app (mobile-first web app, Nigeria).

## 1. Design intent

Replicate the look, feel and motion of these two reference sites. Match their structure, spacing rhythm, typography feel and scroll behaviour. Make it similar, not identical.

- https://oftheoak.co.uk/ is the primary reference. Calm, story-led, spacious, confident.
- https://www.storeyarchitecture.co.uk/ is the secondary reference. Editorial, numbered sections, stacked cards, thin lines, tactile details.

Do NOT copy their text, images, logos, brand marks or proprietary code. Re-create the patterns with our own content.

**Before writing any UI code**, open both sites on a phone-sized viewport and a desktop viewport, then use browser DevTools to inspect and write down in `docs/reference-notes.md`:
1. Section order on each page and what each section does
2. The spacing scale (section padding, gaps between elements)
3. The type scale (sizes, weights, line heights, letter spacing) and how headings relate to body text
4. Container widths and grid behaviour at mobile, tablet and desktop
5. Every scroll effect (what moves, when it starts and ends, easing)
6. Hover, focus and tap states for links, buttons and cards
7. How images are cropped and revealed

Then rebuild those patterns in Tailwind CSS using the tokens below. Use the same utility-first Tailwind style, with mobile-first classes (`base`, then `md:`, then `lg:`) and arbitrary values only for custom effects.

**Overall feel:** minimalistic, beautiful, calm. Lots of white space, large quiet typography, one accent colour, subtle glass.

## 2. Mode and palette

**Light mode only.** Mostly white and green, dark green for emphasis, and subtle sand-toned glass. No dark mode, no black backgrounds, no neon.

| Token | Hex | Use |
|---|---|---|
| white | #FFFFFF | Main page background |
| mist | #F7F8F5 | Alternate section background |
| sand-50 | #FAF6EE | Soft section wash |
| sand-100 | #F2EAD9 | Sand glass tint |
| sand-200 | #E7DABF | Sand borders and lines |
| green-100 | #DCEFE3 | Chips, soft fills |
| green-600 | #008751 | Nigerian green: large fills, icons, accents |
| green-700 | #1B6B43 | Buttons with white text, links |
| green-800 | #145233 | Hover states, strong headings |
| green-900 | #0F3D26 | Dark green sections and footer |
| green-950 | #0B2A1B | Deepest green, primary text on light areas |
| ink | #12201A | Body text |
| muted | #5B6B62 | Secondary text |

Rules:
- Body text: ink on white or mist. Never put muted text on glass without checking contrast (aim for WCAG AA).
- White text only on green-700 or darker.
- One accent per screen: green. Sand is a supporting tone, never a competing accent.

## 3. Glassmorphism (subtle)

Glass is a light touch. Use it for the nav bar, floating cards, the AI search box, filter panels and modals, and always over a soft gradient or an image so the blur is visible.

```
glass-white  : bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_rgba(15,61,38,0.08)]
glass-sand   : bg-sand-100/55 backdrop-blur-lg border border-sand-200/70 shadow-[0_8px_32px_rgba(120,100,60,0.10)]
glass-green  : bg-green-900/80 backdrop-blur-xl border border-white/10 text-white   (use sparingly, e.g. footer CTA)
```

- Provide a solid fallback when `backdrop-filter` is unsupported (`@supports not (backdrop-filter: blur(1px))` use `bg-white/95`).
- Maximum two glass layers on screen at once. Keep blur at or below 24px for performance on low-end phones.

## 4. Typography

- Display: **Instrument Serif** (or a similar refined serif if unavailable). Large, tight line height (1.0 to 1.1), regular weight.
- Body and UI: **DM Sans**, weights 400 and 500.
- Load with `next/font` and `display: swap`.
- Scale (mobile to desktop): hero `text-5xl md:text-7xl lg:text-8xl`; section title `text-4xl md:text-6xl`; statement text `text-3xl md:text-5xl`; body `text-base md:text-lg`; labels `text-xs tracking-[0.25em] uppercase`.

## 5. Layout and spacing

- Mobile-first. Design at 390px wide first, then scale up.
- Container: `mx-auto w-full max-w-6xl px-6 md:px-10`.
- Section rhythm: `py-20 md:py-32`. Gaps on a 4/8 spacing scale.
- Thin 1px lines in `sand-200` between list rows and sections, as on the Storey reference.
- Rounded corners: `rounded-2xl` for cards, `rounded-full` for buttons and chips, `rounded-3xl` for large feature cards.
- Touch targets at least 44px high.

## 6. Components

- **Nav:** sticky, glass-white, logo left, "Sign in" right, simple menu on mobile.
- **Buttons:** primary = `bg-green-700 text-white hover:bg-green-800 rounded-full px-6 min-h-[48px]`; secondary = `border border-green-700 text-green-700 rounded-full`. Subtle hover lift only.
- **AI search box:** large, glass-white, on the hero. Label: "Good morning, what are you looking for?". Shows a suggestion chip row below.
- **Listing card:** image, price, location, type chip, fixed-fee chip, verified badge (green check), commute chip, "Chat to inspect" button.
- **Verified badge:** green-100 pill with check icon and the text "Verified documents".
- **Fee chip:** sand-100 pill: "Fixed fee: [amount]" (amount comes from the fee table).
- **Chat:** assistant bubbles in glass-white, user bubbles in green-700 with white text.
- **Upload dropzone:** dashed `sand-200` border, document type labels (CofO, Survey plan, Other).
- **Section header pattern:** small uppercase label, large serif heading, one short paragraph.

## 7. Page structure (landing)

Follow the pacing of the reference sites:
1. Hero: serif headline, one sentence, AI search box. Headline fades and lifts away on scroll.
2. Statement: two large serif sentences that "light up" as the user scrolls.
3. Numbered steps (01 Ask, 02 Compare, 03 Chat and inspect) as stacked sticky cards.
4. Nigeria map section: layered tilted map that separates as it scrolls into view; city pins pulse softly.
5. Categories (Rent, Buy, Land): thin-line rows that wipe in from the left.
6. Trust section: Fixed fees, Verified documents, Fair plans (see COPY.md).
7. Closing call to action: sign up as a customer, or as an agent or company.
8. Footer: dark green, minimal.

## 8. Motion spec

Prefer CSS scroll-driven animations (`animation-timeline: view()` and `scroll()`), with a graceful fallback to static content. Add GSAP ScrollTrigger and Lenis only if a pinned or smooth-scroll effect cannot be done in CSS.

| Effect | Behaviour |
|---|---|
| Hero exit | opacity to 0, translateY up 70px, scale 0.95, over the exit range |
| Statement reveal | opacity from 0.16 to 1 across the entry range |
| Stacked cards | `position: sticky` with `top` offsets of 96px, 120px, 144px |
| Map layers | layers translate apart (0, 19px, 38px, 56px) as the section enters |
| Row wipe | `clip-path: inset(0 100% 0 0)` to `inset(0)` |
| Rise-in | opacity 0 to 1 and translateY 56px to 0 |
| Pin pulse | radius 4 to 18, opacity 0.9 to 0, 2.4s loop |
| Page transitions | View Transitions API cross-fade |

Rules: durations between 300ms and 700ms for interactions, linear mapping for scroll-driven effects, respect `prefers-reduced-motion: reduce` (disable all of the above).

## 9. Map and 3D

- Real build: MapLibre GL with a gentle pitch (about 45 degrees), light green-and-white style, sand-toned land, clustered pins.
- Landing hero fallback and low-end devices: layered SVG map of Nigeria with the separating-layers effect.
- Lazy-load the map code only when the section nears the viewport.
- No video backgrounds. Cap device pixel ratio at 2. Provide a flat fallback when the device is low-powered.

## 10. Performance budget

- Smooth on a mid-range Android phone on a 4G connection.
- Largest Contentful Paint under 2.5s on mobile.
- Images in AVIF or WebP, responsive sizes, lazy-loaded below the fold.
- JavaScript for the landing page kept as small as possible; split heavy libraries.

## 11. Tailwind setup

`tailwind.config.ts` (Tailwind v3 style; if using Tailwind v4, move the same tokens into an `@theme` block in the CSS file):

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mist: "#F7F8F5",
        sand: { 50: "#FAF6EE", 100: "#F2EAD9", 200: "#E7DABF" },
        green: {
          100: "#DCEFE3", 600: "#008751", 700: "#1B6B43",
          800: "#145233", 900: "#0F3D26", 950: "#0B2A1B",
        },
        ink: "#12201A",
        muted: "#5B6B62",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15,61,38,0.08)",
        "glass-sand": "0 8px 32px rgba(120,100,60,0.10)",
      },
    },
  },
} satisfies Config;
```

`globals.css` motion utilities:

```css
@keyframes rise { from { opacity: 0; transform: translateY(56px) } to { opacity: 1; transform: none } }
@keyframes lit { from { opacity: .16 } to { opacity: 1 } }
@keyframes exit-up { to { opacity: 0; transform: translateY(-70px) scale(.95) } }
@keyframes wipe { from { clip-path: inset(0 100% 0 0) } to { clip-path: inset(0 0 0 0) } }
@keyframes spread { to { transform: translateY(var(--d)) } }
@keyframes pulse-pin { 0% { r: 4; opacity: .9 } 100% { r: 18; opacity: 0 } }

@supports (animation-timeline: view()) {
  .rise { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% entry 55%; }
  .lit  { animation: lit linear both; animation-timeline: view(); animation-range: entry 25% cover 40%; }
  .exit-up { animation: exit-up linear both; animation-timeline: view(); animation-range: exit 5% exit 85%; }
  .wipe { animation: wipe linear both; animation-timeline: view(); animation-range: entry 10% entry 70%; }
  .layer { animation: spread linear both; animation-timeline: view(); animation-range: entry 10% cover 55%; }
}
@media (prefers-reduced-motion: reduce) {
  .rise, .lit, .exit-up, .wipe, .layer { animation: none; }
}
```

## 12. Accessibility

Visible focus rings (`focus-visible:ring-2 ring-green-700`), labelled inputs, alt text on images, semantic headings, colour never the only signal, contrast at AA or better.
