# Quick start — minimal map in 10 lines

The fastest path: the **`GrabMapsLib`** all-in-one widget. Pass your container, base URL, and API key; call `.getMap()` when you need the raw `maplibregl.Map`.

## HTML page (CDN, zero build)

```html
<!doctype html>
<html>
<head>
  <link href="https://maps.grab.com/developer/assets/css/maplibre-gl.css" rel="stylesheet" />
  <link href="https://maps.grab.com/developer/assets/css/grab-maps.css" rel="stylesheet" />
</head>
<body>
  <div id="map" style="width: 100%; height: 100vh;"></div>

  <script type="module">
    import GrabMapsLib from 'https://maps.grab.com/developer/assets/js/grabmaps.es.js';

    const mapInstance = new GrabMapsLib({
      container: 'map',
      baseUrl: 'https://maps.grab.com',
      apiKey: 'bm_your_api_key_here',  // inject via build or server template
      lat: 1.3521,
      lng: 103.8198,
      zoom: 12,
    });

    // Access the underlying MapLibre map whenever needed:
    mapInstance.onReady(() => {
      const map = mapInstance.getMap();
      console.log('map ready', map.getCenter());
    });
  </script>
</body>
</html>
```

## Bundled app (Vite / Next.js / etc.)

```javascript
import GrabMapsLib from 'grab-maps';
import 'grab-maps/style.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const mapInstance = new GrabMapsLib({
  container: 'map',
  baseUrl: 'https://maps.grab.com',
  apiKey: process.env.GRABMAPS_API_KEY,
  lat: 1.3521,
  lng: 103.8198,
  zoom: 12,
});
window.mapInstance = mapInstance;
window.map = mapInstance.getMap();
```

> **Don't ship `apiKey` in a public bundle.** Proxy calls through your own backend (the hackathon organizers' explicit recommendation) or inject a short-lived token at render time.

## What `GrabMapsLib` gives you out of the box

With just the init above you get:

- Tiles, style, fonts, sprites auto-loaded from `https://maps.grab.com/api/style.json`
- Navigation control (zoom + compass) — disable via `navigation: false`
- 3D buildings, labels — toggle with `buildings: false` / `labels: false`
- Attribution — `attribution: false` to hide

To also get search bar, waypoints modal, layers menu, etc., pass the corresponding flags — see [`grab_maps_lib.md`](grab_maps_lib.md).

## Next steps

- Add a pin or fly to a point → [`examples.md`](examples.md)
- Wire search / routing UI → [`grab_maps_lib.md`](grab_maps_lib.md)
- Use only the data services (no map surface) → [`builders.md`](builders.md#client-services)
- Drop `GrabMapsLib` entirely and use MapLibre directly → [`maplibre.md`](maplibre.md)
