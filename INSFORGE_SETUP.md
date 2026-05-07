# InsForge Setup

This project uses the official InsForge TypeScript SDK.

Verified against the official InsForge docs on May 7, 2026:

- https://docs.insforge.dev/
- https://docs.insforge.dev/examples/framework-guides/nextjs
- https://docs.insforge.dev/sdks/typescript/overview
- https://docs.insforge.dev/core-concepts/authentication/architecture

## What We Are Doing Right Now

We are keeping the integration intentionally simple:

- `@insforge/sdk` for the client
- public env vars for `baseUrl` and `anonKey`
- one shared client helper in `src/lib/insforge`
- no auth UI yet
- no custom server wrapper yet

This is enough to:

- connect the app to the database
- fetch data for dashboard screens
- prepare for auth later without overengineering

## 1. Create Your InsForge Project

Create a project in the InsForge dashboard.

You will need these two values:

- project base URL
- anon key

The docs show the client configured like this:

```ts
import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://your-project.region.insforge.app',
  anonKey: 'your-anon-key',
});
```

## 2. Add Local Environment Variables

Copy `.env.example` into `.env.local` and replace the placeholder values.

```bash
cp .env.example .env.local
```

Expected variables:

```bash
NEXT_PUBLIC_INSFORGE_BASE_URL=https://your-project.region.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
```

## 3. Current Project Files

- `src/lib/insforge/env.ts`
- `src/lib/insforge/client.ts`
- `src/lib/insforge/index.ts`

## 4. Auth Notes

According to the official InsForge authentication architecture docs:

- web clients store the refresh token in an `httpOnly` cookie
- browser apps should call `auth.getCurrentUser()` during startup
- if `allowedRedirectUrls` is empty, InsForge allows all redirects in development, but the docs explicitly say not to rely on that in production

For Fincam, the simplest auth plan is:

1. finish the core money flows first
2. then add a minimal sign-up/sign-in flow
3. then add protected user data and redirects

## 5. Recommended Next Backend Step

After you have a real InsForge project and env values, the next best task is:

1. create the initial schema
2. seed one development user
3. seed sample accounts
4. seed one sample pay period
5. connect the Home screen to live data
