# REST — Traffic & Incidents

Seven endpoints for real-time traffic speeds and incident reports. Three query shapes — bbox, tile, circle — for each of traffic-speeds and incidents, plus a GeoJSON tile endpoint.

Base: `https://maps.grab.com`. All require `Authorization: Bearer ${GRABMAPS_API_KEY}`.

**All `[playground-only]`.** None of these endpoints appear in the upstream docs bundle.

**Attach `linkReference=GRAB_WAY`** to every bbox call — omitting it may return 400.

---

## `GET /api/v1/traffic/real-time/bbox`

Real-time traffic speeds by bounding box.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `lat1` / `lat2` | number | yes | `lat1` = northernmost, `lat2` = southernmost. |
| `lon1` / `lon2` | number | yes | `lon1` = westernmost, `lon2` = easternmost. |
| `linkReference` | string | yes | Use `GRAB_WAY`. |
| `bbox` | string | alt | Convenience: `minLng,minLat,maxLng,maxLat`. Internally expanded to lat1/lat2/lon1/lon2. |
| `roadClass` | comma list | no | `1,2,3,4,5,6,7,8`. |
| `congestion` | comma list | no | `0,1,2,3,4,5`. |

### Example

```javascript
const q = new URLSearchParams({
  lat1: '1.31', lat2: '1.28', lon1: '103.83', lon2: '103.87',
  linkReference: 'GRAB_WAY',
});
const r = await fetch(`https://maps.grab.com/api/v1/traffic/real-time/bbox?${q}`, {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
});
const { timestamp, data } = await r.json();
```

### Response shape (live sample, truncated — real response is ~420 KB for central SG)

```json
{
  "timestamp": "2026-04-24T04:24:48Z",
  "data": [
    {
      "linkGrabWay": 4000633266897001,
      "roadClass": 3,
      "speed": 6.21,
      "freeflowSpeed": 7.78,
      "congestion": 1
    }
  ]
}
```

`speed` / `freeflowSpeed` in **m/s**. `congestion` — 0 = free-flowing, higher = worse. Use `roadClass` to filter major roads (1-3).

---

## `GET /api/v1/traffic/real-time/tile`

Traffic by tile coordinates — better than bbox for large viewports.

### Parameters

| Name | Type | Req |
|---|---|---|
| `z` | int | yes (0–22) |
| `x` | int | yes |
| `y` | int | yes |

### Example

```javascript
const r = await fetch('https://maps.grab.com/api/v1/traffic/real-time/tile?x=12916&y=8133&z=14', {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
});
```

---

## `GET /api/v1/traffic/real-time/circle`

Traffic within a metre radius.

**⚠ Availability:** returns **404** on this deployment as of 2026-04-24. Use `/traffic/real-time/bbox` with a small bbox instead.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `lat` / `lng` | number | yes | Centre. |
| `radius` | int | yes | **Metres**. |

---

## `GET /api/v1/traffic-tiles/{z}/{x}/{y}.json`

GeoJSON `FeatureCollection` for a specific map tile. Used by `TrafficBuilder` in tile-loading mode.

Response contains features with `speed`, `congestion`, `road_class`, `delay` properties + tile bounds, timestamp, source.

### Example

```javascript
const r = await fetch('https://maps.grab.com/api/v1/traffic-tiles/14/12916/8133.json', {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
});
const geojson = await r.json();
```

Note: invalid / out-of-bounds tile coordinates return `500 "invalid bounding box"`. Compute tile numbers from standard Web Mercator formulas.

---

## `GET /api/v1/traffic/incidents/bbox`

Live traffic incidents (roadworks, accidents, closures) within a bbox.

**Keep the bbox small** — responses with `bbox` spans > ~0.044° per side can return `400 "invalid lat/lon"`. Prefer the explicit `lat1/lat2/lon1/lon2` form.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `lat1` / `lat2` / `lon1` / `lon2` | number | yes | |
| `linkReference` | string | yes | `GRAB_WAY`. |
| `bbox` | `minLng,minLat,maxLng,maxLat` | alt | Convenience. |
| `incident_types` | comma list | no | `accident,construction,road_closure,event`. |
| `severity_levels` | comma list | no | `low,medium,high,critical`. |

### Example

```javascript
const q = new URLSearchParams({
  lat1: '1.31', lat2: '1.29', lon1: '103.84', lon2: '103.86',
  linkReference: 'GRAB_WAY',
});
const r = await fetch(`https://maps.grab.com/api/v1/traffic/incidents/bbox?${q}`, {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
});
const { timestamp, data } = await r.json();
```

### Response shape (live sample, truncated)

```json
{
  "timestamp": "2026-04-24T04:25:52Z",
  "data": [
    {
      "linkGrabWay": 4000633203158002,
      "roadClass": 2,
      "countryCode": "SG",
      "cityCode": "SIN",
      "startLat": 1.29819,
      "startLon": 103.85976,
      "endLat": 1.29819,
      "endLon": 103.85976,
      "incidentType": "ROADWORK",
      "incidentCode": 701,
      "description": "Roadwork on Nicoll Highway.",
      "vehicleType": "4W",
      "startTimestamp": "2026-04-24T02:50:58Z"
    }
  ]
}
```

---

## `GET /api/v1/traffic/incidents/tile`

Incidents by tile coordinates — same return shape as bbox.

### Parameters

| Name | Type | Req |
|---|---|---|
| `z` / `x` / `y` | int | yes |

---

## `GET /api/v1/traffic/incidents/circle`

Incidents within a metre radius (1–50000).

**⚠ Availability:** returns **404** on this deployment as of 2026-04-24.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `lat` / `lng` | number | yes | |
| `radius` | int | yes | Metres. |

---

## See also

- [`../map_components/examples.md`](../map_components/examples.md) — `TrafficBuilder` / `IncidentBuilder` — far easier than wiring these endpoints by hand for map overlays.
- [`../mcp/traffic.md`](../mcp/traffic.md) — MCP tools `get_traffic`, `get_traffic_tile`, `get_incidents`.
