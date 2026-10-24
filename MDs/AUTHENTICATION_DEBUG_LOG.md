# ODS Authentication, Google OAuth, Supabase, Vercel, and Dashboard Access Debug Log

## Purpose
This file documents the complete auth and redirect history for the ODS/Lagur project, including all the issues raised during the build, the failed link flows, the Google OAuth problems, the Supabase/Vercel configuration issues, the dashboard preview problems, and the final remediation decisions.

It is meant to serve as the single source of truth for what failed, why it failed, what was changed, what is still unresolved, and what needs to be corrected to restore production-grade auth.

---

## 1. Project and app context

- Project: ODS / Lagur
- Stack: Next.js App Router, TypeScript, Tailwind, Supabase Auth, Google OAuth, Vercel, Resend
- Key app areas involved:
  - /sign-in
  - /sign-up
  - /auth/callback
  - /dashboard
  - /agent/listings
  - /check-email
- Auth-related files involved:
  - app/actions/auth.ts
  - app/auth/callback/route.ts
  - lib/supabase/server.ts
  - lib/auth/dal.ts
  - lib/auth/profile.ts
  - app/dashboard/page.tsx
  - app/sign-in/page.tsx

---

## 2. Problem statements captured from the conversation

These are the issues that were raised repeatedly and became the central debugging theme:

1. Google authentication sign-in keeps redirecting back to the website sign-in page.
2. After sign-in, the app is supposed to go to the next page, but the user is redirected back to sign-in.
3. The authentication and verification link is failing.
4. The flow is not landing correctly on the customer dashboard.
5. The callback is not consistently exchanging the OAuth code successfully.
6. Google sign-in is broken after deleting the Google OAuth client.
7. Supabase authentication config is not aligned with the app callback URL.
8. Vercel environment variables are inconsistent or missing.
9. The auth flow is failing because of misconfigured redirect URLs between Google, Supabase, and Next.js.
10. The app attempts to fetch user/session data and fails because the user does not have a valid session.
11. The app has a “fetch failed” issue during dashboard access.
12. The redirect loop appears to be caused by the auth callback route failing to finish the OAuth exchange properly.
13. There is confusion around whether the issue is UI, Google, Vercel, Supabase, or the app route.
14. The user wants a preview dashboard path that works without real auth, while still keeping the proper auth structure intact for later restoration.
15. The user specifically asked for detailed milestone tracking and to preserve everything in a document.

---

## 3. Timeline of key prompts and requests

### Initial requirement direction
The user said they wanted the project continued from the earlier prompt and documentation set, specifically to proceed via the MD files and follow the product docs.

### Requested work flow
The user explicitly asked to:
- Start with project setup, Tailwind tokens and fonts from DESIGN.md
- Set up the layout shell and landing page hero/scroll story
- Show the landing page before moving to backend
- Finish the landing page and authentication
- Then do the architecture properly
- Add Supabase credentials to .env.local to enable accounts
- Fix the first video on the landing page
- Beautify the sign-in/create-account page
- Work on role differences between customer and agent
- Hook up Resend for emails, verification, invoices, and recommendations
- Use FEATURES.md as the product source of truth
- Deploy to Vercel free tier and continue with the customer dashboard
- Connect to the GitHub repo
- Fix verification/auth flow and Vercel auth configuration

### Critical bug reports
The user then reported the actual production problems:
- Google auth sign-in redirects back to the sign-in page
- User cannot progress after Google login
- The auth verification flow is failing
- The project is not linking correctly across Supabase, Vercel, and Google

### User-requested simplification
Later, the user explicitly requested:
- Remove the linking issue
- Allow direct entry to the customer dashboard for preview
- Do not force sign-in for the demo path
- Rebuild auth flow from scratch without adding extra complexity
- “Let me be able to just click Get Started, click Sign In, and it takes me automatically there without having to sign for anything.”

### Final directive
The user also stated that they wanted everything documented in a dedicated MD file, including the issues, root causes, prompts, fixes, and remediation path.

---

## 4. What actually failed

### 4.1 OAuth redirect loop
The app would start the Google flow, get through Google auth, then return to the local sign-in page instead of continuing to the dashboard.

This typically happens when one or more of the following is broken:
- the Google OAuth client is stale or deleted
- redirect URI mismatch
- Supabase project auth redirect is wrong
- app callback route did not exchange the code correctly
- environment variables were missing or stale in Vercel/local
- cookie or query role handoff was unreliable

### 4.2 Callback exchange failure
The app callback route at /auth/callback is responsible for exchanging the code for a session via Supabase.

If this fails, the app has no authenticated session and then redirects back to sign-in, which creates the false impression that the app is “ignoring” the login.

### 4.3 Missing or mismatched env values
The app requires both the frontend and backend to agree on values such as:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL
- VERCEL_URL

If these drift between local dev and deployed Vercel, the auth flow breaks in subtle ways.

### 4.4 Public/private env confusion
The project needed strict separation between public and private variables.

A common issue is:
- putting secret values in NEXT_PUBLIC_* fields
- or forgetting that Vercel requires different values for production than local .env.local

This can silently break auth even though the app is building successfully.

### 4.5 Google client recreation problem
After the user deleted the Google OAuth client, Google sign-in stopped working until a new client was created and re-linked in Supabase.

This is a major cause of “auth works in theory but fails in practice.”

### 4.6 Role-retention instability
The app initially tried to carry the role through the flow in a brittle way. This created a risk of losing the intended role when redirecting between Google auth and the app callback.

The role should be explicit and durable, and query params or metadata should be used where needed, not vague cookie assumptions.

### 4.7 Dashboard fetch failure
The dashboard page tries to resolve the authenticated user and then fetch user-specific data.

If the session does not exist, the user is effectively unauthenticated, which leads to a fetch/session failure and a redirect or broken experience.

This is why the user saw the “fetch failed” pattern even though the app was otherwise rendering.

---

## 5. Root cause chain

The actual root cause was not one single problem; it was a chain of configuration and flow issues:

1. Google OAuth client was deleted or stale.
2. Supabase Auth / Google provider setup did not match the current Google client.
3. Redirect URIs and callback settings were misaligned.
4. App-level callback route was not consistently exchanging the code for a valid session.
5. Some role and redirect data were being carried in a fragile manner.
6. Vercel env values did not match local or live auth configuration.
7. The app tried to fetch user data before a valid session existed.
8. The result was the redirection loop and the general “fetch failed” symptom.

This was a full auth configuration and flow problem, not just a UI bug.

---

## 6. What the project did right and what was fixed

### Correct things already in place
- Next.js build is working
- App routes are generated correctly
- The callback route exists at /auth/callback
- The app has a proper structure for sign-in, sign-up, callback, profile, and dashboard
- Supabase server client logic is present
- Role-aware dashboard logic exists
- Resend email utilities are in place
- Product docs and design system are being followed

### What was improved
- The app-side auth callback route was hardened
- The role handoff was simplified and made more explicit
- The callback route now handles missing or invalid OAuth state more gracefully
- The app now avoids brutal failures when Supabase env is missing
- A demo-safe path was added so the dashboard could be previewed without external auth
- The app is protected from a full auth crash even when env config is incomplete

### Final decision
Because the user wanted to see the dashboard immediately, the project was temporarily put into preview mode so the customer dashboard can open without needing a working provider session.

This is a safe short-term compromise but not the final production auth state.

---

## 7. Current status

### Current state of the project
- The app builds successfully.
- The dashboard can be accessed in preview mode without live auth.
- The project is stable enough to allow interface review.
- Real Google/Supabase auth remains temporarily bypassed for demonstration.

### What is still true
- The real authentication system is not fully restored yet.
- Google OAuth still requires a fresh client and proper Supabase/Vercel redirect configuration.
- Production auth should not be considered complete until the full provider chain is tested end to end.

---

## 8. Google authentication funnel: what should happen

```mermaid
flowchart TD
    A[User clicks Get Started or Sign In] --> B[Select Customer or Agent]
    B --> C[Click Continue with Google]
    C --> D[Google OAuth consent screen]
    D --> E[Google returns auth code]
    E --> F[Supabase handles OAuth]
    F --> G[Supabase redirects to /auth/callback]
    G --> H[Next.js app reads code and session]
    H --> I[Exchange code for session]
    I --> J[Upsert user profile]
    J --> K[Resolve role and landing page]
    K --> L{Role?}
    L -->|customer| M[/dashboard]
    L -->|agent/company| N[/agent/listings]
    M --> O[Dashboard loads user data]
    N --> P[Agent listing workspace loads]
    O --> Q[Success]
    P --> Q

    X[Failure] --> R[redirect back to /sign-in]
    G --> R
    I --> R
    J --> R
```

### Important interpretation
The failure point is not usually the UI button itself.
The failure is usually in one of these stages:
- Google client deleted or stale
- redirect mismatch
- code exchange fails
- user metadata/role not resolved
- session not created
- app routes back to sign-in

---

## 9. Exact reasons why the user still had a problem

The app had several overlapping issues:

1. Google client was deleted, so OAuth was no longer valid.
2. Redirect URIs were not aligned across Google, Supabase, and Vercel.
3. Supabase redirect values were not consistently set.
4. The app callback route was still vulnerable to configuration drift.
5. The dashboard was protected by auth checks even when the auth state was not valid.
6. The app was showing a false “fetch failed” symptom even though the real issue was missing auth state.
7. The app had not been intentionally switched to a demo safe mode until the user requested preview access.
8. There was no central troubleshooting document preserving all of this history.

---

## 10. Final recommendation and next recovery plan

### To restore real Google auth
1. Create a new Google OAuth client.
2. Add the correct authorized JavaScript origins.
3. Add the correct authorized redirect URIs.
4. Update Supabase Google provider config.
5. Set local and Vercel env correctly.
6. Validate the /auth/callback route end to end.
7. Test Google sign-in and ensure it lands on /dashboard or /agent/listings.
8. Remove the temporary demo bypass only after live auth is confirmed.

### To keep the app usable now
- Use the dashboard preview path for UI review and product testing.
- Restrict real auth restoration to a single clean pass that validates the full funnel from Google → Supabase → callback → redirect → dashboard.

---

## 11. Final summary

The app was suffering from a full authentication pipeline issue, not a simple button bug. The main issues were:
- Google OAuth client drift and deletion
- Supabase redirect misconfiguration
- app callback route failure
- Vercel/local env mismatch
- role handoff fragility
- dashboard fetch failure caused by no valid session

The final temporary remediation was to simplify the flow so the user can see the dashboard without a live provider session while preserving the real auth architecture for future restoration.

The project should now be treated as having two modes:
- Preview mode: for UI and design review
- Production auth mode: for real Google/Supabase/Vercel verification and sign-in flow

This MD file is meant to preserve the exact root cause and remediation path for the next full fix.

---

## 12. Checklist for next implementation pass

- [ ] Create a fresh Google OAuth client
- [ ] Set correct redirect URIs
- [ ] Confirm Supabase project auth provider config
- [ ] Confirm local and Vercel env values
- [ ] Verify auth callback works
- [ ] Test redirect to dashboard as customer
- [ ] Test redirect to agent listing page as agent/company
- [ ] Validate email verification and Resend integration
- [ ] Remove demo bypass once real auth is working
- [ ] Keep this MD file updated as the real fix is completed

---

## 13. Short statement of the real issue

The real issue was not just “Google sign-in fails.” The real issue was the complete connection chain among Google, Supabase, Vercel, app callbacks, and session use. The app was failing because the whole login pipeline was misaligned and because the dashboard was still trying to fetch authenticated user data before a valid session existed.
