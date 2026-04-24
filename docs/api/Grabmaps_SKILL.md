# GrabMaps — library and API reference

Reference for the **`grab-maps` JavaScript/TypeScript library** (MapLibre-based), **HTTP endpoints** the gateway exposes for maps/places/routing (typically behind `Authorization: Bearer <API_KEY>`), optional **MCP tools**, and how to load the **map style** for MapLibre.

**Map style:** use **`GET https://maps.grab.com/api/style.json`** with **`Authorization: Bearer <API_KEY>`**, parse JSON, and set MapLibre’s `style` to that object (§2.8, §5). The GrabMaps library does this automatically when you set `baseUrl` + `apiKey` and omit a custom `style`. Do **not** rely on `?key=` query parameters on `https://maps.grab.com/api/style.json`—use the Bearer header (or `transformRequest` if you must pass a style URL string).

API keys often look like `bm_…`.

---

## 1. Authentication

- **Protected map and Places calls:** `Authorization: Bearer <API_KEY>`.
- **Map style for MapLibre:** `GET https://maps.grab.com/api/style.json` requires **`Authorization: Bearer <API_KEY>`**. Fetch the JSON and pass it to MapLibre as `style` (§2.8). Same pattern as the hosted docs and demos.
- **MCP (HTTP):** `Authorization: Bearer YOUR_API_KEY` on the MCP transport if your deployment exposes MCP (section 4).

---

## 2. `grab-maps` library

Package name: `grab-maps`. Architecture and upgrade notes: `DOCS.md`, `README.md`, `MAPLIBRE.md` in the package.

### 2.1 Including the library (script tag)

For a plain HTML page or a quick prototype without npm, include the hosted ES module bundle from the Grab developer CDN:

```html
<script type="module" src="https://maps.grab.com/developer/assets/js/grabmaps.es.js"></script>
```

Use `type="module"` so the browser loads `grabmaps.es.js` as an ES module. You still need MapLibre (`maplibre-gl`) and its CSS on the page when you instantiate a map; see `MAPLIBRE.md` in the package. For bundled apps, prefer installing `grab-maps` from npm and importing it in your build.

### 2.2 Integration levels

| Level | Entry | Use case |
|--------|--------|----------|
| Composable API | `GrabMapsBuilder` → `GrabMapsClient` → builders (`MapBuilder`, …) | Custom UIs |
| All-in-one widget | `GrabMapsLib` + options (`library.ts`) | Search, routing, layers, etc. |
| Minimal embed | `embed.ts` | Map-only embed; `McpStateAdapter` vs `MemoryStateAdapter` |
| Plain MapLibre | `maplibregl` + **`GET https://maps.grab.com/api/style.json`** with Bearer, then `style: json` (§2.8) | Full tiles/style via authenticated style |

### 2.3 `GrabMapsClient` services

After `new GrabMapsBuilder(…).build()`:

| Service | Role |
|---------|------|
| `client.api` | Low-level GET/POST/DELETE with auth |
| `client.search` | POI search, nearby, reverse geocode |
| `client.routing` | Directions / waypoints |

### 2.4 Builders

`MapBuilder`, `SearchBuilder`, `RouteBuilder` / `RoutingIntegrationBuilder`, `PolygonBuilder`, `CircleBuilder`, `WaypointBuilder`, `PinBuilder`, `StyleBuilder`, `GeocodingBuilder`, `ControlsBuilder`, `NearbyBuilder`.

### 2.5 `GrabMapsLib`

Constructor: `new GrabMapsLib(options)`. Notable methods (non-exhaustive): `getMap()`, `getClient()`, `onReady()`, `flyTo()`, `openPOI()`, `searchPlaces()`, `setLayerVisibility()`, `calculateWaypointRoute()`, `clearRoute()`, `clearWaypoints()`, `destroy()`, `instance.api`.

Core options include `container`, `apiKey`, `baseUrl`, viewport (`lat`, `lng`, `zoom`), `style` (omit to fetch from `https://maps.grab.com/api/style.json` when `baseUrl` is `https://maps.grab.com`), feature toggles (`navigation`, `attribution`, `buildings`, `labels`), UI (`showSearchBar`, `showWaypointsModal`, `showLayersMenu`, …), `routing`, `layers`, polygon/circle drawing, `search`, pins/polygons/circles/waypoints, and `errorHandler`.

### 2.6 Minimal builder usage

```javascript
const client = new GrabMapsBuilder()
  .setBaseUrl('https://maps.grab.com')
  .setApiKey('<API_KEY>')
  .build();

const map = new MapBuilder(client)
  .setContainer('map')
  .setCenter([103.8198, 1.3521])
  .setZoom(12)
  .enableNavigation()
  .enableAttribution()
  .build();
```

Reuse one **client** for multiple builders to avoid redundant auth handshakes.

### 2.7 Get routes (library)

Use the same `GrabMapsClient` from `GrabMapsBuilder` (section 2.6).

**Routes** — `client.routing.getRoute(start, end, options?)` returns a `Route`; coordinates are `[latitude, longitude]` pairs.

```javascript
const client = new GrabMapsBuilder()
  .setBaseUrl('https://maps.grab.com')
  .setApiKey('<API_KEY>')
  .build();

const route = await client.routing.getRoute(
  [1.3521, 103.8198],
  [1.2921, 103.7767],
  { mode: 'car' }
);
// Use route geometry / legs for map line or turn-by-turn UI
```

### 2.8 MapLibre + authenticated style

Preferred: fetch the style document, then pass the object to MapLibre (avoids auth on tile requests being conflated with the style URL).

```javascript
fetch('https://maps.grab.com/api/style.json', {
  headers: { Authorization: 'Bearer <API_KEY>' },
})
  .then((r) => r.json())
  .then((style) => {
    new maplibregl.Map({ container: 'map', style, center: [103.8198, 1.3521], zoom: 12 });
  });
```

If you must use a **string** `style` URL instead, set `transformRequest` on the `Map` options so `Request`s to `https://maps.grab.com/api/style.json` include `Authorization: Bearer <API_KEY>` (MapLibre will merge your transform with its own tile requests).

---

## 3. HTTP API paths (gateway)

Paths are relative to the configured API base (commonly `https://maps.grab.com/api/v1/`). Build the full URL as **`https://maps.grab.com` + `/api/v1` + suffix** from the tables (for example `https://maps.grab.com/api/v1/maps/poi/v1/search`). The `/v1` or `/v2` inside a suffix such as `/maps/poi/v1/...` or `/maps/place/v2/...` is part of the resource path, not a duplicate of the gateway prefix.

> **Stability note.** The GrabMaps developer docs only document **5 REST endpoints** (style.json, poi/v1/search, poi/v1/reverse-geo, place/v2/nearby, eta/v1/direction). The tables below plus the "Playground-only endpoints" section cover the full 19 endpoints this playground deployment exposes. For the upstream-vs-playground split and live-probe availability, see [`../api/rest/README.md`](rest/README.md).

### Places and search (POI)

| Method | Path (suffix) | Notes |
|--------|-----------------|--------|
| GET | `/maps/poi/v1/search` | `keyword`, `country`, optional `location` bias, `limit`. |
| GET | `/maps/place/v2/nearby` | **Find Nearby Places:** `location` (`lat,lng`), `radius` in **kilometres** (default 1), `limit`, `rankBy`, `language`. |
| GET | `/maps/poi/v1/reverse-geo` | Reverse: `location` as `lat,lng` |

### Routing and ETA

| Method | Path (suffix) | Notes |
|--------|----------------|--------|
| GET | `/maps/eta/v1/direction` | Repeated `coordinates` as `lng,lat`; `profile`, avoid options, etc. |

`GET /api/v1/maps/eta/v1/navigation` is for turn-by-turn / voice apps. For map geometry use **`direction`** only.

### Style and coverage

| Method | Path | Notes |
|--------|------|--------|
| GET | `https://maps.grab.com/api/style.json` | **Bearer required.** Map style JSON for MapLibre. Theme query params may include `basic`, `dark`, `satellite`. Returns the style document—use as `style` in `maplibregl.Map` after `fetch` + `json()` (§2.8). |
| GET | `/api/v1/coverage-tiles/{x}/{y}/{z}.png` | Coverage tiles (`CoverageLayer`) |

### Map issues

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/v1/map-issues/report` | When configured |

### Sessions (waypoint and route sharing)

| Method | Path |
|--------|------|
| POST | `/api/v1/sessions/waypoints` |
| POST | `/api/v1/sessions/routes` |
| GET | `/api/v1/sessions/waypoints/{sessionId}` |
| GET | `/api/v1/sessions/routes/{sessionId}` |

### Playground-only endpoints (14)

Exposed by this deployment but **not** in the upstream developer docs. Subject to change. Full per-endpoint docs with params + sample responses in [`rest/`](rest/).

| Category | Method | Path | Live? (2026-04-24) | Notes |
|---|---|---|---|---|
| search | GET | `/api/v1/maps/poi/v1/autocomplete` | ❌ 404 | Short-keyword autocomplete. Use `/poi/v1/search` instead. |
| search | POST | `/api/v1/grabplaces/nearby` | ❌ 404 | JSON body; use `/place/v2/nearby` instead. |
| routing | GET | `/api/v1/maps/eta/v1/navigation` | ✅ (needs `requestID`) | Turn-by-turn. Returns 400 without `requestID` query param. |
| traffic | GET | `/api/v1/traffic/real-time/bbox` | ✅ | Real-time speeds; `linkReference=GRAB_WAY` required. |
| traffic | GET | `/api/v1/traffic/real-time/tile` | ✅ | Speeds by tile. |
| traffic | GET | `/api/v1/traffic/real-time/circle` | ❌ 404 | |
| traffic | GET | `/api/v1/traffic-tiles/{z}/{x}/{y}.json` | ⚠ partial | GeoJSON per tile; invalid tile coords return 500. |
| traffic | GET | `/api/v1/traffic/incidents/bbox` | ✅ | Keep bbox small. |
| traffic | GET | `/api/v1/traffic/incidents/tile` | ✅ | |
| traffic | GET | `/api/v1/traffic/incidents/circle` | ❌ 404 | |
| streetview | GET | `/api/v1/openstreetcam-api/2.0/photo/` | ✅ | 360° photos by coordinate. |
| streetview | GET | `/api/v1/openstreetcam-api/photos` | ✅ | 360° photos by bbox. |
| style | GET | `/api/v1/api/style.json` | ✅ | Alternative proxy path for style. |
| auth | POST | `/api/v1/grabid/v1/oauth2/token` | — | OAuth2 token (user-auth flow). |

### Example `fetch` calls (routes and places)

Same host: `https://maps.grab.com`. Send `Authorization: Bearer <API_KEY>` on protected routes—including **`GET https://maps.grab.com/api/style.json`** before initializing the map.

#### Routes (`GET .../maps/eta/v1/direction`)

Repeated `coordinates` as **`lng,lat`** per point. Use `overview=full` for route geometry on the map. Response includes `routes[]` with geometry, distance (m), duration (s), legs, steps.

```javascript
const p = new URLSearchParams();
p.append('coordinates', '103.8198,1.3521');
p.append('coordinates', '103.7767,1.2921');
p.set('profile', 'driving');
p.set('overview', 'full');

const data = await fetch('https://maps.grab.com/api/v1/maps/eta/v1/direction?' + p, {
  headers: { Authorization: 'Bearer <API_KEY>' },
}).then((r) => r.json());

const first = data.routes?.[0];
// first.geometry, first.legs, first.distance, first.duration
```

#### Places — keyword search

```javascript
const q = new URLSearchParams({
  keyword: 'Marina Bay Sands',
  country: 'SGP',
  location: '1.3521,103.8198',
  limit: '10',
});
const data = await fetch('https://maps.grab.com/api/v1/maps/poi/v1/search?' + q, {
  headers: { Authorization: 'Bearer <API_KEY>' },
}).then((r) => r.json());
```

#### Places — nearby (radius in km)

```javascript
const q = new URLSearchParams({
  location: '1.3521,103.8198',
  radius: '1',
  limit: '10',
  rankBy: 'distance',
});
const data = await fetch('https://maps.grab.com/api/v1/maps/place/v2/nearby?' + q, {
  headers: { Authorization: 'Bearer <API_KEY>' },
}).then((r) => r.json());
```

---

## 4. MCP tools

The `grab-maps-playground` MCP server exposes **25 tools** over HTTP. Send `Authorization: Bearer ${GRABMAPS_MCP_TOKEN}` on the MCP transport — the MCP token is **separate** from the REST API key. Full per-tool docs (input schema + return shape + example call) in [`mcp/`](mcp/).

### Connect

```bash
set -a; source .env; set +a
claude mcp add --transport http grab-maps-playground \
  "$GRABMAPS_MCP_URL" \
  --header "Authorization: Bearer $GRABMAPS_MCP_TOKEN"
```

### Upstream-documented (3)

The upstream developer docs mention three MCP tools. The playground renamed two of them:

| Upstream name | Playground tool | Purpose |
|---|---|---|
| `search_places` | `search_places` | Code-gen for `mapInstance.searchPlaces(...)` |
| `nearby_search` | `search_nearby_pois` | Nearby-places data fetch |
| `get_directions` | `navigation` | Data-fetch routes via `/eta/v1/direction` |

### Playground-only (22)

Not in the upstream docs — subject to change.

| Category | Tools |
|---|---|
| Search | `search` |
| Routing (all code-gen / mutating except `navigation`) | `add_waypoint`, `add_route`, `calculate_waypoint_route`, `clear_route`, `clear_waypoints`, `route_waypoints` |
| Map state (all code-gen / mutating) | `fly_to`, `control_layers`, `update_map_state_from_url`, `toggle_waypoints_modal`, `open_poi` |
| Traffic (all data-fetch) | `get_traffic`, `get_traffic_tile`, `get_incidents` |
| Tiles & street view | `get_tile`, `get_street_view`, `open_street_view` |
| Dev tools | `discover_api_endpoints`, `generate_builder_map_code`, `grabmaps_library_vibe_snippet`, `create_api_key` |

**Two flavours:**
- **Data-fetching** tools (e.g. `search`, `search_nearby_pois`, `get_incidents`) return JSON directly.
- **Code-generating** tools (e.g. `search_places`, `add_route`, `fly_to`) return a JavaScript snippet for the playground UI. The snippet mutates playground state once pasted — safe to call the tool itself during research, but don't execute the returned code against a live session unless you intend the side effect.

---

## 5. Map styles in MapLibre

**GrabMaps Playground (with API key):** load the style with a Bearer token, then pass the JSON to MapLibre:

1. `GET https://maps.grab.com/api/style.json` with header `Authorization: Bearer <API_KEY>`.
2. `const style = await response.json()`.
3. `new maplibregl.Map({ container, style, center, zoom, … })`.

See §2.8 for a minimal snippet. This matches the **developer documentation** quick starts and the **`grab-maps`** library when `baseUrl` is `https://maps.grab.com`, `apiKey` is set, and `style` is omitted (the library fetches `https://maps.grab.com/api/style.json`).

**Markers / user location / route lines:** use standard MapLibre `Marker`, `Geolocation`, and GeoJSON `line` layers on the same map instance. On teardown, call `map.remove()`.

---

## 6. Constraints (quick reference)

- **Map style:** use **`GET https://maps.grab.com/api/style.json` + Bearer** and the returned JSON as MapLibre `style`; avoid undocumented `?key=` query patterns on `https://maps.grab.com/api/style.json`.
- **POI search:** adding a reference `location` improves relevance; optional `keyword` / category hints may be composed client-side.
- **Nearby V2:** `radius` in **kilometres**; supports sorting options such as distance vs popularity; library helpers may convert metres → km.
- **Directions:** default coordinate order **lng,lat**; use `lat_first=true` if you pass lat,lng pairs; use `overview=full` when you need geometry for map rendering.
- **Attribution:** keep MapLibre attribution enabled; for Grab data follow **© Grab | © OpenStreetMap contributors** where required.

---



*For authoritative OpenAPI or upstream behavior for your deployment, consult your API documentation or deployment operators.*
