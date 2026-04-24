# REST — Style & Auth

MapLibre style document + OAuth2 token endpoint. The style endpoint is the single most important HTTP call you'll make — the library auto-fetches it on init, but it pays to know what it returns.

Base: `https://maps.grab.com`.

---

## `GET /api/style.json` `[upstream-documented]`

MapLibre style JSON. The library does this for you when you omit `style` in `GrabMapsLib` options; you'll call it directly when driving MapLibre standalone.

**Always send `Authorization: Bearer ${GRABMAPS_API_KEY}`.** Do **not** rely on `?key=` query params — that pattern is not supported by this deployment.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `basic` | bool | no | Theme variant (may be exposed as a query param — deployment-dependent). |
| `dark` | bool | no | Dark theme variant. |
| `satellite` | bool | no | Satellite imagery variant. |

### Example — fetch + pass JSON object to MapLibre (recommended)

```javascript
const style = await fetch('https://maps.grab.com/api/style.json', {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
}).then(r => r.json());

new maplibregl.Map({
  container: 'map',
  style,
  center: [103.8198, 1.3521],
  zoom: 12,
});
```

### Alternative — `transformRequest`

If you must pass a URL string as MapLibre's `style`, inject the auth header via `transformRequest`:

```javascript
new maplibregl.Map({
  container: 'map',
  style: 'https://maps.grab.com/api/style.json',
  transformRequest: (url, resourceType) => {
    if (url.startsWith('https://maps.grab.com')) {
      return {
        url,
        headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
      };
    }
  },
  center: [103.8198, 1.3521],
  zoom: 12,
});
```

MapLibre will merge this transform with its own tile-url building, so every tile/font/sprite fetch picks up the header too.

### Response shape (live sample ~70 KB, top-level keys)

```json
{
  "version": 8,
  "bearing": 0,
  "center": [120.997923, 14.547312],
  "fonts": "https://maps.grab.com/api/maps/tiles/v2/fonts/{fontstack}/{language}.ttf",
  "glyphs": "https://maps.grab.com/api/maps/tiles/v2/fonts/{fontstack}/{range}.pbf",
  "sources": { /* vector tile + raster + hillshade sources */ },
  "sprite": "…",
  "layers": [ /* ~150 map layers (background, roads, buildings, labels) */ ]
}
```

The `center` in the returned style document is a global default (Manila region in current snapshot) — override via `maplibregl.Map` options.

---

## `GET /api/v1/api/style.json` `[playground-only]`

Alternative proxy path to the same style. Most integrations should use `/api/style.json` above.

---

## `POST /api/v1/grabid/v1/oauth2/token` `[playground-only]`

OAuth2 token endpoint — backs user-auth flows for the playground UI (Google / GitHub SSO). Not relevant for server-to-server API-key use; included here for completeness.

### Example (illustrative — params depend on OAuth client configuration)

```javascript
const r = await fetch('https://maps.grab.com/api/v1/grabid/v1/oauth2/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: '…',
    client_id: '…',
    redirect_uri: '…',
  }),
});
```

---

## See also

- [`../map_components/maplibre.md`](../map_components/maplibre.md) — full standalone-MapLibre integration pattern.
- [`../map_components/quick_start.md`](../map_components/quick_start.md) — `GrabMapsLib` does this fetch for you.
