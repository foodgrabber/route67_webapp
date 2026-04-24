# REST — Routing

Two endpoints — one for map rendering (`direction`), one for turn-by-turn voice flows (`navigation`).

Base: `https://maps.grab.com`. Both require `Authorization: Bearer ${GRABMAPS_API_KEY}`.

---

## `GET /api/v1/maps/eta/v1/direction` `[upstream-documented]`

Route geometry + distance + duration between two or more points. Upstream: `partner-api.grab.com/maps/eta/v1/direction`.

**Use this for map lines.** For voice / turn-by-turn use `navigation` (below).

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `coordinates` | repeated | yes | Default order `lng,lat`. Pass 2+ times for a multi-stop route. |
| `profile` | string | no | `driving` (default), `walking`, `cycling`, `motorcycle`, `tricycle`. |
| `lat_first` | bool | no | Set `true` to pass `lat,lng` instead. |
| `overview` | string | no | `full` (return the route polyline), `simplified`, `no`. |
| `geometries` | string | no | `polyline6` (default), `polyline`, `no`. |
| `steps` | bool | no | Include turn-by-turn steps. |

### Example

```javascript
const p = new URLSearchParams();
p.append('coordinates', '103.8198,1.3521');   // lng,lat
p.append('coordinates', '103.8636,1.2816');
p.set('profile', 'driving');
p.set('overview', 'full');

const r = await fetch(`https://maps.grab.com/api/v1/maps/eta/v1/direction?${p}`, {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
});
const data = await r.json();
const firstRoute = data.routes?.[0];
// firstRoute.geometry (encoded polyline), .distance (m), .duration (s), .legs[]
```

### Response shape (live sample, truncated)

```json
{
  "code": "ok",
  "waypoints": [
    { "hint": "", "distance": 548.073, "name": "", "location": [1.355168, 103.823657] },
    { "hint": "", "distance": 162.473, "name": "", "location": [1.280305, 103.864276] }
  ],
  "routes": [
    {
      "distance": 17175.569,
      "duration": 1668.7,
      "geometry": "_yuqAqq{_eEcUnJw@LsABiXwC…",
      "legs": [{ /* per-leg steps and distances */ }]
    }
  ]
}
```

- `distance` is in **metres**, `duration` in **seconds**.
- `geometry` is encoded polyline — decode with a polyline6 decoder.
- Waypoint `location` is returned as **`[lat, lng]`** (opposite of what you send).

---

## `GET /api/v1/maps/eta/v1/navigation` `[playground-only]`

Turn-by-turn / voice-oriented navigation. Upstream: `partner-api.grab.com/maps/eta/v1/navigation`.

**⚠ Requires `requestID`** query param — the endpoint returns `400 "Missing value for requestID"` without one. Use any opaque string (UUID recommended) per request.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `coordinates` | repeated | yes | Same as `direction`. |
| `profile` | string | no | e.g. `driving`, `driving-car`. |
| `lat_first` | bool | no | |
| `requestID` | string | **yes** (on this deployment) | Any opaque token. |

### Example

```javascript
const p = new URLSearchParams();
p.append('coordinates', '103.8198,1.3521');
p.append('coordinates', '103.8636,1.2816');
p.set('profile', 'driving');
p.set('lat_first', 'false');
p.set('requestID', crypto.randomUUID());

const r = await fetch(`https://maps.grab.com/api/v1/maps/eta/v1/navigation?${p}`, {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
});
const data = await r.json();
```

### Response shape (live sample, truncated)

```json
{
  "code": "Ok",
  "waypoints": [
    { "hint": "", "distance": 548.073, "name": "", "location": [103.823657, 1.355168] }
  ],
  "routes": [
    {
      "duration": 1696,
      "raw_duration": 1727.4,
      "distance": 17175.569,
      "weight_name": "normal",
      "weight": 3489.8,
      "geometry": "",
      "legs": [
        {
          "duration": 1696,
          "raw_duration": 1727.4,
          "distance": 17175.569,
          "weight": 3489.8,
          "summary": "Upper Thomson Road"
        }
      ]
    }
  ]
}
```

- Waypoint `location` here is **`[lng, lat]`** — opposite of `direction`'s response. Confirm before plotting.
- Adds `raw_duration`, `weight`, `weight_name` on top of the `direction` shape.

---

## See also

- [`../map_components/examples.md`](../map_components/examples.md) — `client.routing.getRoute(start, end, { mode })` and `mapInstance.addRoute(...)`.
- [`../mcp/routing.md`](../mcp/routing.md) — MCP `navigation` tool wraps this endpoint; `add_route` / `route_waypoints` / `calculate_waypoint_route` are higher-level builders.
