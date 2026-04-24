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

- **GrabMaps APIs** — map tiles, Places, routing (called via a backend proxy per hackathon best practices).
- **MCP integration** — for agent-driven spot curation and Q&A.
- Frontend uses the GrabMaps JS library (MapLibre-based).

## Docs

- [`docs/context.md`](docs/context.md) — hackathon context, credentials, tracks, judging, API setup.
- [`docs/luma_project.md`](docs/luma_project.md) — original Luma event page.
- [`docs/GrabMaps Hackathon Slides.pdf`](<docs/GrabMaps Hackathon Slides.pdf>) — organizer slides.
