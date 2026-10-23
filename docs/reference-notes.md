# Reference notes: Roveia

Reference inspected: [roveia.com](https://www.roveia.com/) and the desktop screenshots supplied with this project. The visible desktop browser viewport in the screenshots is about 1366 × 768 including browser chrome. The live page content confirms the full section sequence; no live 390 px screenshot or DevTools computed styles were available during this pass, so phone measurements and motion timings below are implementation targets, not claimed source measurements.

## Observed page order

1. Floating capsule navigation: wordmark, grouped links and dark call to action.
2. Inset rounded hero with a large two-line headline, small support copy, stat, media, and button.
3. Partner marks.
4. Numbered audience list with matching descriptions/media.
5. Client names moving in a logo strip.
6. Stacked featured case-study cards.
7. Horizontally browsed service cards.
8. Process/program, floating testimonials, FAQ, closing call to action and footer.

The Lagur recreation adapts this rhythm to property search. It uses bracketed placeholders for the agency marks, statistics, property visuals, customer quotes and customer identities. It does not reuse Roveia text, photos, video, brand marks or code.

## Desktop visual estimates from supplied screenshots

- At roughly 1366 px, the nav capsule is about 996 × 56 px and sits about 24 px below the top. Use a centered 1160 px content width and broad side margins.
- The hero is inset about 20 px from the page edge with approximately 40 px corner radii. The headline is around 68–72 px in the reference, with modest supporting copy and generous whitespace.
- The media surface is about 580 px wide with approximately 28 px corners. The hero stats, media, and supporting text form a three-column row.
- Audience rows use small two-digit numbers beside large light headings, separated by thin rules. The image/detail panel occupies the right column.
- Repeated shapes include capsule navigation and buttons, large rounded media, and grey service panels with compact chips.
- Supplied mid-page screenshots show a horizontally presented service gallery, agency/testimonial cards, two-column FAQ and a wave-tinted footer.

## Type, colour, spacing and shape targets

- The Lagur implementation uses the local Maragsa display face for headings, with Anybody as the loaded fallback and Plus Jakarta Sans for body and interface text. Comic Neue is limited to handwritten notes and testimonial quotes; Outfit draws the SVG wordmark. These faces and glyph subsets are configured through `next/font` in `app/fonts.ts`.
- Page base is white with ink `#101010`. Forest `#0A4B2E` and emerald `#0F7A4A` form the text and button accent; spark `#3EE08F` is decorative only. The hero moves from white through `#F1F9F4`, `#DDF1E4`, and `#C6E9D3`; the closing CTA and footer use a deep green panel.
- Layout follows a 4/8 spacing rhythm, with larger section gaps around 80–120 px on desktop and 60–80 px on mobile.
- Main outer panels use 36–40 px radii, feature cards 24–32 px, media 24–28 px, and buttons/chips use full or small rounded shapes as appropriate.
- The navigation uses white at 85% opacity, 16 px backdrop blur, and a soft shadow; its fallback is solid white. The Lagur wordmark is an inline SVG with Outfit text and a shared four-point sparkle motif.

## Motion and states

The screenshots reveal persistent navigation, stacked cards, a horizontal services gallery, moving logo marks and floating testimonial cards. They do not reveal the original easing curves or exact trigger boundaries. The recreation uses a slight hide-on-scroll-down/show-on-scroll-up nav, once-only fade-and-rise reveals, a scrubbed curved path, sticky featured cards, a GSAP-pinned desktop services rail, a swipeable mobile rail, a slow logo marquee, and gentle testimonial drift. CSS provides static states when motion is reduced or the GSAP chunk cannot load.

Buttons and links lift slightly on hover; navigation menus use native disclosure controls; audience rows respond to pointer, keyboard focus, and tap. FAQ rows are keyboard-operable native disclosures with a rotating arrow and expanding answer. Focus indicators remain visible. On narrow screens the layout stacks, the service rail is touch-scrollable, the custom cursor is hidden, and controls remain touch-sized.

## Responsive targets and performance

- The supplied brief sets 390 px as the mobile design width; no direct phone screenshot of Roveia was supplied. The recreation stacks hero and FAQ columns, turns the agency and process layouts into single columns, and makes services a horizontal swipe rail.
- The hero and feature visuals are CSS illustrations until real, licensed property media exists. No video is downloaded or auto-played. The outro uses a layered green map-like illustration.
- MapLibre is not needed for these marketing-page previews. Product map work can lazy-load MapLibre and retain the layered SVG fallback.
- Scroll animations are disabled or simplified under `prefers-reduced-motion`; media remains lightweight and the heavy motion modules are dynamically imported.
