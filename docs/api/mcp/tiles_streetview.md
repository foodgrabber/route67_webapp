# MCP — Tiles & Street view

Three tools: one for vector tiles, two for 360° photos.

---

## `get_tile` `[playground-only]`

Fetch a map tile by z/x/y.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `z` / `x` / `y` | int | yes | Zoom 0–22. |
| `type` | string | no | `vector` (default), `camera-dots`, `traffic`. |

### Return

Tile data (binary-ish, depends on `type`).

> ⚠ For web apps, use `GrabMapsLib` / `MapBuilder` — the library handles tile loading, caching, and styling. This tool is for server-side rendering, CLI tools, or custom non-browser integrations.

---

## `get_street_view` `[playground-only]`

Find nearby 360° photos around a coordinate. Thin layer over [`/api/v1/openstreetcam-api/2.0/photo/`](../rest/street_view.md#-api-v1-openstreetcam-api-2-0-photo).

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `lat` / `lng` | number | yes | |
| `radius` | int | no | Metres. Default 100. |
| `limit` | int | no | Default 20. |

### Return

```json
{
  "success": true,
  "message": "Use endpoint: /api/v1/openstreetcam-api/2.0/photo/",
  "photos": [
    {
      "endpoint_path": "/api/v1/openstreetcam-api/2.0/photo/",
      "query_params": { "lat": 1.2816, "lng": 103.8636, "radius": 100, "limit": 2, "projection": "SPHERE" },
      "recommendation": "Use the GrabMaps JavaScript/TypeScript library's StreetViewBuilder for production applications"
    }
  ]
}
```

Note the tool currently returns a **pointer to the correct REST endpoint** rather than the photos themselves. Follow the endpoint returned in `photos[].endpoint_path` with your Bearer token to get the actual photo metadata.

**See also:** [`../rest/street_view.md`](../rest/street_view.md).

---

## `open_street_view` `[playground-only]` (mutating)

Code-generating. Opens the 360° viewer in the playground UI at a location.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `location` | string | yes | `"lng,lat"` or place name. |
| `yaw` | int | no | 0–360, horizontal angle (0 = N). |
| `pitch` | int | no | -90 to 90, vertical angle. |
| `fov` | int | no | 15–110, field of view. Default 90. |

### Return

JS snippet:

```javascript
await mapInstance.openStreetView([103.8636, 1.2816], { yaw: 90, pitch: 0, fov: 90 });
```
