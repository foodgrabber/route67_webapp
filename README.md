# FoodGrabber

A location-based competitive game built for the **GrabMaps API Hackathon** (Singapore, 24 Apr 2026).

## The Idea

Find the **67 spots** near you — then race other players to check into the most of them. Part city-discovery, part leaderboard, powered by GrabMaps.

## How It Works

- Open the app → we surface the 67 curated spots within range of your current location.
- Travel to a spot and check in (geofenced confirmation).
- Every check-in scores you points on the live leaderboard.
- Whoever hits the most 67 spots wins.

## Track Fit

- **Discover the City** (primary) — hyperlocal discovery + social map competition.
- Secondary angle into **Smarter Places** via per-spot activity data.

## Tech

- **Frontend / hosting:** Next.js on Vercel (team `dadevchias-projects`).
- **Backend / data:** Supabase (Postgres + Auth + Storage), managed via the Supabase CLI. Project `route67` — ref `sdvrwgsuobososrstexf`, Singapore region. This repo is already linked (`supabase link`).
- **GrabMaps APIs** — map tiles, Places, routing (called via the Next.js backend, not the browser, per hackathon best practices).
- **MCP integration** — for agent-driven spot curation and Q&A.
- Frontend uses the GrabMaps JS library (MapLibre-based).

## Local Setup

1. `cp .env.example .env` and fill in GrabMaps + Supabase keys (never commit `.env`).
2. `supabase login` and `vercel login` if you haven't already.
3. Once Next.js is scaffolded: `npm install && npm run dev`.

## Docs

- [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) — orientation for AI coding agents (live resource IDs, constraints, where to look).
- [`docs/hackathon/context.md`](docs/hackathon/context.md) — hackathon context, credentials, tracks, judging, API setup.
- [`docs/hackathon/luma_project.md`](docs/hackathon/luma_project.md) — original Luma event page.
- [`docs/hackathon/GrabMaps Hackathon Slides.pdf`](<docs/hackathon/GrabMaps Hackathon Slides.pdf>) — organizer slides.
- [`docs/api/source_map.md`](docs/api/source_map.md) — index into the GrabMaps API reference tree.
