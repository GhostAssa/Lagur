# ARCHITECTURE.md

Technical architecture for the PropTech house-hunting web app.

> Design rule for every file in this project: follow DESIGN.md. Replicate the design of https://oftheoak.co.uk/ and https://www.storeyarchitecture.co.uk/ (similar, not identical): minimalistic, beautiful, calm, light mode, white and green with subtle sand-toned glassmorphism, Tailwind CSS, mobile-first.

## 1. Product summary

A mobile-first web app that connects customers with real estate agents and companies. Customers describe what they need to an AI assistant, which finds matching verified listings (rent, buy, land) and ranks them by price, location and commute. Customers then chat with the agent and agree an inspection date.

Three principles:
1. Fixed agent fees by location zone and property type.
2. Verified documents (CofO, survey plan and others) before a listing goes live, with duplicate-parcel detection to reduce double sales.
3. Agents pay to host; customers browse free, get a daily free allowance of AI searches, and pay for additional AI searches.

## 2. Suggested stack

Check current stable versions before installing. Do not pin versions from this file.

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS, per DESIGN.md |
| Motion | CSS scroll-driven animations; GSAP ScrollTrigger and Lenis only if needed |
| Map | MapLibre GL (layered SVG fallback) |
| Backend, DB, auth, storage | Supabase (Postgres, Auth, Storage, Row Level Security) |
| AI | Claude API with tool calling, called only from server routes |
| Payments | Paystack or Flutterwave (subscriptions and one-off payments) |
| Email and notifications | Transactional email provider |
| Hosting | Vercel and Supabase |
| Validation | Zod |
| Testing | Vitest and Playwright |

## 3. Folder structure

```
app/
  (marketing)/page.tsx            landing scroll story
  (auth)/sign-in, sign-up
  search/                         AI chat and results
  listings/[id]/                  listing detail
  map/                            map view
  chat/[threadId]/                customer-agent chat and inspection booking
  agent/                          dashboard, listings, upload, billing, inbox
  admin/                          document review, fee table, reports
  api/
    ai/search                     AI search endpoint
    listings, documents, chat, inspections, billing, webhooks
components/
  ui/ (buttons, chips, inputs, glass cards)
  landing/ (hero, statement, steps, map, categories, trust, cta)
  listings/ search/ chat/ upload/
lib/
  supabase/ ai/ fees/ entitlements/ payments/ validators/
docs/ (these MD files and reference-notes.md)
```

## 4. Data model (Postgres)

```sql
users(id, role, full_name, email, phone, created_at)            -- role: customer | agent | company | admin
agencies(id, owner_id, business_name, rc_number, status, created_at)
plans(id, audience, name, price_kobo, interval, daily_ai_search_limit, active)   -- audience: customer | agency; values set by the owner in the database, never hardcoded in UI
subscriptions(id, subject_id, plan_id, status, provider_ref, current_period_end)
ai_usage(id, user_id, day, search_count)                         -- daily counter for the free allowance
zones(id, name, state, city, tier)                               -- tier: standard | hot_zone | place_of_interest
fee_table(id, zone_tier, property_type, fixed_fee_kobo, active)
parcels(id, survey_plan_number UNIQUE, state, lga, polygon NULL, created_at)
properties(id, agency_id, parcel_id NULL, category, type, zone_id, title, description,
           price_kobo, bedrooms, land_size_sqm, plots, status, verified_at, created_at)
property_media(id, property_id, url, position)
documents(id, property_id, kind, storage_path, status, reviewer_id, reviewed_at, notes)  -- kind: cofo | survey | deed | other
chat_threads(id, property_id, customer_id, agent_id, created_at)
messages(id, thread_id, sender_id, body, created_at)
inspections(id, thread_id, proposed_at, status)
reports(id, property_id, reporter_id, reason, status)
audit_log(id, actor_id, action, entity, entity_id, created_at)
```

Rules:
- Money is stored in kobo as integers.
- `properties.status`: draft, pending_review, verified, rejected, suspended, sold, rented.
- One active, verified listing per `parcel_id` (partial unique index).
- Fee shown on a listing is looked up from `fee_table` by the property's zone tier and type. Agents cannot write it.
- Plan amounts and the free daily AI search allowance live in the `plans` table and are configurable.

## 5. AI search flow

1. Customer sends a plain-language request.
2. Server checks the daily AI search allowance (`ai_usage` and the customer's plan). If exhausted, return a "get more searches" prompt.
3. The model extracts structured filters through a single tool call: `search_listings({ category, type, location, min_price, max_price, bedrooms, plots, commute_to })`.
4. The server validates the filters with Zod and runs a normal parameterised database query on verified listings only.
5. Results are ranked and grouped by company, location, type and budget.
6. Commute time is added using a routing service (phase 2); MVP uses straight-line distance.
7. The assistant writes a short explanation and offers to open a chat with the agent.

Safety: the model never sees raw database access, never writes data, and treats user text and listing text as data, not instructions.

Cost control: per-user daily limits, short prompts, caching of repeated searches, request timeouts.

## 6. Verification flow

1. Agent submits a listing with CofO, survey plan and supporting documents (private storage).
2. System normalises the survey plan number and checks `parcels` for an existing active listing. Duplicate: block or flag for admin.
3. Admin reviews documents in the queue. Approve sets `verified_at`; reject returns notes to the agent.
4. Verified listings show the "Verified documents" badge. Customer reports trigger re-review and can suspend a listing.
5. Phase 2: check documents against the relevant state land registry through a partner lawyer or surveyor.

Be explicit in the product that the platform reviews documents and detects duplicates; it does not guarantee legal title.

## 7. Billing

- Agency plan: monthly subscription required to publish listings. Unpaid or expired: listings are hidden, not deleted.
- Customer plan: free tier with a daily AI search allowance; a paid plan raises the allowance.
- Payments run through the payment provider's hosted checkout; confirm status only via signed webhooks.
- Never hardcode prices in the UI; read them from `plans`.

## 8. Environments and configuration

Secrets in environment variables only: Supabase keys, AI API key, payment keys, webhook secrets. `.env.example` lists names without values. Separate development, preview and production projects.

## 9. Build order

1. Project setup, Tailwind tokens, fonts, layout shell (DESIGN.md)
2. Auth and roles, database schema, Row Level Security
3. Agent onboarding and listing upload with documents
4. Admin review queue and duplicate-parcel check
5. Fee table and fee display
6. Listings, filters, listing detail
7. AI search with entitlements
8. Chat and inspection booking
9. Billing for agencies and customers
10. Landing scroll story and map (follow DESIGN.md exactly)
11. Security pass, tests, performance pass
