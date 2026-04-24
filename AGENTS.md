# AGENTS.md

This file provides guidance to AI coding agents (Codex, Cursor, etc.) working in this repository. It mirrors `CLAUDE.md` — keep them in sync.

## What This Repo Is

Working repo for **FoodGrabber**, the user's entry to the GrabMaps API Hackathon (Singapore, 2026-04-24). Two layers live here:

- **Application code** — Next.js frontend + Supabase backend, deployed on Vercel. (Not yet scaffolded as of 2026-04-24 — check the current tree before assuming layout.)
- **Docs** — `docs/api/` (GrabMaps API reference) and `docs/hackathon/` (event context, planning).

No application code is scaffolded yet, so no build/test/lint commands apply. Once Next.js lands, expect standard `npm run dev` / `npm run build` / `npm run lint` plus `supabase` CLI workflows for database operations.

## Stack & Live Resources

- **Frontend / hosting:** Next.js on Vercel.
  - Vercel account: `dadevchia` · team `DaDevChia's projects` (id `dadevchias-projects`).
- **Backend / data:** Supabase (Postgres + Auth + Storage), managed via the **Supabase CLI** workflow (migrations + `supabase/` folder, not the dashboard for schema changes).
  - Org: `route67` (id `wgqdviugfmvfuihphlga`).
  - Project: `route67` · ref `sdvrwgsuobososrstexf` · region Southeast Asia (Singapore) · created 2026-04-24.
  - This directory is **already linked** — `supabase link --project-ref sdvrwgsuobososrstexf` has been run. The `supabase/` folder is the canonical home for `config.toml`, `migrations/`, and `seed.sql` once `supabase init` runs.
- **Maps / places:** GrabMaps via backend proxy (see hackathon constraints below).

## Read These First

**For project questions** (scope, track, logistics), read in this order:

1. **`docs/hackathon/context.md`** — canonical project context: concept, track, judging criteria, GrabMaps portal setup, backend-proxy best practice, inspiration demos, open design questions.
2. **`README.md`** — one-page project pitch and how-it-works loop.
3. **`docs/hackathon/luma_project.md`** — raw Luma event page text (logistics, schedule, organizer messages).
4. **`docs/hackathon/GrabMaps Hackathon Slides.pdf`** — organizer kickoff slides; only open pages you need via the Read tool's `pages` parameter.

**For API / implementation questions**, start at **`docs/api/source_map.md`** — it indexes the 22-file API tree (see next section).

## Project Concept (one line)

FoodGrabber surfaces **67 spots** near the user and turns visiting them into a competitive leaderboard. The phrasing "67 spots" is the user's deliberate framing — preserve it verbatim; don't rewrite it to "food spots" or similar.

## `docs/api/` — API Documentation Tree

Compiled 2026-04-24; 22 files, ~2,750 lines. Load only the slice you need.

- **[`docs/api/source_map.md`](docs/api/source_map.md)** — root index + "find by task" table. Start here.
- **[`docs/api/Grabmaps_SKILL.md`](docs/api/Grabmaps_SKILL.md)** — single-page canonical reference (auth + library + REST + MCP + constraints). Good for single-shot AI context.
- **[`docs/api/api.md`](docs/api/api.md)** — credentials layout; points at `.env`.
- **[`docs/api/rest/`](docs/api/rest/)** — 19 HTTP endpoints, split by category.
- **[`docs/api/map_components/`](docs/api/map_components/)** — the `grab-maps` JS/TS library (npm + CDN patterns, `GrabMapsLib` widget, composable builders, plain-MapLibre integration, end-to-end examples).
- **[`docs/api/mcp/`](docs/api/mcp/)** — 25 tools exposed by the `grab-maps-playground` MCP server.

Every REST endpoint and MCP tool carries a stability tag: `[upstream-documented]` (in Grab's official docs — 5 REST + 3 MCP) or `[playground-only]` (on this deployment but not in the official docs — subject to change). Check tags before building a critical path on a given endpoint.

## Load-Bearing Constraints from the Hackathon

- **Credentials live in `.env`** (gitignored). Template: `.env.example`. GrabMaps keys: `GRABMAPS_API_KEY`, `GRABMAPS_MCP_TOKEN`, `GRABMAPS_MCP_URL`, `GRABMAPS_DOCS_BASIC_USER`, `GRABMAPS_DOCS_BASIC_PASS`. Supabase keys (pull via `supabase status` / `vercel env pull`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, plus `SUPABASE_SERVICE_ROLE_KEY` for server-only use. **Never paste literal values into tracked files** — the initial version of `api.md` did, and commit `e530b8c` moved them out; don't reintroduce the pattern.
- **Backend proxy for all GrabMaps API calls** — organizers explicitly recommend against calling GrabMaps directly from the frontend (credential safety + CORS). Any architecture suggestion should assume a backend.
- **MCP token and API key are separate.** Mismatched keys are the most common error per the slides.
- **Auth is Bearer header**, not `?key=` query param. Don't rely on URL-based keys; use `Authorization: Bearer ${GRABMAPS_API_KEY}` (or MapLibre's `transformRequest` if a URL must carry the key).
- Submissions close **5 PM on 2026-04-24**; finals at 6:30 PM. Time-boxed decisions are appropriate — flag scope creep.

## Open Questions the User Hasn't Resolved

Tracked in `docs/hackathon/context.md` "Open Questions" — source of the 67 spots, scoring model, session shape, auth. Don't pick one silently; ask or surface the tradeoff.
