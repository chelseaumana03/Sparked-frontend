# Sparked Frontend

Next.js 16 (App Router, SSR) frontend for the Sparked project. Talks to the
[Sparked backend](https://github.com/chelseaumana03/Sparked-backend) — a
separate NestJS service — over HTTP.

## Tech stack

- Next.js 16 with the App Router (Server Components + Client Components)
- TypeScript
- ESLint (Next.js flat config)
- Node.js 22 (pinned via `.nvmrc` and `package.json` `engines`)
- Deployed on [Render](https://render.com) as a Web Service (native runtime,
  configured through `render.yaml`)

## Prerequisites

- Node.js 22 (`nvm use` picks it up from `.nvmrc`)
- npm 10+
- The Sparked backend running locally on port 3001, or a reachable deployment
  URL to point at

## Getting started

```bash
npm install
cp .env.example .env.local
# Edit .env.local to point at your backend
npm run dev
```

Open http://localhost:3000.

### Environment variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Where it runs | Purpose |
|---|---|---|
| `API_URL` | Server only | Used by Server Components, route handlers, Server Actions. Never exposed to the browser, so safe for internal URLs and secrets. |
| `NEXT_PUBLIC_API_URL` | Server + client | Baked into the JS bundle at build time. Used by Client Components that fetch from the browser. |

Locally both usually point at `http://localhost:3001` (the NestJS dev server).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on `$PORT` (falls back to 3000) |
| `npm run lint` | Run ESLint |

## Project layout

```
app/
  layout.tsx          # Root layout
  page.tsx            # Landing page
  globals.css         # Global styles
  api/
    health/route.ts   # GET /api/health -> {"status":"ok"} for Render probes
  backend-check/      # Smoke page: fetches the backend from both server and client
```

## Backend connectivity

The `/backend-check` page demonstrates the two ways the frontend can call the
backend and is a useful smoke test after deploying:

- **Server Component** — fetches `${API_URL}/health` while the page is being
  rendered on the Next.js server. The response is inlined into the HTML the
  browser receives. CORS does not apply here.
- **Client Component** — fetches `${NEXT_PUBLIC_API_URL}/health` from the
  browser after hydration. This exercises the backend's CORS configuration.

Open `/backend-check`; both blocks should show `{"status":"ok"}`.

## Deployment (Render)

The service is defined declaratively in [`render.yaml`](./render.yaml).

- Runtime: Node
- Plan: Starter (always on)
- Region: Frankfurt
- Build: `npm ci --include=dev && npm run build`
  - `--include=dev` is required because `NODE_ENV=production` in the runtime
    env would otherwise cause `npm ci` to skip devDependencies that
    `next build` needs (`typescript`, `@types/*`, `eslint-config-next`).
- Start: `npm run start` (listens on `$PORT`)
- Health check: `GET /api/health`
- Auto-deploy: on push to `main`

### Shared URLs — `sparked-urls` env group

`API_URL`, `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` are not stored in the
YAML. Both the frontend and backend services pull them from a single Render
Environment Group named `sparked-urls`, so a URL change (custom domain,
staging swap, etc.) is a one-place edit in the Render dashboard and both
services redeploy automatically.

When you change `NEXT_PUBLIC_API_URL`, Render triggers a rebuild — that value
is inlined into the client bundle at build time.

### Staging environment

`render.yaml` also defines `sparked-frontend-staging` (our dev environment): same build and start, but
it deploys from the `staging` branch and reads the `sparked-urls-staging` env group,
which points at `sparked-backend-staging`. Setup, the Supabase side and the
branch flow (`feature → staging → main`) are described in the backend README →
"Staging environment".

`sparked-urls-staging` must contain:

- `API_URL=https://sparked-backend-staging.onrender.com`
- `NEXT_PUBLIC_API_URL=https://sparked-backend-staging.onrender.com`
- `FRONTEND_URL=https://sparked-frontend-staging.onrender.com`

Create the `staging` branch here too (`git push origin main:staging`), then run a
Manual Sync on the frontend Blueprint.

### First-time deploy checklist

1. Push both repos to GitHub.
2. In Render, create the `sparked-urls` Environment Group with `API_URL`,
   `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` pointing at the deployed URLs.
3. Create a Blueprint from each repo (backend first, then frontend).
4. Confirm both services show the `sparked-urls` group linked under
   Environment → Linked Environment Groups.
5. Hit `/backend-check` in a browser — both server and client cards should
   report `{"status":"ok"}`.
