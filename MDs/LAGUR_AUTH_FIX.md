# LAGUR_AUTH_FIX.md (instructions for GitHub Copilot)

This file is written for GitHub Copilot (Agent mode in VS Code). Read the whole file before changing anything.
The project owner handles the Google Cloud, Supabase and Vercel dashboard settings separately. You (Copilot) only change code in this repository.

## 0. Goal

Google sign-in and email/password sign-in must work end to end on the live Vercel site and on localhost:

1. A customer who signs in with Google lands on `/dashboard`.
2. An agent or company who signs in with Google lands on `/agent/listings`.
3. Email/password sign-in lands on the page that matches the role stored in the database.
4. Any failure shows a readable error on `/sign-in` or `/sign-up`. No silent failures. No redirect loops.

Stack: Next.js (App Router, TypeScript), Tailwind, Supabase Auth (`@supabase/ssr`), Google OAuth, Vercel, Resend (email).

## 1. Ground rules for Copilot

- Do exactly what each prompt says. Do not refactor or restyle anything else.
- Do not touch design, fonts, colours, copy or layout, except where a prompt says to show an error message.
- Do not install new packages unless a prompt says so.
- Never swallow an error from Supabase. If an insert, upsert or update returns `error`, throw it or redirect with the message.
- Never read the redirect origin from environment variables. Take it from request headers (`x-forwarded-host`, `x-forwarded-proto`, `host`).
- Never put the OAuth `next` path or the `role` in the redirect URL. Use the `lagur_role` cookie.
- Never use `supabase.auth.getSession()` on the server. Use `supabase.auth.getUser()`.
- Never log secrets, tokens, the OAuth `code`, passwords or full cookie values. Cookie NAMES only.
- Keep existing exported function names unless a prompt says otherwise, so other files keep working.
- After each prompt: run `npm run build`, fix errors you caused, then make a git commit with a clear message.
- If a prompt cannot be completed, stop and say exactly why. Do not guess.

## 2. What the owner has already configured (assumptions)

If a symptom below appears, it points to one of these settings. Do not try to fix a dashboard setting in code. Tell the owner which setting is wrong.

- Google provider is enabled in Supabase with the newly created Google Client ID and Secret.
- Google Cloud OAuth client has the redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
- Supabase URL Configuration: Site URL is the live address; Redirect URLs include `http://localhost:3000/**` and `<live address>/**`.
- Supabase Email provider has "Confirm email" turned OFF (until a domain and SMTP exist).
- Vercel has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production, Preview and Development, and the site was redeployed without build cache.
- The tables and policies from section 5 (and any extra tables from supabase/schema.sql) exist in Supabase. If a table is missing, run Prompt 0b first.
- Resend is NOT required for sign-in to work.

## 3. Prompts (run one at a time, in order)

Open Copilot Chat in Agent mode and attach this file. Wait for each prompt to finish and build before the next.

### Prompt 0: inspect only, change nothing

```text
Read these files and do NOT change anything yet: lib/supabase/server.ts, lib/auth/dal.ts, lib/auth/profile.ts, app/actions/auth.ts, app/auth/callback/route.ts, app/sign-in/page.tsx, app/sign-up/page.tsx, app/dashboard/page.tsx, and any middleware.ts or proxy.ts in the project root or src folder. Also read docs/LAGUR_AUTH_FIX.md.
Report back in a short list:
1. In lib/supabase/server.ts: does the cookie handling use getAll and setAll (correct) or the old get, set and remove (wrong for current @supabase/ssr)?
2. In lib/auth/dal.ts: does it use supabase.auth.getUser() (correct) or getSession() (wrong on the server)?
3. Every place in the code that redirects to /sign-in: which pages or functions, and under which condition?
4. Does a middleware.ts or proxy.ts exist that refreshes the Supabase session? Which Next.js and @supabase/ssr versions are installed?
5. Every use of NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_APP_URL, VERCEL_URL and any demo-mode check.
6. The real column names and NOT NULL constraints of public.users and public.agencies (from migrations, SQL files or generated types).
7. The exported function names of lib/auth/dal.ts and lib/auth/profile.ts and every file that imports them.
Do not guess. If something is missing, say it is missing.
```

### Prompt 0b: make sure the database tables exist (run right after Prompt 0)

```text
The Supabase database returned: relation "public.users" does not exist. The tables the code writes to have never been created.
1. Search the whole project for every supabase.from("...") and supabase.rpc("...") call. List every table name and every column the code reads or writes.
2. Check the repository for existing migration or SQL files (supabase/migrations, supabase/*.sql, db/, prisma/, drizzle/). Tell me if any exist and whether they were ever applied.
3. Create supabase/schema.sql. Start from section 5 of docs/LAGUR_AUTH_FIX.md (create table if not exists for public.users and public.agencies, the unique index, row level security and the policies). Add create table if not exists statements for every OTHER table the code uses, with exactly the columns the code needs, sensible types, primary keys, foreign keys, created_at defaults, and row level security with policies so each person can only access their own rows (public listings may be readable by everyone if the code needs it).
4. End the file with: notify pgrst, 'reload schema';
5. Do NOT run the SQL and do NOT change any application code in this step. Tell me which file to paste into the Supabase SQL Editor and list every table it creates.
Then commit.
```

### Prompt 1: profile helper

```text
Follow docs/LAGUR_AUTH_FIX.md, section 4.1. Create or update lib/auth/profile.ts with the ensureProfile and landingFor functions from that section.
Rules:
- Keep every export that already exists in lib/auth/profile.ts and is imported elsewhere. Add the new exports next to them.
- Adjust the column names in the insert and upsert to match the real columns of public.users and public.agencies found in Prompt 0. Include every NOT NULL column.
- Errors must be thrown with the Supabase message. Never ignore the error of an insert or upsert.
- Do not change any other file in this step.
Run the build, then commit. Show me the final file and list what you changed.
```

### Prompt 2: the OAuth callback route

```text
Follow docs/LAGUR_AUTH_FIX.md, section 4.2. Replace app/auth/callback/route.ts with that code.
Rules:
- The route must not read "next" or "role" from the URL. The role comes only from the httpOnly cookie "lagur_role".
- The redirect origin must come from the x-forwarded-host and x-forwarded-proto request headers, never from environment variables.
- Every failure must redirect to /sign-in?error=<message> with the real error text.
- The welcome email must be sent inside after() (or, if the installed Next.js does not export after, as a fire-and-forget promise that catches its own errors). It must never delay or block the redirect.
- Keep the existing import path of sendWelcomeEmail from lib/email/resend. Do not change that file.
- Do not change any other file in this step.
Run the build, then commit.
```

### Prompt 3: the server actions

```text
Follow docs/LAGUR_AUTH_FIX.md, section 4.3. Replace app/actions/auth.ts with that code.
Rules:
- Remove authRedirectBase() and every use of NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_APP_URL and VERCEL_URL in this file. The origin comes from request headers (requestOrigin helper).
- redirectTo for Google must be exactly origin + "/auth/callback" with NO query string.
- signInWithGoogle and signUpWithGoogle must both use one shared startGoogle() function and set the httpOnly cookie "lagur_role" before redirecting.
- signIn must send the user to the page that matches the role stored in the database, not the role from the form.
- signUp must NOT call sendVerificationEmail (Supabase sends the confirmation email itself). If Supabase returns a session straight away, create the profile with ensureProfile and redirect to the landing page. Otherwise redirect to /check-email.
- demoMode() must return true ONLY when process.env.NEXT_PUBLIC_DEMO_MODE === "true".
- Keep these export names exactly: signUp, signIn, signInWithGoogle, signUpWithGoogle, signOut.
- Do not change any other file in this step.
Run the build, then commit.
```

### Prompt 4: show errors on the pages

```text
Follow docs/LAGUR_AUTH_FIX.md, section 4.4.
On app/sign-in/page.tsx and app/sign-up/page.tsx, read the "error" search parameter (searchParams is a Promise in the installed Next.js version, so await it) and show it in a visible alert box with role="alert" above the form, using the existing design tokens and styles.
Rules:
- Do not change the layout, fonts, colours or any other part of these pages.
- Do not log the error in the console.
Run the build, then commit.
```

### Prompt 5: the dashboard guard

```text
Follow docs/LAGUR_AUTH_FIX.md, section 4.5. Update lib/auth/dal.ts.
Rules:
- Use supabase.auth.getUser() only. Never getSession().
- If there is no user, redirect to /sign-in. If there is a user but no row in public.users, call ensureProfile to create it. Never redirect to /sign-in just because the profile row is missing.
- Keep the existing exported function names and return shapes so every page that imports them still works. If a page needs extra fields, keep returning them.
- Make sure no page redirects /sign-in to /dashboard and /dashboard back to /sign-in in a loop.
- Do not change any other file in this step.
Run the build, then commit.
```

### Prompt 6: cookies and session refresh

```text
Using the answers from Prompt 0 and the installed versions of next and @supabase/ssr:
1. If lib/supabase/server.ts uses the old cookie methods (get, set, remove), rewrite it to the current getAll and setAll pattern from the official Supabase Next.js SSR guide. Keep the same exported createClient function name and the behaviour that it returns null when the Supabase environment variables are missing.
2. If there is no session-refresh middleware, add one following the official Supabase Next.js SSR guide (middleware.ts for Next.js 15 and earlier, proxy.ts for Next.js 16). It must only refresh the session and must not redirect any page. Its matcher must exclude _next/static, _next/image, favicon.ico and image files.
3. Do not change any other file in this step.
Run the build, then commit.
```

### Prompt 7: clean up and verify

```text
Final pass for auth:
1. Search the whole project for NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_APP_URL and VERCEL_URL. Remove any that remain inside auth code. Keep them only if needed for something unrelated to auth (for example page metadata), and tell me where.
2. Create or update .env.example with the variable NAMES only (no values): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_DEMO_MODE (documented as: leave unset or false in production).
3. Run npm run build and npm run lint. Fix errors caused by the auth changes. Do not change anything unrelated to auth.
4. Give me a summary of every file you changed in all prompts, and a short manual test script: sign up as a customer with Google, sign out, sign in again, open /dashboard, then sign in as an agent and open /agent/listings.
```

### Prompt 8 (LATER, only after the owner connects a domain and Resend SMTP): email confirm route

```text
Follow docs/LAGUR_AUTH_FIX.md, section 4.6. Add app/auth/confirm/route.ts. It must call supabase.auth.verifyOtp({ type, token_hash }), then ensureProfile, then redirect to the landing page for the role. Errors redirect to /sign-in?error=<message>. Do not change any other file. Run the build, then commit.
```

### Prompt 9 (use when the owner reports an error): diagnose from the error text

```text
The owner reports this error text from the address bar after ?error= : "<PASTE ERROR HERE>" (and, if given, the Supabase Auth log line: "<PASTE LOG LINE HERE>").
Using docs/LAGUR_AUTH_FIX.md, section 6 (error playbook):
1. Find the matching row. State in one sentence whether the cause is in CODE or in a DASHBOARD SETTING.
2. If it is in code, fix only that cause, run the build, and commit.
3. If it is a dashboard setting, change no code. Tell me in plain words which setting is wrong and exactly what value it must have.
4. If no row matches, add the temporary debug logging from section 7, tell me to reproduce the problem once and send you the [auth] log lines from the Vercel logs, and wait.
Do not change anything else.
```

### Prompt 10: remove temporary debug logging

```text
Remove all temporary [auth] debug logging added for diagnosis (section 7 of docs/LAGUR_AUTH_FIX.md). Keep the real error handling. Run the build and commit.
```

## 4. Code

Adjust column names to the real tables. If the build complains about types, keep the error handling.

### 4.1 `lib/auth/profile.ts` (add these exports; keep any existing ones)

```ts
import type { SupabaseClient, User } from "@supabase/supabase-js";

const roles = new Set(["customer", "agent", "company"]);

export const landingFor = (role: string) =>
  role === "customer" ? "/dashboard" : "/agent/listings";

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
  fallbackRole = "customer",
) {
  const { data: existing } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return { role: existing.role as string };

  const meta = user.user_metadata ?? {};
  const role = roles.has(meta.role)
    ? (meta.role as string)
    : roles.has(fallbackRole)
      ? fallbackRole
      : "customer";

  const { error } = await supabase.from("users").insert({
    id: user.id,
    role,
    full_name: meta.full_name ?? meta.name ?? "",
    email: user.email,
    phone: meta.phone ?? null,
  });
  if (error) throw new Error(`Profile could not be saved: ${error.message}`);

  if (role !== "customer") {
    const { error: agencyError } = await supabase.from("agencies").upsert(
      {
        owner_id: user.id,
        business_name: meta.business_name || "My agency",
        rc_number: meta.rc_number || null,
        status: "pending",
      },
      { onConflict: "owner_id", ignoreDuplicates: true },
    );
    if (agencyError) throw new Error(`Agency could not be saved: ${agencyError.message}`);
  }

  return { role };
}
```

### 4.2 `app/auth/callback/route.ts` (replace the whole file)

```ts
import { NextResponse, after, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, landingFor } from "@/lib/auth/profile";
import { sendWelcomeEmail } from "@/lib/email/resend";

function publicOrigin(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.nextUrl.origin;
  const proto = host.startsWith("localhost")
    ? "http"
    : (request.headers.get("x-forwarded-proto") ?? "https");
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);
  const fail = (message: string) =>
    NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(message)}`);

  const params = request.nextUrl.searchParams;
  const oauthError = params.get("error_description") ?? params.get("error");
  if (oauthError) return fail(oauthError);

  const code = params.get("code");
  if (!code) {
    return fail("No sign-in code came back. Check the Redirect URLs in Supabase.");
  }

  const supabase = await createClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return fail(error?.message ?? "Could not create a session.");
  }

  const cookieStore = await cookies();
  const wanted = cookieStore.get("lagur_role")?.value ?? "customer";
  cookieStore.delete("lagur_role");

  let role: string;
  try {
    ({ role } = await ensureProfile(supabase, data.user, wanted));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Profile could not be saved.");
  }

  const user = data.user;
  after(async () => {
    try {
      await sendWelcomeEmail({
        email: user.email ?? "",
        fullName: user.user_metadata?.full_name ?? "there",
        role,
      });
    } catch (e) {
      console.warn("Welcome email failed", e);
    }
  });

  return NextResponse.redirect(`${origin}${landingFor(role)}`);
}
```

If the build says `after` is not exported from `next/server` (Next.js older than 15.1), replace the `after(...)` block with:

```ts
void sendWelcomeEmail({
  email: user.email ?? "",
  fullName: user.user_metadata?.full_name ?? "there",
  role,
}).catch((e) => console.warn("Welcome email failed", e));
```

### 4.3 `app/actions/auth.ts` (replace the whole file)

```ts
"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, landingFor } from "@/lib/auth/profile";

const allowedRoles = ["customer", "agent", "company"] as const;
type Role = (typeof allowedRoles)[number];

const signupSchema = z.object({
  role: z.enum(allowedRoles),
  full_name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(24),
  password: z.string().min(12).max(128),
  business_name: z.string().trim().max(120).optional(),
  rc_number: z.string().trim().max(40).optional(),
});

function normaliseRole(value: FormDataEntryValue | null | undefined): Role {
  const input = typeof value === "string" ? value : "customer";
  return (allowedRoles as readonly string[]).includes(input) ? (input as Role) : "customer";
}

// Demo mode is ONLY on when explicitly switched on. Never guessed from missing env variables.
function demoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost")
    ? "http"
    : (h.get("x-forwarded-proto") ?? "https");
  return `${proto}://${host}`;
}

const enc = encodeURIComponent;

export async function signUp(formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/sign-up?error=${enc(parsed.error.issues[0]?.message ?? "Check your details.")}`);
  }

  const values = parsed.data;
  if (values.role !== "customer" && (!values.business_name || values.business_name.length < 2)) {
    redirect("/sign-up?error=Add+your+business+name.");
  }

  if (demoMode()) redirect(landingFor(values.role));

  const supabase = await createClient();
  if (!supabase) redirect(`/sign-up?error=${enc("Supabase is not configured.")}`);

  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`, // only used when "Confirm email" is ON
      data: {
        role: values.role,
        full_name: values.full_name,
        phone: values.phone,
        business_name: values.business_name ?? "",
        rc_number: values.rc_number ?? "",
      },
    },
  });
  if (error) redirect(`/sign-up?error=${enc(error.message)}`);

  // "Confirm email" OFF: Supabase returns a session straight away.
  if (data.session && data.user) {
    try {
      await ensureProfile(supabase, data.user, values.role);
    } catch (e) {
      redirect(`/sign-up?error=${enc(e instanceof Error ? e.message : "Profile could not be saved.")}`);
    }
    redirect(landingFor(values.role));
  }

  // "Confirm email" ON: Supabase sends the confirmation email itself.
  redirect("/check-email");
}

export async function signIn(formData: FormData) {
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/sign-in?error=Enter+a+valid+email+and+password.");

  if (demoMode()) redirect(landingFor(normaliseRole(formData.get("role"))));

  const supabase = await createClient();
  if (!supabase) redirect(`/sign-in?error=${enc("Supabase is not configured.")}`);

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    redirect(`/sign-in?error=${enc(error?.message ?? "Sign-in failed.")}`);
  }

  let role = "customer";
  try {
    ({ role } = await ensureProfile(supabase, data.user, "customer"));
  } catch (e) {
    redirect(`/sign-in?error=${enc(e instanceof Error ? e.message : "Profile error.")}`);
  }
  redirect(landingFor(role));
}

async function startGoogle(formData: FormData, errorPath: "/sign-in" | "/sign-up") {
  const role = normaliseRole(formData.get("role"));

  if (demoMode()) redirect(landingFor(role));

  const supabase = await createClient();
  if (!supabase) redirect(`${errorPath}?error=${enc("Supabase is not configured.")}`);

  const origin = await requestOrigin();
  (await cookies()).set("lagur_role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https"),
    maxAge: 600,
    path: "/",
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`, // no query string on purpose
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) {
    redirect(`${errorPath}?error=${enc(error?.message ?? "Google sign-in is unavailable right now.")}`);
  }
  redirect(data.url);
}

export async function signInWithGoogle(formData: FormData) {
  return startGoogle(formData, "/sign-in");
}

export async function signUpWithGoogle(formData: FormData) {
  return startGoogle(formData, "/sign-up");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
```

### 4.4 Show errors on the sign-in and sign-up pages

```tsx
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <>
      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}
      {/* existing sign-in form stays exactly as it is */}
    </>
  );
}
```

Do the same on the sign-up page. Use the project's existing alert styling if it has one.

### 4.5 `lib/auth/dal.ts` (the session check)

```ts
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth/profile";

export const verifySession = cache(async () => {
  const supabase = await createClient();
  if (!supabase) redirect("/sign-in?error=Server+is+not+configured");

  const {
    data: { user },
  } = await supabase.auth.getUser(); // always getUser(), never getSession()
  if (!user) redirect("/sign-in");

  // A missing profile is repaired here instead of bouncing the user to /sign-in
  const { role } = await ensureProfile(supabase, user, "customer");
  return { user, role };
});
```

Keep the export names the existing pages import. Rename `verifySession` to match if needed.

### 4.6 Email confirm route (LATER, only when "Confirm email" is turned back on)

The owner must set the Supabase "Confirm signup" email template link to
`<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>`

`app/auth/confirm/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, landingFor } from "@/lib/auth/profile";

function publicOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.nextUrl.origin;
  const proto = host.startsWith("localhost") ? "http" : (request.headers.get("x-forwarded-proto") ?? "https");
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);
  const fail = (m: string) => NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(m)}`);

  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  if (!tokenHash || !type) return fail("This confirmation link is incomplete.");

  const supabase = await createClient();
  if (!supabase) return fail("Supabase is not configured on the server.");

  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error || !data.user) return fail(error?.message ?? "This link has expired. Please sign up again.");

  try {
    const { role } = await ensureProfile(supabase, data.user, "customer");
    return NextResponse.redirect(`${origin}${landingFor(role)}`);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Profile could not be saved.");
  }
}
```

## 5. SQL reference (the owner runs this in the Supabase SQL Editor)

Copilot: do not run this. Save it as the base of `supabase/schema.sql` (see Prompt 0b). The code in section 4 writes these `users` columns: `id, role, full_name, email, phone`, and these `agencies` columns: `owner_id, business_name, rc_number, status`. If the code uses other columns, add them here. If the real tables already exist with other column names, change the code to match instead.

```sql
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'agent', 'company', 'admin')),
  full_name text not null default '',
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  business_name text not null default 'My agency',
  rc_number text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now()
);

create unique index if not exists agencies_owner_id_key on public.agencies(owner_id);

alter table public.users enable row level security;
drop policy if exists "users read own" on public.users;
drop policy if exists "users insert own" on public.users;
drop policy if exists "users update own" on public.users;
create policy "users read own"   on public.users for select using (auth.uid() = id);
create policy "users insert own" on public.users for insert with check (auth.uid() = id);
create policy "users update own" on public.users for update using (auth.uid() = id);

alter table public.agencies enable row level security;
drop policy if exists "agency owner all" on public.agencies;
create policy "agency owner all" on public.agencies for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

notify pgrst, 'reload schema';
```

`users.role` must allow `customer`, `agent` and `company`.

## 6. Error playbook (what the error means and what Copilot does)

The error text appears after `?error=` on `/sign-in` or `/sign-up`. Match it, decide CODE or SETTING, and act.

| Error text or symptom | Cause | Type | What Copilot does |
|---|---|---|---|
| `relation "public.users" does not exist` (SQL error 42P01), or `Could not find the table 'public.users' in the schema cache` (PGRST205), or the profile never saves | The database tables were never created in this Supabase project | SETTING (database) | Run Prompt 0b to generate supabase/schema.sql, then tell the owner to paste it into the Supabase SQL Editor. After it runs, the app must be retested |
| Google page shows `redirect_uri_mismatch` | Google OAuth client's redirect URI is not exactly Supabase's callback | SETTING | Change no code. Tell the owner: in Google Cloud, the only redirect URI must be `https://<project-ref>.supabase.co/auth/v1/callback` |
| Google page shows `Error 403: access_denied` | Google consent screen is in Testing and the account is not a test user | SETTING | Tell the owner: set the consent screen Audience to "In production" or add the email as a test user |
| `invalid_client`, `Unauthorized`, `invalid_client_secret` | Old or wrong Google Client ID or Secret saved in Supabase | SETTING | Tell the owner to paste the new Client ID and Secret into Supabase, Providers, Google |
| `Unsupported provider: provider is not enabled` | Google is switched off in Supabase | SETTING | Tell the owner to enable it |
| User lands on `/?code=...` or another wrong page instead of `/auth/callback` | The callback address is not on Supabase's Redirect URLs list | SETTING | Tell the owner to add `<live address>/**` and `http://localhost:3000/**` under Redirect URLs. Also confirm in code that `redirectTo` has no query string |
| `PKCE code verifier not found` or `code verifier` | Sign-in started on one host and finished on another (localhost vs 127.0.0.1, an env-based origin, another browser) | CODE first | Confirm Prompt 3 was applied (origin from headers). Confirm lib/supabase/server.ts uses getAll and setAll (Prompt 6). Tell the owner to use one host name, clear site cookies and retry in a private window |
| `Profile could not be saved: ...` | Insert into `users` failed; the message names the cause (missing column, NOT NULL, row security, check constraint) | CODE or SETTING | If it names a column that does not exist or a NOT NULL column that is missing, fix `ensureProfile` to match the real table. If it says row-level security, tell the owner to run the SQL in section 5 |
| `Agency could not be saved: ...` | `agencies` upsert failed (no unique index on owner_id, row security, status check constraint) | CODE or SETTING | Same approach. A "no unique or exclusion constraint matching the ON CONFLICT" message means the owner must run the unique index SQL |
| `Email not confirmed` | Password user signed up while Confirm email was on | SETTING | Tell the owner to turn Confirm email off in Supabase, then use a new account |
| `Invalid API key` or `Invalid JWT` | Wrong or old Supabase key, or Vercel was not redeployed after changing env | SETTING | Tell the owner to check the two NEXT_PUBLIC_SUPABASE variables in Vercel for all environments and redeploy without build cache |
| `Supabase is not configured on the server.` | Supabase env variables are missing at build or runtime | SETTING | Tell the owner which variable names are missing (createClient returns null) |
| `No sign-in code came back` | Same as the wrong-page row | SETTING | Same as above |
| Sign-in page shows nothing and the URL has no error | An old build is live, or the error is not displayed | CODE first | Confirm Prompt 4 was applied; tell the owner to redeploy without build cache |
| Redirect loop between `/sign-in` and `/dashboard` | A page redirects to sign-in when a profile is missing, or demo mode is guessed | CODE | Re-check Prompt 5 and `demoMode()`. Search for every `redirect("/sign-in")` and list each condition |
| Google works locally but not on Vercel | Origin from env, missing Vercel env, missing Redirect URL for the live address | SETTING or CODE | Confirm no env-based origin remains (Prompt 7), then list the Vercel variables the owner must set |
| `after` is not exported from next/server | Next.js older than 15.1 | CODE | Use the fire-and-forget fallback shown in section 4.2 |
| Type errors on `supabase.from("users")` | Generated database types do not include the table or columns | CODE | Fix the types or cast narrowly. Do not remove error handling |

## 7. Temporary debug logging (only when the playbook has no match)

Add these `console.log` lines, each starting with `[auth]`, then remove them with Prompt 10.

In `app/actions/auth.ts`, inside `startGoogle`, before the redirect:
```ts
console.log("[auth] startGoogle", { origin, role, redirectTo: `${origin}/auth/callback` });
```

In `app/auth/callback/route.ts`, after computing `origin`, `code` and the exchange result:
```ts
console.log("[auth] callback", {
  origin,
  hasCode: Boolean(code),
  cookieNames: request.cookies.getAll().map((c) => c.name),
  exchangeError: error?.message ?? null,
  userId: data?.user?.id ?? null,
});
```

In `lib/auth/dal.ts`, before any redirect to `/sign-in`:
```ts
console.log("[auth] dal: no user, redirecting to /sign-in");
```

Never log the code value, tokens, passwords or cookie values.

## 8. Definition of done

- `npm run build` and `npm run lint` pass.
- Google sign-in as customer lands on `/dashboard`; as agent or company lands on `/agent/listings`.
- Signing out and signing in again lands on the same page without errors.
- A deliberately wrong configuration shows a readable `?error=` message on the sign-in page, never a blank page and never a loop.
- No environment variable is used to build the OAuth redirect address.
- No temporary `[auth]` logging remains.

## 9. If something breaks badly

- Every prompt ends with a git commit. To undo the last step: `git revert HEAD` (or `git restore .` for uncommitted changes).
- If the build fails after a prompt, fix only the errors caused by that prompt before continuing.
