# [APP NAME]

Mobile-first house hunting for Nigeria. The current checkpoint is the public landing page and design system; product data, authentication, search services and backend integrations are not connected yet.

## Requirements

- Node.js 20.9 or newer
- npm

## Setup

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

The landing page does not require environment variables. Backend work will add names (without values) to `.env.example` for Supabase, the server-side AI provider, payments, email/notifications, and monitoring as those integrations are built.

## Checks

```sh
npm run lint
npm run build
```

Automated tests are not configured in this landing-page checkpoint. The planned test stack is Vitest and Playwright; add their scripts as application behavior is implemented.
