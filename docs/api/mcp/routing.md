# MCP — Routing

Seven tools. Six are code-generating (produce JS for the playground's `mapInstance` methods); `navigation` is data-fetching. The code-generators **mutate playground state** once pasted — document them, don't call them during research.

---

## `add_waypoint` `[playground-only]` (mutating)

Adds one waypoint to the route planner.

### Input

| Param | Type | Req |
|---|---|---|
| `name` | string | yes |
| `location` | string | yes — `"lng,lat"` or place name |

### Return

JS snippet calling `mapInstance.addWaypoint(name, location)`.

---

## `add_route` `[playground-only]` (mutating)

Draws a route between two points on the map.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `start` / `end` | string | yes | `"lng,lat"` or place name. |
| `profile` | string | no | `driving` (default), `walking`, `cycling`, `motorcycle`. |
| `color` | string | no | Hex — default `#4ade80`. |
| `width` | int | no | Default 6 px. |
| `show_instructions` | bool | no | |

### Return

JS snippet calling `mapInstance.addRoute(start, end, opts)`.

---

## `calculate_waypoint_route` `[playground-only]` (mutating)

Computes a route through all previously added waypoints (needs ≥ 2).

### Input

None.

### Return

JS snippet calling `mapInstance.calculateWaypointRoute()`.

---

## `clear_route` `[playground-only]` (mutating)

Removes the displayed route. Keeps waypoints.

### Input

None.

### Return

JS snippet calling `mapInstance.clearRoute()`.

---

## `clear_waypoints` `[playground-only]` (mutating)

Removes all waypoints and the route.

### Input

None.

### Return

JS snippet calling `mapInstance.clearWaypoints()`.

---

## `route_waypoints` `[playground-only]` (mutating)

One-shot: clear existing waypoints, add a new list, compute the route.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `waypoints` | array of `{ location, name? }` | yes | In visit order. |
| `profile` | string | no | Transport mode. |

### Return

JS snippet that clears, adds, and calculates in sequence.

**FoodGrabber relevance:** this is the most natural way to render a route through your 67 spots. Pass the ordered spot list; get a single snippet.

---

## `navigation` `[upstream-documented]`

**Data-fetching.** Compute a route via `/api/v1/maps/eta/v1/direction` — not the turn-by-turn navigation endpoint. The MCP tool is misleadingly named; treat it as "get_directions".

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `coordinates` | array of `{ latitude, longitude }` | yes | ≥ 2. |
| `profile` | string | no | `driving`, `walking`, `cycling`, `motorcycle`, `tricycle`. |
| `geometries` | string | no | `polyline6` (default), `polyline`, `no`. |
| `overview` | string | no | `no` (default), `full`, `simplified`. |
| `steps` | bool | no | |

### Return

Standard OSRM-ish routes response — see [`/eta/v1/direction` response shape](../rest/routing.md#response-shape-live-sample-truncated). `{ code, waypoints, routes: [{ distance, duration, geometry, legs }] }`.

### Example call

```json
{
  "coordinates": [
    { "latitude": 1.3521, "longitude": 103.8198 },
    { "latitude": 1.2816, "longitude": 103.8636 }
  ],
  "profile": "driving",
  "overview": "full"
}
```

**See also:** [`../rest/routing.md`](../rest/routing.md), [`../map_components/examples.md`](../map_components/examples.md) §3.
