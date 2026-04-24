# MCP — Traffic & Incidents

Three tools. All data-fetching, all `[playground-only]`. Each is a thin wrapper over the corresponding REST endpoint.

---

## `get_traffic`

Real-time traffic speeds within a bbox.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `nw_lat` / `nw_lng` | number | yes | Northwest corner. |
| `se_lat` / `se_lng` | number | yes | Southeast corner. |
| `road_class` | string[] | no | Filter: `highway`, `primary`, `secondary`. |
| `congestion_level` | string[] | no | Filter: `low`, `medium`, `high`, `critical`. |

### Return

`{ timestamp, data: [{ linkGrabWay, roadClass, speed, freeflowSpeed, congestion }, ...] }`.

### Gotcha

Central Singapore at zoom 14 bbox returns ~420 KB of link data. Narrow the bbox aggressively or use `get_traffic_tile` for map rendering.

**See also:** [`../rest/traffic.md`](../rest/traffic.md#-api-v1-traffic-real-time-bbox).

---

## `get_traffic_tile`

Traffic data for one tile. Returns GeoJSON `FeatureCollection`.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `z` / `x` / `y` | int | yes | Zoom 0–22. |
| `type` | string | no | `vector` (default), `camera-dots`, `traffic`. |

### Return

GeoJSON features with `speed`, `congestion`, `road_class`, `delay` properties + tile bounds, timestamp, source.

**Gotcha:** out-of-range tile coordinates return 400 / 500 with `invalid bounding box`. Compute tile numbers from standard Web Mercator formulas first.

**See also:** [`../rest/traffic.md`](../rest/traffic.md#-api-v1-traffic-tiles-z-x-y-json).

---

## `get_incidents`

Traffic incidents (roadworks, accidents, closures) by bbox, tile, or circle.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `method` | string | no | `bbox` (default), `tile`, `circle`. |
| `nw_lat` / `nw_lng` / `se_lat` / `se_lng` | number | bbox | |
| `x` / `y` / `z` | int | tile | |
| `lat` / `lng` / `radius` | number / int | circle | Radius in **metres**, 1–50000. |
| `incident_types` | string[] | no | `accident`, `construction`, `road_closure`, `event`. |
| `severity_levels` | string[] | no | `low`, `medium`, `high`, `critical`. |

### Return

This tool actually returns **two different shapes** depending on deployment:

1. `{ code: "<JS snippet>", data: { bounds, endpoint, method }, message, success }` — code-generating mode, describes how to fetch incidents directly.
2. REST-equivalent JSON (when deployment fetches for you): `{ timestamp, data: [{ linkGrabWay, incidentType, description, startLat/Lon, endLat/Lon, ... }] }`.

### Example call (bbox mode)

```json
{
  "method": "bbox",
  "nw_lat": 1.31, "nw_lng": 103.84,
  "se_lat": 1.29, "se_lng": 103.86
}
```

Returns JS that fetches the underlying REST endpoint — or the REST payload itself. Check `success` and either execute the `code` or consume `data`.

**See also:** [`../rest/traffic.md`](../rest/traffic.md#-api-v1-traffic-incidents-bbox).
