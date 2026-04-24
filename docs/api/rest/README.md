# REST API Reference

HTTP endpoints exposed by the GrabMaps Playground gateway. All paths are relative to the API origin.

- **Base URL:** `https://maps.grab.com`
- **Auth:** `Authorization: Bearer ${GRABMAPS_API_KEY}` on every protected call (style.json included).
- **Content-Type:** JSON on responses. POST endpoints take JSON bodies.

Credentials live in [`../../../.env`](../../../.env); see [`../api.md`](../api.md).

## Stability tags

| Tag | Meaning |
|---|---|
| `[upstream-documented]` | Listed in the official GrabMaps developer documentation (extracted from the docs-site bundle, 2026-04-24). Considered stable. |
| `[playground-only]` | Exposed by this playground deployment but **not** in the official docs. Subject to change; use with caution. |

## Upstream-documented endpoints (5)

- `GET /api/style.json` — MapLibre style JSON
- `GET /api/v1/maps/poi/v1/search` — keyword POI search
- `GET /api/v1/maps/poi/v1/reverse-geo` — reverse geocoding
- `GET /api/v1/maps/place/v2/nearby` — find nearby places (km radius)
- `GET /api/v1/maps/eta/v1/direction` — route geometry / distance / duration

Every other endpoint below is `[playground-only]`.

## Full endpoint index

| Category | File | Endpoints |
|---|---|---|
| Search / POI | [`search.md`](search.md) | poi/v1/search, poi/v1/autocomplete, poi/v1/reverse-geo, place/v2/nearby, grabplaces/nearby |
| Routing | [`routing.md`](routing.md) | eta/v1/direction, eta/v1/navigation |
| Traffic | [`traffic.md`](traffic.md) | traffic/real-time/{bbox,tile,circle}, traffic-tiles/{z}/{x}/{y}.json, traffic/incidents/{bbox,tile,circle} |
| Street view | [`street_view.md`](street_view.md) | openstreetcam-api/2.0/photo, openstreetcam-api/photos |
| Style & auth | [`style_and_auth.md`](style_and_auth.md) | api/style.json, api/v1/api/style.json, grabid/v1/oauth2/token |

**Total:** 19 endpoints (matches what `discover_api_endpoints` MCP tool reports).

## Cross-cutting gotchas

- **Coordinate order differs per endpoint.** `/eta/v1/direction` takes `lng,lat` by default (flip with `lat_first=true`). `/eta/v1/navigation` takes `lng,lat` when `lat_first=false`. `/place/v2/nearby` and `/poi/v1/reverse-geo` use `location=lat,lng`. When unsure, read the endpoint's param table.
- **Radius units differ.** `place/v2/nearby` uses **kilometres**; `traffic/real-time/circle` and `traffic/incidents/circle` use **metres** (1–50000).
- **`linkReference=GRAB_WAY`** is required on every `/traffic/*/bbox` and `/traffic/incidents/bbox` call.
- **Some endpoints listed by `discover_api_endpoints` return 404 on this deployment** — verified 2026-04-24: `poi/v1/autocomplete`, `traffic/real-time/circle`, `traffic/incidents/circle`, `grabplaces/nearby`. Each is flagged in its page.

## Refreshing the endpoint list

```bash
claude mcp call grab-maps-playground discover_api_endpoints
```

Or from the library:

```javascript
const endpoints = await mapInstance.grabMaps.api.get('/api/debug/endpoints');
```
