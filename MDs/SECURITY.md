# SECURITY.md

Security requirements, written as tasks.

> Reminder for the whole project: follow DESIGN.md for every UI change (replicate the design of https://oftheoak.co.uk/ and https://www.storeyarchitecture.co.uk/, similar not identical, light mode, white and green, subtle sand-toned glass, Tailwind CSS).

## Access control
- [ ] Row Level Security on every table. Customers see only their own profile, chats and saved items. Agents see only their own agency data. Admins use a separate role.
- [ ] Server-side role checks on every API route; never trust the client.
- [ ] Agents can never write `fee_table` values or `verified_at`.

## Documents and uploads
- [ ] Documents stored in a private bucket; access only through short-lived signed URLs.
- [ ] Allow only specific file types (PDF, JPG, PNG) and set size limits; scan or reject unsafe files.
- [ ] Only the owning agency and admins can read a listing's documents.
- [ ] Duplicate-parcel check on every submission; flag for admin.

## AI safeguards
- [ ] The model calls approved tools only (`search_listings`); it has no direct database access and cannot write.
- [ ] Treat user messages and listing text as untrusted data; never as instructions.
- [ ] Validate every tool argument with Zod before querying.
- [ ] Enforce the daily AI search allowance on the server.
- [ ] Rate limit AI endpoints; set timeouts and maximum output length.
- [ ] Do not expose system prompts or API keys.

## Authentication and sessions
- [ ] Email verification, strong password rules, optional phone verification.
- [ ] Secure, httpOnly cookies; short session lifetimes with refresh.
- [ ] Rate limit and lock out repeated failed sign-ins.

## Payments
- [ ] Use the payment provider's hosted checkout; never handle or store card data.
- [ ] Confirm payments only through verified signed webhooks; make webhook handling idempotent.
- [ ] Read prices from the `plans` table on the server.

## Data protection
- [ ] Follow the Nigeria Data Protection Act; confirm obligations with a lawyer before launch.
- [ ] Collect the minimum personal data; document retention and deletion.
- [ ] Encrypt data in transit and at rest; keep secrets in environment variables only; commit `.env.example` without values.

## Application security
- [ ] Validate and sanitise all inputs; use parameterised queries.
- [ ] Set security headers and a Content Security Policy; protect against XSS and CSRF.
- [ ] Rate limit sign-up, chat and report endpoints.
- [ ] Moderate chat and listings; provide a report button.
- [ ] Dependency audit in CI; keep packages updated.

## Monitoring
- [ ] Audit log for admin actions and document reviews.
- [ ] Error monitoring and alerts for payment and webhook failures.
- [ ] Regular backups with a tested restore.

## Honest limits to show in the product
The platform reviews submitted documents and detects duplicate listings. It does not guarantee legal title. Customers should still use a lawyer and a surveyor before paying for property.
