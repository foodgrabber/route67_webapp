# REST — Street View

Two endpoints backed by OpenStreetCam. 360° photo discovery by coordinate or by bounding box.

Base: `https://maps.grab.com`. Both require `Authorization: Bearer ${GRABMAPS_API_KEY}`. Both are `[playground-only]`.

> **Heads up:** `/api/v1/street-view/nearby` does NOT exist and will return 404. The canonical path is `/api/v1/openstreetcam-api/2.0/photo/` below.

---

## `GET /api/v1/openstreetcam-api/2.0/photo/`

Find nearby 360° street-view photos for a single coordinate.

Upstream: `api.openstreetcam.org/2.0/photo/`.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `lat` | number | yes | |
| `lng` | number | yes | |
| `radius` | int | no | **Metres**. Default 100. |
| `limit` | int | no | Default 20. |
| `projection` | string | no | `SPHERE` for 360°. |
| `orderBy` | string | no | e.g. `distance`. |
| `orderDirection` | string | no | `asc` / `desc`. |

### Example

```javascript
const q = new URLSearchParams({
  lat: '1.3521',
  lng: '103.8198',
  radius: '100',
  limit: '2',
  projection: 'SPHERE',
});
const r = await fetch(`https://maps.grab.com/api/v1/openstreetcam-api/2.0/photo/?${q}`, {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
});
const payload = await r.json();
```

### Response shape (live — when empty)

```json
{
  "status": {
    "apiCode": 601,
    "apiMessage": "The request has an empty response",
    "httpCode": 200,
    "httpMessage": "Success",
    "result": null
  }
}
```

When photos are available, `status.result` is an array of photo objects with IDs, coords, camera heading, and image URLs. Coverage is sparse in Singapore CBD — try Jakarta coords (e.g. `-6.2088, 106.8456`) during the hackathon for better samples.

---

## `GET /api/v1/openstreetcam-api/photos`

Photos within a bounding box (batch fetch).

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `bbox` | `minLng,minLat,maxLng,maxLat` | yes | |
| `limit` | int | no | |

### Example

```javascript
const r = await fetch(
  'https://maps.grab.com/api/v1/openstreetcam-api/photos?bbox=103.83,1.30,103.85,1.32&limit=50',
  { headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` } }
);
```

---

## See also

- [`../map_components/examples.md`](../map_components/examples.md) — `StreetViewBuilder` provides an interactive 360° viewer with compass + minimap + navigation between adjacent photos. Strongly preferred over raw API consumption for UI.
- [`../mcp/tiles_streetview.md`](../mcp/tiles_streetview.md) — MCP tools `get_street_view` (photo discovery) and `open_street_view` (open in UI).
