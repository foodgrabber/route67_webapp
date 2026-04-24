# End-to-end examples

Copy-pasteable snippets for common flows. Assume `process.env.GRABMAPS_API_KEY` is set.

---

## 1 — Init map + fly to coordinate

```javascript
import GrabMapsLib from 'grab-maps';

const mapInstance = new GrabMapsLib({
  container: 'map',
  baseUrl: 'https://maps.grab.com',
  apiKey: process.env.GRABMAPS_API_KEY,
  lat: 1.3521, lng: 103.8198, zoom: 12,
});

mapInstance.onReady(async () => {
  await mapInstance.flyTo([103.8636, 1.2816], 15);  // Gardens by the Bay
});
```

---

## 2 — Search POIs and plot them

```javascript
const results = await mapInstance.searchPlaces('hawker center', { limit: 10 });
// results.places — array of POIs with poi_id, location, name, formatted_address

const map = mapInstance.getMap();
map.addSource('hawker', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: results.places.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.location.longitude, p.location.latitude] },
      properties: { name: p.name, poi_id: p.poi_id },
    })),
  },
});
map.addLayer({
  id: 'hawker-dots',
  type: 'circle',
  source: 'hawker',
  paint: { 'circle-radius': 6, 'circle-color': '#f59e0b' },
});
```

---

## 3 — Compute and draw a route

```javascript
// Option A: use the library (requires routing.enabled in constructor)
const route = await mapInstance.addRoute(
  [103.8198, 1.3521],   // start [lng, lat]
  [103.8636, 1.2816],   // end
  { profile: 'driving', color: '#4ade80', width: 6 }
);

// Option B: use the data service (no visual line — you render it)
const client = mapInstance.getClient();
const r = await client.routing.getRoute(
  [1.3521, 103.8198],    // start [lat, lng]  ← note the swap
  [1.2816, 103.8636],
  { mode: 'car' }
);
console.log(r.distance, r.duration, r.geometry);
```

---

## 4 — Multi-stop waypoint route (FoodGrabber 67-spots pattern)

```javascript
// Clear any previous state
mapInstance.clearWaypoints();

// Add the 67 spots as waypoints
spots.slice(0, 67).forEach((spot, i) => {
  mapInstance.addWaypoint(
    spot.name,
    `${spot.lng},${spot.lat}`     // string "lng,lat" form
  );
});

// Compute an optimized route through all of them
await mapInstance.calculateWaypointRoute();
```

---

## 5 — Open the POI detail modal / street view

```javascript
await mapInstance.openPOI('Marina Bay Sands, Singapore');
// …or by coordinates:
await mapInstance.openPOI('103.8636,1.2816');

await mapInstance.openStreetView('103.8636,1.2816', { yaw: 90, pitch: 0, fov: 90 });
```

---

## 6 — Pure data (no map) — client-only usage

```javascript
import { GrabMapsBuilder } from 'grab-maps';

const client = GrabMapsBuilder.quick(
  'https://maps.grab.com',
  process.env.GRABMAPS_API_KEY
);

const nearby = await client.search.searchPlaces('cafe', {
  country: 'SGP',
  location: { latitude: 1.3521, longitude: 103.8198 },
  limit: 5,
});
```

---

## 7 — Bare MapLibre with authenticated style

```javascript
import maplibregl from 'maplibre-gl';

const style = await fetch('https://maps.grab.com/api/style.json', {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
}).then(r => r.json());

const map = new maplibregl.Map({
  container: 'map', style, center: [103.8198, 1.3521], zoom: 12,
});
```

---

## 8 — Add a polygon overlay

```javascript
const map = mapInstance.getMap();
map.on('load', () => {
  map.addSource('zone', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [103.81, 1.35], [103.83, 1.35], [103.83, 1.36], [103.81, 1.36], [103.81, 1.35],
        ]],
      },
    },
  });
  map.addLayer({
    id: 'zone-fill',
    type: 'fill',
    source: 'zone',
    paint: { 'fill-color': '#0a84ff', 'fill-opacity': 0.35 },
  });
});
```

---

## See also

- [`grab_maps_lib.md`](grab_maps_lib.md) — full option surface.
- [`builders.md`](builders.md) — composable alternative.
- [`../mcp/dev_tools.md`](../mcp/dev_tools.md) — `generate_builder_map_code` MCP tool emits snippets like #1 with full config.
