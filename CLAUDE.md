# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A **docs-only** repo for **FoodGrabber**, the user's entry to the GrabMaps API Hackathon (Singapore, 2026-04-24). There is no application code here yet — this repo currently exists to capture project context, event materials, and planning notes before implementation starts.

No build, test, or lint commands apply. Future code may land here or in a separate repo; check with the user before assuming.

## Read These First

Before answering anything about the project, read in this order:

1. **`docs/context.md`** — canonical project context: concept, track, judging criteria, GrabMaps portal setup (API vs. MCP keys, auth header, library snippets), backend-proxy best practice, inspiration demos, open design questions.
2. **`README.md`** — one-page project pitch and how-it-works loop.
3. **`docs/luma_project.md`** — raw Luma event page text (logistics, schedule, organizer messages).
4. **`docs/GrabMaps Hackathon Slides.pdf`** — organizer kickoff slides; only open pages you need via the Read tool's `pages` parameter.

## Project Concept (one line)

FoodGrabber surfaces **67 spots** near the user and turns visiting them into a competitive leaderboard. The phrasing "67 spots" is the user's deliberate framing — preserve it verbatim; don't rewrite it to "food spots" or similar.

## Load-Bearing Constraints from the Hackathon

- **Backend proxy for all GrabMaps API calls** — organizers explicitly recommend against calling GrabMaps directly from the frontend (credential safety + CORS). Any architecture suggestion should assume a backend.
- **MCP keys and API keys are separate.** Mismatched keys are the most common error per the slides.
- **Auth is Bearer header**, not `?key=` query param. Don't rely on URL-based keys; use `Authorization: Bearer <API_KEY>` (or MapLibre's `transformRequest` if a URL must carry the key).
- Submissions close **5 PM on 2026-04-24**; finals at 6:30 PM. Time-boxed decisions are appropriate — flag scope creep.

## Open Questions the User Hasn't Resolved

Tracked in `docs/context.md` "Open Questions" — source of the 67 spots, scoring model, session shape, auth. Don't pick one silently; ask or surface the tradeoff.
