# FEATURES.md

Scope, user stories and acceptance criteria.

> Visual rule for every screen: follow DESIGN.md. Replicate the design of https://oftheoak.co.uk/ and https://www.storeyarchitecture.co.uk/ (similar, not identical), in light mode, white and green, subtle sand-toned glass, Tailwind CSS, mobile-first.

## Roles

Customer, Agent, Real Estate Company, Admin.

## MVP

### Accounts
- As a visitor I can sign up as a customer, or as an agent or real estate company.
  - Acceptance: role chosen at sign-up; email verification; agents and companies provide business details.

### Listings (agent and company)
- I can upload rental, sale and land listings.
  - Rent categories: self-contained (1-bedroom), room and parlor, 2-bedroom, 2-bedroom and a parlor, 3-bedroom, 5-bedroom.
  - Land: location, price, number of plots, land size.
  - Buildings for sale: duplex (including 2-bedroom duplex), bungalow, story building.
  - Acceptance: required fields validated; photos uploaded; each category can have its own price and options.
- I must upload documents (CofO, survey plan, other) before the listing can be reviewed.
  - Acceptance: listing stays hidden until an admin approves it.

### Verification (admin)
- I can review documents and approve, reject with notes, or suspend a listing.
  - Acceptance: duplicate parcels are flagged; every action is written to the audit log.

### Fixed fees
- As a customer I see a fixed agent fee on each listing.
  - Acceptance: fee derives from zone tier and property type; agents cannot edit it; admin can edit the fee table.

### Search and discovery
- I can filter by location, price and type.
- I can ask the AI in plain language, for example: "Room and parlor near campus, budget [amount]".
  - Acceptance: AI converts the request to filters; results are grouped by company, location, type and budget; only verified listings appear.
- I get a daily free allowance of AI searches. When it is used up, I am invited to pay for more.
  - Acceptance: usage tracked per user per day; the allowance and plan amounts come from configuration; no price amounts are hardcoded in copy.

### Map
- I can see listings on a map of Nigeria and zoom to a city and listing.
  - Acceptance: layered SVG fallback on low-end devices; lazy-loaded.

### Chat and inspection
- After picking a listing I can message the agent and propose an inspection date.
  - Acceptance: messages persist; the agent can accept or suggest another date; both receive a notification.

### Agent billing
- Agents and companies pay a monthly fee to host listings.
  - Acceptance: successful payment publishes approved listings; lapse hides them.

### Trust and safety
- I can report a listing.
  - Acceptance: reports reach the admin queue and can suspend the listing.

## After the MVP
- Commute-time ranking with a routing service
- State land registry checks
- Agent ratings and reviews
- Saved searches and alerts
- Push notifications and a native app
- Admin analytics

## Out of scope for the demo
Online rent or purchase payments between customer and agent, legal contract generation.

## Pages
Customer: landing, sign up and sign in, AI search, results, listing detail, map, chat, saved listings and profile.
Agent and company: sign up, billing, dashboard, upload listing, verification status, inbox.
Admin: document review queue, fee table, reports.
