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

## Detailed next milestones to achieve

### 1. Finish the authentication and verification foundation
- Email sign-up and sign-in must work reliably for both customers and agents/companies.
- Email verification must be supported end-to-end, with a valid callback URL and correct redirect configuration.
- Google OAuth must be enabled for both customer and agent/company flows.
- User role must be preserved through the auth flow and stored correctly in Supabase metadata and user records.
- Agents and companies must provide business details before their listing workflow is unlocked.
- Account onboarding must route each role to the correct workspace after sign-in.

### 2. Complete the customer onboarding and dashboard flow
- Customer dashboard must show summary cards for high-value tasks: AI search, saved homes, map, inbox, profile.
- Users must see a clear welcome state when they first sign in.
- The dashboard should guide them toward search, discovery, and trust-sensitive actions.
- The customer view must feel fast, helpful, and premium, consistent with the design system in DESIGN.md.

### 3. Build the customer search and discovery experience
- Add search filters by location, price, type, and property category.
- Support AI-style natural language search such as: “Room and parlor near campus, budget [amount]”.
- Convert natural-language prompts into structured search filters.
- Rank verified listings first and hide unverified listings from search results.
- Group results by company, location, type, and budget.
- Track daily AI usage per user and present a free allowance before upgrade prompts.

### 4. Build the listing detail and trust flow
- Each listing must have a dedicated detail page with full property information, media, and price context.
- Customers must be able to see agent/company information, fixed fee details, and property status.
- Customers must be able to contact the agent or request an inspection date.
- Customers must be able to report a listing if there is a concern.
- The app must clearly show that legal due diligence remains the customer’s responsibility.

### 5. Build the saved homes and communication experience
- Users must be able to save properties they are interested in.
- The saved homes page must remain accessible for later comparison and follow-up.
- Inbox must centralize messages, listing discussions, and inspection scheduling.
- Chat threads must persist and maintain the conversation history.
- Agents and customers must be able to propose or adjust proposed inspection dates.

### 6. Build the agent and real-estate company workspace
- Agents and companies must have a dedicated workspace dashboard after signup.
- They must be able to add listings for rent, sale, and land.
- Supported rental and sale categories must include all required formats listed in the MVP.
- Each listing must include location, price, property type, size, and required metadata.
- Users must upload photos and required documents before submission.
- Listings must remain hidden until admin review is complete.

### 7. Build the document and verification workflow
- Agents and companies must upload all required legal documents such as CofO, survey plan, and other supporting files.
- Listings must not be published until the admin review workflow passes.
- Admins must review documents with approval, rejection or suspension actions.
- Duplicate parcel detection must be supported before listing approval.
- All actions must be logged in the audit trail.

### 8. Build the fixed fee system
- Fee amounts must be derived from zone tier and property type.
- Agents and companies must not be able to edit fixed fees directly.
- Admins must be able to adjust the fee table when required.
- Fee logic must be visible in the customer experience so it is transparent and consistent.

### 9. Build the admin review and moderation layer
- Admins must review listing documents and decide whether they qualify for publication.
- Admins must be able to reject, suspend or note issues with listings.
- Reports from customers must move into the admin queue for action.
- Admin dashboards must support operational visibility and review decisions.
- All admin actions must be auditable for compliance and trust.

### 10. Build the billing and hosting plan flow
- Agents and companies must pay a monthly fee to host their listings.
- Approved listings should only be published once payment is successful.
- Lapsed subscriptions must hide listings from the public marketplace.
- Billing status must be clearly visible in the agent/company workspace.
- The billing setup must not hardcode amounts in marketing copy; it must use configuration values.

### 11. Build the map and geographic discovery layer
- Customers must be able to browse listings on a map of Nigeria.
- Users must be able to zoom into cities and view relevant listings.
- The map should support layered data and fallback graphics for low-end devices.
- The map should load lazily and avoid blocking first render.

### 12. Build the AI usage and plan logic
- Customers must receive a free daily allowance for AI searches.
- Usage must be tracked per user per day.
- When the allowance is exceeded, the app must encourage a paid plan.
- Plan amounts and limits must be configuration-driven rather than hardcoded.
- The user experience should remain clear and trustworthy when the limit is reached.

### 13. Build the final post-MVP expansion layer
- Add commute-time ranking with a routing service.
- Add state land registry checks.
- Add agent ratings and reviews.
- Add saved searches and alerts.
- Add push notifications and a future native app strategy.
- Add admin analytics and operational reporting.

### 14. Prepare the production deployment layer
- Deploy the app to a free Vercel project first, before buying a custom domain.
- Use the Vercel production URL as the live app URL until custom-domain setup is ready.
- Configure environment variables in Vercel.
- Configure Supabase Auth redirect URLs for both local and production usage.
- Configure Google OAuth redirect permissions for the production deployment.
- Configure Resend API credentials for transactional emails.
- Validate the full sign-up, verification, and redirect flow before moving to feature expansion.

### 15. Launch, test, and iterate on the customer-first MVP
- Validate the full customer journey from landing page to saved property and chat flow.
- Confirm listings are properly verified before they appear in results.
- Confirm customers can discover, shortlist, contact, and trust the platform.
- Identify friction points in onboarding, AI search, and inspection flow.
- Improve usability based on real testing before moving deeper into agent and admin features.

## Out of scope for the demo
Online rent or purchase payments between customer and agent, legal contract generation.
