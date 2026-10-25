# LAGUR_DASHBOARD_PROMPTS.md (instructions for GitHub Copilot)

This file is for GitHub Copilot (Agent mode in VS Code). The code is in `docs/LAGUR_DASHBOARD_CODE.md`. Read both files before changing anything. Run the prompts in section 3 one at a time, in order.

## 0. Goal

1. A beautiful customer dashboard and agent dashboard, based on the reference design described in section 1 (and the reference screenshot if it is attached to the chat).
2. A Lagur loading screen (the logo slides in, with a UI Ball loader) shown when the user taps key actions such as Get Started, Sign in, Sign up, Continue with Google, and Find me recommendations.
3. Five React Bits animations and five UI Ball loaders, used consistently across the site.

Do not break authentication. The sign-in flow, `ensureProfile`, `landingFor`, the callback route and `verifySession` were just fixed and must keep working.

## 1. Dashboard design brief (from the reference screenshot)

Replicate the structure, spacing and feel of the reference. Do not copy its text, logo or brand. Use Lagur content.

**Frame and colour**
- Dark by default (a switch in the sidebar changes to light). Dark: page `#2B2D31`, sidebar `#1B1C1F`, panels `#18191C`, inner chips `#232428`, text white, muted `#9A9DA3`. Light: page `#EEF2F0`, sidebar and panels white, text `#101010`, muted `#5B6B62`.
- The reference's blue accent becomes Lagur's neon green `#19E57A`. Text on a green button is always `#101010`.
- Positive numbers green, negative red `#FF5C5C`, waiting amber `#FFB020`. All colours come from the CSS variables in `components/dashboard/dashboard.css`.
- Large radii: panels 24 to 28px, buttons and chips fully rounded. Generous spacing.

**Sidebar (about 270px, desktop)**
- Logo at the top. Nav list; the active item sits in a rounded pill. Bottom: Help & information, a dark/light switch, then a white plan card with a small green badge, a title, one line of text, a progress bar (customer only) and a black full-width button.
- On mobile the sidebar becomes a slide-in drawer opened by a menu button.

**Top bar**
- A rounded search field, a green pill primary button (customer: "Find me recommendations", agent: "Add listing"), round icon buttons for messages and notifications (notification has a small red dot), and a circular avatar with the user's initials.

**Greeting row**
- Small "Hi {first name}," above a large "Welcome back!" (React Bits BlurText). On the right a segmented "Today / Week" control and a calendar button.

**Overview panel (the big one)**
- Title "Overview" and a segmented control (two views). Left: a caption, a big CountUp number and a green delta chip. Right: a smooth area chart with a green gradient fill, dashed grid, Mo to Sun labels and a white tooltip.
- Below: a four-stat strip with thin dividers, each stat has an up (green) or down (red) arrow and a CountUp number.

**Lower row (two panels)**
- Left: a multi-ring donut with a total and a four-item legend. Right: a recent-activity list with a status chip and time on each row, and a "Detail" link.

**Content**
- Customer: New matches, Saved homes, Inquiries sent, Inspections booked, Free AI searches left (out of 5 per day). Inquiry statuses: Replied, Waiting, Booked, Declined.
- Agent: Listing views, Inquiries, Active listings, In review (about 24 hours), Inspections booked. Listing statuses: Verified, In review, Needs changes, Draft.
- Never show plan prices. Customers get 5 free AI searches per day and pay for more. Agents pay a monthly hosting plan.
- All numbers are SAMPLE data and carry a visible "Sample data" badge until real queries replace them.

## 2. Ground rules

- Do exactly what each prompt says. Do not restyle or refactor anything else.
- Copy code from `docs/LAGUR_DASHBOARD_CODE.md` exactly. Files in `components/react-bits/` are verbatim from the official repository: do not edit them except to fix an import path the build requires.
- Use only these React Bits components: BlurText, ShinyText, CountUp, SpotlightCard, ClickSpark. Use only these loaders: Ring2, DotPulse, Waveform, Ripples, Pulsar. Do not add others.
- Use the shared tokens in `lib/motion.ts` for every animation (same easing and the same BlurText props).
- Only animate `transform` and `opacity`. Respect `prefers-reduced-motion` everywhere.
- The full-screen Lagur loader is for key actions only (links and submit buttons that use `LoaderLink` and `SubmitButton`). Normal dashboard navigation uses plain `Link` and the in-page skeleton, never the full-screen loader.
- Server Components must not pass functions or components to Client Components. Shells that need icons are Client Components (`customer-shell.tsx`, `agent-shell.tsx`).
- Never break the auth fixes. If a change touches `lib/auth/*`, `app/actions/auth.ts` or `app/auth/*`, stop and say why first.
- After each prompt: run `npm run build`, fix errors you caused, then commit with a clear message.

## 3. Prompts (run one at a time, in order)

### Prompt 0: inspect only, change nothing

```text
Read the project and docs/LAGUR_DASHBOARD_PROMPTS.md and docs/LAGUR_DASHBOARD_CODE.md. Do NOT change anything yet. Report in a short list:
1. Versions of next, react, tailwindcss (is it Tailwind v3 with tailwind.config or v4 with CSS @theme?), typescript, and whether the "@/*" path alias works.
2. How headings and fonts are set up (is there a font-heading Tailwind class and a heading font variable?), and where the Tailwind colour tokens live.
3. Which of these already exist: components/react-bits, components/loaders, components/loading, components/brand/logo.tsx, components/dashboard, lib/motion.ts. If a Logo component already exists, list its current exports and every file that imports it.
4. The current contents and layout files of app/dashboard and app/agent (pages, layouts, any existing sidebar or shell). Will the new shells cause a double sidebar?
5. Every form that uses a server action (sign-in, sign-up, Google buttons) and every link or button labelled Get Started, Sign in, Sign up, Join.
6. Everywhere "/agent/listings" is hardcoded as a redirect or landing page.
7. Whether motion, recharts and lucide-react are already installed.
Do not guess. If something is missing, say so.
```

### Prompt 1: dependencies, React Bits and shared tokens

```text
Follow docs/LAGUR_DASHBOARD_CODE.md, Part A and the lib/motion.ts file in Part C.
1. Install: npm install motion recharts lucide-react. If npm reports a peer dependency conflict with React 19, install the latest stable versions of the package that conflicts; use --legacy-peer-deps only as a last resort and tell me exactly why.
2. Create the five files in components/react-bits/ (BlurText, ShinyText, CountUp, SpotlightCard, ClickSpark) with the code from Part A, verbatim.
3. Create lib/motion.ts exactly as in Part C.
4. Create or update THIRD_PARTY_NOTICES.md at the project root with these entries: React Bits (MIT + Commons Clause, https://github.com/DavidHDev/react-bits, components used inside the app, not redistributed); LDRS / UI Ball (MIT, https://github.com/uiball/ldrs); lucide-react (ISC); recharts (MIT); motion (MIT).
5. Do not use the components anywhere yet. Do not change any other file.
Run the build, then commit.
```

### Prompt 2: loaders

```text
Follow docs/LAGUR_DASHBOARD_CODE.md, Part B. Create components/loaders/uiball.css and components/loaders/uiball.tsx exactly as shown.
Do not change any other file. Run the build, then commit.
```

### Prompt 3: the Lagur loading system

```text
Follow docs/LAGUR_DASHBOARD_CODE.md, Part C.
1. Create components/brand/logo.tsx. If a Logo component already exists, keep its export names and update it to the new design; fix every import that breaks.
2. Create components/loading/lagur-loader.tsx, loading-provider.tsx, loader-link.tsx and submit-button.tsx, plus app/loading.tsx and components/ui/reveal-heading.tsx, exactly as shown.
3. Wire app/layout.tsx as shown (ClickSpark wrapping LoadingProvider wrapping children). Keep every existing font, metadata, global CSS and provider. Confirm ClickSpark does not break page height, sticky elements or scrolling; if it does, fix the wrapper's className without editing the ClickSpark file.
4. Replace the submit buttons on the sign-in and sign-up forms (email form and Continue with Google buttons) with SubmitButton. For the Google buttons use unstyled and pass the existing button classes in className so they keep their look. SubmitButton must be inside the <form action={...}>. Do not change the server actions.
5. Replace the Get Started, Sign in, Sign up and Join links on the landing page and nav with LoaderLink (same classes).
6. Behaviour required: tapping any of these shows the green Lagur loading screen; it slides up, the letters of "lagur" slide up one by one, the sparkle appears, the Ring2 loader spins, and it stays at least 1 second; it slides away upward once the next page has rendered; a failed sign-in (redirect back to the same page with ?error=) must also close it; it never stays more than 12 seconds.
7. Do not change anything in lib/auth, app/actions/auth.ts or app/auth.
Run the build, then commit. Give me a manual test script for: Get Started, Sign in link, email sign-in with a wrong password, Google sign-in.
```

### Prompt 4: dashboard foundation

```text
Follow docs/LAGUR_DASHBOARD_PROMPTS.md section 1 (design brief) and, if a reference screenshot is attached, replicate its layout. Follow docs/LAGUR_DASHBOARD_CODE.md, Part D.
1. Create components/dashboard/dashboard.css, theme.tsx, shell.tsx, panel.tsx, charts.tsx, plan-card.tsx, overview.tsx and coming-soon.tsx exactly as shown.
2. Confirm SpotlightCard picks up the dashboard colours (panel background from --d-panel, border from --d-line). If its own classes override them, adjust only the className or style passed from panel.tsx, never the React Bits file.
3. Do not create the customer or agent pages yet.
Run the build, then commit.
```

### Prompt 5: customer dashboard

```text
Follow docs/LAGUR_DASHBOARD_CODE.md, Part D: lib/auth/display-name.ts, components/dashboard/customer-shell.tsx, customer-overview.tsx, app/dashboard/layout.tsx, app/dashboard/page.tsx, app/dashboard/loading.tsx.
1. Use verifySession from lib/auth/dal.ts (keep its current export name and shape). If role is not customer, redirect to landingFor(role).
2. If app/dashboard already has pages or components, keep their functionality and move them inside the new shell. Remove any old sidebar or header so there is only one.
3. Create a simple placeholder page using the ComingSoon component for each sidebar route that does not exist yet: /dashboard/recommendations, /dashboard/saved, /dashboard/messages, /dashboard/inspections, /dashboard/profile, /dashboard/plan, and /help if missing. /search must be the existing AI search page (do not create a placeholder if it exists).
4. Where real data already exists (the user's name, role), use it. Keep every other number as SAMPLE data with the "Sample data" badge.
5. Check at 390px and 1440px: no horizontal scroll, the drawer opens and closes, the theme switch works and is remembered after a reload, charts have size, and text contrast is at least 4.5:1 in both themes.
Run the build, then commit.
```

### Prompt 6: agent dashboard

```text
Follow docs/LAGUR_DASHBOARD_CODE.md, Part D: components/dashboard/agent-shell.tsx, agent-overview.tsx, app/agent/layout.tsx, app/agent/page.tsx, app/agent/loading.tsx.
1. In lib/auth/profile.ts change landingFor so agent and company users land on "/agent" (the new overview) instead of "/agent/listings". Change nothing else in that file. Find every other hardcoded "/agent/listings" redirect and update it only if it is a post-login landing redirect. Keep "/agent/listings" itself as a normal page.
2. app/agent/layout.tsx wraps ALL pages under /agent, including the existing /agent/listings pages. Keep their functionality and remove any duplicate sidebar or header they had.
3. Create placeholder pages with ComingSoon for the sidebar routes that do not exist yet: /agent/listings/new (only if the real add-listing page does not exist), /agent/verification, /agent/inquiries, /agent/inspections, /agent/plan.
4. The "In review (about 24 hours)" label must appear exactly like that on the agent overview.
5. Test: a customer opening /agent is redirected to /dashboard; an agent opening /dashboard is redirected to /agent; signing in with Google as an agent lands on /agent.
Run the build, then commit.
```

### Prompt 7: apply the five React Bits animations consistently

```text
Using docs/LAGUR_DASHBOARD_CODE.md, Part E, apply the five React Bits components. Use exactly these rules and no others:
1. BlurText through RevealHeading: the hero h1 and every section h2 on the landing page. Same props everywhere (BLUR_DEFAULTS from lib/motion.ts). Keep a real sr-only heading for SEO and accessibility (RevealHeading does this).
2. ShinyText: small eyebrow labels (for example "AI-POWERED HOUSE HUNTING") and the AI search label.
3. CountUp: stat numbers on the landing page hero stat block and in the dashboards. Use real numbers only; where no real number exists keep the existing [X] placeholder text and do not animate it.
4. SpotlightCard (theme="light" on the landing page): the "What we do" service cards, the pricing or plan cards and the meme cards if present. Dashboards already use it through Panel.
5. ClickSpark: only the single wrapper in app/layout.tsx.
Rules: do not add any other animation library or component. Do not animate more than one heading reveal per section. All text animations must respect prefers-reduced-motion (BlurText and CountUp must show their final text immediately when reduced motion is on; add that behaviour if the component does not already do it, by wrapping, not by editing the React Bits file).
Run the build, then commit.
```

### Prompt 8: apply the loaders

```text
Use the UI Ball loaders from components/loaders/uiball.tsx in these places only:
1. Ring2: inside SubmitButton (already done) and the full-screen Lagur loader (already done).
2. Waveform (size 28, colour #00A651 on light backgrounds, #19E57A on dark): the AI search page while the AI is finding matches, with the text "Finding matches".
3. DotPulse (size 32, currentColor): the chat screen when the other person is typing, if typing state exists; if it does not exist yet, create the component usage but leave a TODO.
4. Ripples (size 48, #19E57A): the map or location search state and the "Find me recommendations" searching state.
5. Pulsar (size 44): dashboard skeletons (already done) and empty states.
Keep one loader per state, no stacking of loaders. Every loader has an accessible text label next to it or a role="status" wrapper. Run the build, then commit.
```

### Prompt 9: final QA

```text
Final pass:
1. Run npm run build and npm run lint; fix everything caused by these changes.
2. Check with a mobile viewport (390px) and desktop (1440px): no horizontal scroll, touch targets at least 44px, headings wrap cleanly, the loading screen and drawer do not overflow.
3. Reduced motion: with prefers-reduced-motion on, the loading screen fades instead of sliding, text effects show final text, sparks and twinkles stop.
4. Performance: confirm the dashboard and landing pages do not load Recharts or motion on routes that do not use them (dynamic import the charts if the bundle for the landing page grew noticeably) and report the first-load JS size of /, /dashboard and /agent.
5. Accessibility: every icon-only button has an aria-label, charts have text alternatives, focus rings are visible, the theme switch has role="switch".
6. Confirm the sign-in flow still works end to end (email and Google) and that failed sign-ins show the error and close the loading screen.
7. Give me a list of every file added or changed in all prompts and the manual test results.
```

## 4. Error playbook

| Symptom | Likely cause | What to do |
|---|---|---|
| `Cannot find module 'motion/react'` | motion not installed | `npm install motion` |
| `Cannot find module 'recharts'` or `lucide-react` | not installed | install them |
| Peer dependency error with React 19 | an older package version | install the latest stable version of that package; `--legacy-peer-deps` only as a last resort, and report it |
| `useFormStatus` always false / loader never shows on submit | SubmitButton is outside the `<form>` | put it inside the form that has the server action |
| Full-screen loader stays on forever | provider cannot see the route change, or a redirect goes to the same path | check `pathAtShow` logic in loading-provider.tsx; make sure SubmitButton hides when `pending` becomes false; the 12-second safety net must still work |
| Loader flashes on every dashboard click | nav uses LoaderLink | dashboard nav must use plain `Link` |
| Hydration mismatch in the dashboard | theme read before mount | the theme provider must start with the default theme and read localStorage only inside `useEffect` |
| Chart is empty or warns about width(0) | parent has no height | the chart wrapper needs the fixed height classes shown (`h-48 md:h-56`) |
| SpotlightCard ignores dashboard colours | its own class wins | pass the CSS variables through `style` from panel.tsx; do not edit the React Bits file |
| ClickSpark breaks layout (height, sticky nav, scroll) | wrapper div styles | give the wrapper `className="min-h-dvh"`; check sticky elements; if it still breaks, wrap only the pages that need it |
| Tailwind classes with `var(--d-...)` have no effect | content paths miss the new folders | add `components/**` and `app/**` to Tailwind `content` (Tailwind v3), or check source detection (v4) |
| `Functions cannot be passed directly to Client Components` | a Server layout passes icon components | keep icons inside `customer-shell.tsx` and `agent-shell.tsx` (Client Components) |
| Double sidebar on agent listing pages | old layout still wraps them | remove the old shell and keep app/agent/layout.tsx |
| Agent lands on the wrong page after sign-in | landingFor not updated | update `landingFor` and any hardcoded redirect (Prompt 6) |
| Lucide icon not found | renamed icon | use the current name or its alias (for example `SquarePlus`) |
| BlurText inside a heading causes a DOM nesting warning | it renders a paragraph | use RevealHeading (sr-only heading plus aria-hidden visual) |
| Fonts differ between logo and loader | two font instances | import `logoFont` from components/brand/logo.tsx (already done in the loader) |
| Build error about `"use client"` | hook used in a Server Component | add `"use client"` to the file that uses the hook |

## 5. Definition of done

- `npm run build` and `npm run lint` pass.
- Tapping Get Started, Sign in, Sign up, Continue with Google and Find me recommendations shows the Lagur loading screen as specified.
- Customer and agent dashboards match the design brief at 390px and 1440px, in dark and light themes, with the theme remembered.
- Only the five React Bits components and five loaders are used, consistently.
- Authentication still works; customers land on /dashboard, agents and companies land on /agent.
- No plan prices are shown anywhere; the 5 free daily AI searches and the 24-hour document review appear where specified.
- All sample data is labelled "Sample data".
