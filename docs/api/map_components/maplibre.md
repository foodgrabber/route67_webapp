# Plain MapLibre — no `grab-maps` wrapper

When you want GrabMaps tiles + style but full MapLibre control (custom layers, third-party plugins, etc.), skip the library and drive MapLibre directly. You only need two GrabMaps things: the **style document** (fetched from `/api/style.json` with a Bearer header) and your API key.

## Pattern 1 — fetch style, pass JSON object (recommended)

This avoids auth-on-style-URL issues and gives you the style up front to tweak.

```javascript
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const style = await fetch('https://maps.grab.com/api/style.json', {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
}).then(r => r.json());

const map = new maplibregl.Map({
  container: 'map',
  style,
  center: [103.8198, 1.3521],
  zoom: 12,
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');
```

## Pattern 2 — pass style URL + `transformRequest`

If your architecture insists on a URL, inject the Bearer header on every fetch MapLibre makes to the GrabMaps host:

```javascript
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://maps.grab.com/api/style.json',
  center: [103.8198, 1.3521],
  zoom: 12,
  transformRequest: (url) => {
    if (url.startsWith('https://maps.grab.com')) {
      return {
        url,
        headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
      };
    }
  },
});
```

MapLibre merges your transform with its own tile / font / sprite requests, so every downstream fetch also picks up the header.

## Static-HTML variant (no bundler)

```html
<link href="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css" rel="stylesheet" />
<script src="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js"></script>

<div id="map" style="width: 100%; height: 100vh;"></div>

<script type="module">
  const style = await fetch('https://maps.grab.com/api/style.json', {
    headers: { Authorization: 'Bearer bm_your_api_key_here' },
  }).then(r => r.json());

  const map = new maplibregl.Map({
    container: 'map', style, center: [103.8198, 1.3521], zoom: 12,
  });
</script>
```

## Adding custom data (GeoJSON source + layer)

Once the map is ready, use the standard MapLibre v5 API:

```javascript
map.on('load', () => {
  map.addSource('foodgrabber-spots', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [103.8507, 1.2809] },
          properties: { name: 'Lau Pa Sat', score: 10 },
        },
        // …66 more spots
      ],
    },
  });

  map.addLayer({
    id: 'foodgrabber-points',
    type: 'circle',
    source: 'foodgrabber-spots',
    paint: {
      'circle-radius': 8,
      'circle-color': '#4ade80',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
    },
  });
});
```

Click handlers, clustering, and fit-bounds are all stock MapLibre — no GrabMaps-specific APIs needed.

## MapLibre + `grab-maps` co-existence

`mapInstance.getMap()` / `grabMap.getMap()` returns the same `maplibregl.Map` the library is driving — you can mix paradigms in one app:

```javascript
import GrabMapsLib from 'grab-maps';

const mapInstance = new GrabMapsLib({ container: 'map', baseUrl: '…', apiKey: '…' });
const map = mapInstance.getMap();

// Add your own layer while still using the library's search UI:
map.on('load', () => {
  map.addSource('my-layer', { type: 'geojson', data: { ... } });
  map.addLayer({ id: 'my-points', type: 'circle', source: 'my-layer', paint: { ... } });
});
```

## Version pin

- `grab-maps` declares `maplibre-gl ^5.11.0` (run `npm ls maplibre-gl` for exact patch).
- If you load MapLibre separately (CDN, pinned version), keep it in the `5.x` range.
- Static `maplibre-gl.js`/`.css` must match what the library was bundled against.

## See also

- [`../rest/style_and_auth.md`](../rest/style_and_auth.md) — style endpoint full reference.
- [`builders.md`](builders.md) — if you want GrabMaps UI on top of MapLibre.
