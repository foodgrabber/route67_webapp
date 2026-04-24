# FoodGrabber — Project Context

Canonical context for the FoodGrabber hackathon project. Read this first.

## The Project

**FoodGrabber** is a location-based competitive game. Players open the app and see the **67 spots** near them; they score points by physically visiting as many of those spots as possible. Whoever checks into the most 67 spots wins the leaderboard.

Core loops:
1. **Discover** — surface the 67 curated spots within range of the user's location on a GrabMaps map.
2. **Travel** — routing + ETA to the next spot (bike / car / walking).
3. **Check in** — geofenced confirmation when a player is within ~150m of a spot.
4. **Compete** — live multiplayer leaderboard, per-session or per-region.

## Event

- **Name:** GrabMaps API Hackathon
- **Date:** Friday, 24 April 2026, 09:00–20:00
- **Venue:** Grab @ One North, 3 Media Close, Singapore 138498
- **Hacking window:** 10:00 AM – 5:00 PM (submissions due 5 PM)
- **Finals presentations:** 6:30 PM
- **Organizers:** 65labs.org in partnership with Grab; OpenAI sponsoring free ChatGPT/Codex Pro for all attendees.
- **WhatsApp group:** https://chat.whatsapp.com/IH5eFk9SIb1LUTdf4nfF1X?mode=gi_t
- **WiFi:** `Grab-BYOD` / `7[N@a9f`

## Tracks

Three themes — FoodGrabber primarily targets **Discover the City**.

| Track | Focus |
|---|---|
| 🚗 Intelligent Mobility | Dynamic routing, ETA comparisons, adaptive planners |
| 🗺️ Discover the City | Hyperlocal discovery, curated maps, social sharing of favorite spots |
| 📍 Smarter Places | Richer POI data, live activity visualization |

## Judging Criteria

- **Technical Merit** — code quality, architecture, implementation
- **Polish** — attention to detail, UX, execution
- **Execution** — how well the vision was delivered
- **Wow Factor** — how memorable and impressive the hack is

## Prizes

- 1st: $1,500 GrabVouchers
- 2nd: $1,000
- 3rd: $600
- 4× $250 category prizes (Best Use of GrabMaps APIs, Best Bug Hunter, etc.)
- All participants: GrabMaps API credits + early platform access.

## GrabMaps Platform Setup

1. **Sign up** at `maps.grab.com/developer` and complete your developer profile.
   - Portal login: `GrabMapsDevelopers` / `GrabMapsHackathonApr2026`
2. **Login** with the email you registered at the hackathon with (Google or GitHub SSO).
3. **Generate keys** — MCP and API keys are **separate**. Keep both handy; mismatched keys are a common error.
4. **Tools available in the portal:** Documentation, API Keys, Settings, Usage, Sign Out. Docs cover Intro, Getting Started, Initializing a Map, UI Library Configuration, Searching, Getting Routes, MCP Integration, and an Agent Skill (SKILL.md).
5. **Implementation** — use the API key for protected map/Places calls (`Authorization: Bearer <API_KEY>`), and the MCP key on the MCP transport.

## Best Practices (from organizers)

- **Proxy GrabMaps API calls through your backend** — do not call from the frontend.
  - Protects API credentials from client-side exposure.
  - Avoids CORS and browser restrictions.
  - Gives you usage/monitoring/performance control.
- Public staging style (`mono.json`, keyless) is available for quick prototypes only — production-style calls need a Bearer token.

## GrabMaps Library

- Hosted CDN bundle for plain HTML / static sites:
  ```html
  <script type="module" src="https://maps.grab.com/developer/assets/js/grabmaps.es.js"></script>
  ```
- For bundled apps: `npm install grab-maps`. You also need `maplibre-gl` + its CSS to render a map.
- Default map style: `GET /api/style.json` with `Authorization: Bearer <API_KEY>`; parse the JSON and pass the object to MapLibre's `style`. Do **not** rely on `?key=` query params — use the Bearer header (or `transformRequest` if you must pass a URL).

## Inspiration Demos Shown at Kickoff

- **JourneyGenie** (Saikat) — GrabMaps travel companion for SEA with route planning, weather, landmark-based navigation. https://grabosm.github.io/journeygenie/
- **Grab&Seek** (Soh Leng) — food-spot treasure hunt, get within 150m to claim, top hunters win $15 GrabVouchers. Closest analogue to FoodGrabber — differentiators: the 67-spots format, head-to-head leaderboard competition, scale beyond single-session play.
- **Jakarta Rush Hour Race** (Chip) — bike vs. car routing across Jakarta showing shortcuts delivery-partner data knows about. https://grabosm.github.io/bikevscar

## Logistics

- **Meals:** Lunch ~12pm, snacks all day, dinner ~5:30pm.
- **Hacking space:** MPH Open Space (outside). Toilets also outside. ID bands required at all times.
- **Bug reporting / feedback:** portal has built-in Report a Bug + Share Feedback panels; finishing the feedback survey earns $20 in GrabMaps credits at launch (Best Bug Hunter prize also in play).

## Open Questions / To Decide

- **What exactly are the "67 spots"?** Curated list from us, GrabMaps Places query, or user-generated? (Affects backend design and whether each session pulls a different 67.)
- **Scoring model** — flat 1 point per spot, or weighted by distance / rarity?
- **Session shape** — single-day global leaderboard, or short (e.g. 1-hour) lobbies?
- **Auth** — anonymous nicknames vs. Google/GitHub SSO for the leaderboard?
