# Route 67

A location-based competitive game built for the **GrabMaps API Hackathon** (Singapore, 24 Apr 2026).

Live: **https://route67.vercel.app**

## The Idea

Find the **67 spots** near you — then race other players to check into the most of them. Part city-discovery, part leaderboard, powered by GrabMaps.

## How It Works

- Open the app → we surface the 67 spots within range of your current location.
- Travel to a spot and check in (geofenced confirmation).
- Every check-in scores you points on the live leaderboard.
- Whoever hits the most 67 spots wins.

## Features

- **Two hunt modes** — `67 Lockdown` (radius around you) and `Detour Gang` (A → B with a corridor along the way).
- **Live GrabMaps Places** — spots are real Singapore addresses matching "67" (e.g. `67 Ayer Rajah Cres`, `67 Pall Mall`, `67 South Bridge Rd`).
- **Suggested walking route** — polyline threads through the picked spots in visit order (numbered pins match the drawn line).
- **Socials** — friends by username, Accept/Decline, friends-scoped leaderboard tab.
- **Time-scoped leaderboard** — All-time / 7 days / 24 hours × Global / Friends.
- **Onboarding wizard** — 5-step flow for first-time sign-ins (welcome → how it works → handle → location → finish).

## Track Fit

- **Discover the City** (primary) — hyperlocal discovery + social map competition.
- Secondary angle into **Smarter Places** via per-spot activity data.

## Tech

- **Frontend / hosting:** Next.js 16 (App Router, React 19, Tailwind v4) on Vercel. Project `route67` (team `dadevchias-projects`).
- **Backend / data:** Supabase (Postgres + Auth + Realtime), managed via the Supabase CLI. Project `route67` — ref `sdvrwgsuobososrstexf`, Singapore region.
- **GrabMaps APIs** — map tiles, Places (keyword + nearby + reverse-geo), Directions (with waypoints). All called via Next.js Route Handlers (Edge for tile/style proxy, Node for one-shot queries), never from the browser.
- **Auth** — Supabase Auth with GitHub OAuth + magic-link email.

## Architecture Highlights

- `/api/map-style` + `/api/grab-resource` (Edge) — proxy the GrabMaps style JSON and stream tiles/fonts/sprites with Bearer auth.
- `/api/grabmaps/{nearby,geocode,suggest,route}` (Node) — Places + Directions wrappers.
- `lib/hunt.ts` — server actions for `startHunt` / `startRouteHunt` / `endHunt`. Keyword-based "67" search, multi-sample along route + grid around user, dedupe, rarity buckets, waypoint re-routing.
- `check_in_spot` RPC (SECURITY DEFINER) — server-side haversine gate (≤ 50 m) prevents client-spoofed check-ins.
- Realtime subscription on `profiles` drives live leaderboard updates.

## Local Setup

1. `cp .env.example .env` and fill in GrabMaps + Supabase keys (never commit `.env`).
2. `supabase login` and `vercel login` if you haven't already.
3. `npm install && npm run dev` — opens at `http://localhost:3000`.

## Docs

- [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) — orientation for AI coding agents (live resource IDs, constraints, where to look).
- [`docs/hackathon/context.md`](docs/hackathon/context.md) — hackathon context, credentials, tracks, judging, API setup.
- [`docs/hackathon/luma_project.md`](docs/hackathon/luma_project.md) — original Luma event page.
- [`docs/hackathon/GrabMaps Hackathon Slides.pdf`](<docs/hackathon/GrabMaps Hackathon Slides.pdf>) — organizer slides.
- [`docs/api/source_map.md`](docs/api/source_map.md) — index into the GrabMaps API reference tree.
