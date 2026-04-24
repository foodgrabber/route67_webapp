# Composable builders + `GrabMapsClient` services

When `GrabMapsLib` is too opinionated, drop to the composable layer. You build a client once, then compose only the builders you need.

## Pattern

```javascript
import { GrabMapsBuilder, MapBuilder } from 'grab-maps';

const client = new GrabMapsBuilder()
  .setBaseUrl('https://maps.grab.com')
  .setApiKey(process.env.GRABMAPS_API_KEY)
  .build();

const grabMap = await new MapBuilder(client)
  .setContainer('map')
  .setCenter([103.8198, 1.3521])   // [lng, lat]
  .setZoom(12)
  .enableNavigation()
  .enableAttribution()
  .build();

const map = grabMap.getMap();  // maplibregl.Map
```

**Reuse one `client` across all builders** to avoid redundant auth handshakes.

Shortcut: `GrabMapsBuilder.quick('https://maps.grab.com', apiKey)` does the same as the three-line client-build above.

## Available builders

| Builder | Purpose |
|---|---|
| `MapBuilder` | Core map surface. Chain `setContainer / setCenter / setZoom / enableNavigation / enableAttribution / enableBuildings / enableLabels`. |
| `SearchBuilder` | Search box + result pipeline. `setMaxResults`, `setCategories`, `setPlaceholder`, `enableFlyToOnSelect`. |
| `RouteBuilder` / `RoutingIntegrationBuilder` | Route line rendering + optional sidebar UI. `setColor`, `setWidth`, `enableInstructions`. |
| `PolygonBuilder` / `CircleBuilder` | Drawable shapes. |
| `WaypointBuilder` | Multi-stop waypoint UI. |
| `PinBuilder` | Markers. |
| `StyleBuilder` | Custom MapLibre style overlays. |
| `GeocodingBuilder` | Reverse + forward geocoding helpers. |
| `ControlsBuilder` | Custom map controls. |
| `NearbyBuilder` | Nearby POI helpers. |
| `TrafficBuilder` | Traffic overlay. `setUpdateInterval(sec)`, `useTileLoading(true)`, `.show()`, `.hide()`, `.toggle()`. |
| `IncidentBuilder` | Incident overlay. `setIncidentTypes([...])`, `setSeverityLevels([...])`, `.enableIcons(true)`, `.enableLabels(true)`. |
| `StreetViewBuilder` | 360° viewer. |

Each builder's `.build()` is either sync or async (pending data fetches) — `await` defensively.

## Example — map + traffic + search

```javascript
import {
  GrabMapsBuilder, MapBuilder, TrafficBuilder, SearchBuilder,
} from 'grab-maps';

const client = GrabMapsBuilder.quick('https://maps.grab.com', process.env.GRABMAPS_API_KEY);

const grabMap = await new MapBuilder(client)
  .setContainer('map')
  .setCenter([103.8198, 1.3521])
  .setZoom(12)
  .enableNavigation()
  .build();

const map = grabMap.getMap();

const traffic = new TrafficBuilder(client, map)
  .setUpdateInterval(60)
  .useTileLoading(true)
  .build();
traffic.show();

new SearchBuilder(client, map)
  .setContainer('search-box')
  .setMaxResults(10)
  .enableFlyToOnSelect()
  .build();
```

## `GrabMapsClient` services { #client-services }

Calling `.build()` on `GrabMapsBuilder` returns a `GrabMapsClient` with these services. Use them directly when you don't need a map surface.

| Service | Shape |
|---|---|
| `client.api` | `.get(path, params)` / `.post(path, body)` / `.delete(path, body?)` — low-level with auth header auto-attached. |
| `client.search` | `.searchPlaces(query, { limit, country, location, categories })` → places[]. |
| `client.routing` | `.getRoute(start, end, { mode })` → Route. **Coords are `[latitude, longitude]`** (opposite of map conventions). |
| `client.streetView` | Helpers to fetch / enumerate photos. |
| `client.traffic` | Traffic fetch helpers (wraps the `/traffic/real-time/*` endpoints). |
| `client.incidents` | Incident fetch helpers (wraps `/traffic/incidents/*`). |

### Example — no map, just data

```javascript
import { GrabMapsBuilder } from 'grab-maps';

const client = GrabMapsBuilder.quick('https://maps.grab.com', process.env.GRABMAPS_API_KEY);

// Search
const hawker = await client.search.searchPlaces('hawker center', {
  country: 'SGP',
  location: { latitude: 1.3521, longitude: 103.8198 },
  limit: 10,
});

// Route (note lat,lng order)
const route = await client.routing.getRoute(
  [1.3521, 103.8198],
  [1.2921, 103.7767],
  { mode: 'car' }
);
console.log(route.distance, route.duration);

// Low-level escape hatch
const style = await client.api.get('/api/style.json');
```

## See also

- [`grab_maps_lib.md`](grab_maps_lib.md) — the widget built on top of these builders.
- [`../rest/`](../rest/) — the endpoints these services wrap.
