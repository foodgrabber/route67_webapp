# `GrabMapsLib` — all-in-one widget

`new GrabMapsLib(options)` gives you a fully-wired map with search, routing, layers, traffic, street view — any subset toggled on via options.

## Constructor options

Grouped by concern. All optional unless marked **req**.

### Core

| Option | Type | Default | Notes |
|---|---|---|---|
| `container` | string \| HTMLElement | **req** | DOM id (without `#`) or element. |
| `baseUrl` | string | **req** | `https://maps.grab.com` for this deployment. |
| `apiKey` | string | **req** | Bearer key. |
| `lat` / `lng` / `zoom` | number | — | Initial viewport. |
| `style` | object \| string | — | Omit to let the library fetch `style.json` using `baseUrl` + `apiKey`. |
| `assetsBasePath` | string | auto | For subpath deploys. |

### Map feature toggles

| Option | Default | Notes |
|---|---|---|
| `navigation` | `true` | Zoom + compass control. |
| `attribution` | `true` | Attribution text. |
| `buildings` | `true` | 3D building extrusions. |
| `labels` | `true` | Place labels. |
| `interactive` | `true` | Disable to lock the map. |

### Built-in UI

| Option | Default | Notes |
|---|---|---|
| `showSearchBar` | `false` | POI search UI. |
| `showWaypointsModal` | `false` | Multi-stop routing UI. |
| `showLayersMenu` | `false` | Layers (traffic / POI / buildings / HD) menu. |

### Feature builders (nest objects to enable)

| Option | Enables |
|---|---|
| `search: { maxResults, categories, placeholder, flyToOnSelect, debounceMs }` | Search builder. |
| `routing: { enabled, color, width, showInstructions }` | Routing builder — **off by default**, set `enabled: true`. |
| `traffic: { updateInterval, showByDefault, useTileLoading, tileZoomLevel }` | Traffic builder. |
| `incident: { updateInterval, showByDefault, incidentTypes, severityLevels, enableClustering }` | Incidents. |
| `streetView: { enableAutoRefetch, enableCompass, enableMinimap, enableNavigationDots, fieldOfView }` | Street view. |
| `layers: { enabledLayers, defaultLayers, availableLayers }` | Layer controls. |

### Pre-drawn geometry

| Option | Notes |
|---|---|
| `pins` | Array of `{ name, lat, lng, address? }` rendered as markers. |
| `polygons` / `circles` / `waypoints` | Pre-drawn shapes & waypoints. |

### Other

| Option | Notes |
|---|---|
| `errorHandler` | `(err) => void` callback. |

## Notable methods

After `new GrabMapsLib(opts)`:

| Method | Purpose |
|---|---|
| `getMap()` | Returns underlying `maplibregl.Map`. |
| `getClient()` | Returns `GrabMapsClient` with `.api`, `.search`, `.routing`, `.streetView`, `.traffic`, `.incidents`. |
| `onReady(cb)` | Run `cb` after style + tiles load. |
| `flyTo(location, zoom?)` | Smooth-pan camera. `location` can be `[lng, lat]` or a place name. |
| `searchPlaces(query, opts)` | Returns POI results (and optionally places markers). |
| `openPOI(location)` | Open the POI detail modal at a coordinate or place name. |
| `openStreetView(location, opts?)` | Open the 360° viewer. |
| `addRoute(start, end, opts)` | Add a route line (requires `routing.enabled: true`). |
| `addWaypoint(name, location)` | Add a waypoint to the route planner. |
| `calculateWaypointRoute()` | Compute route through all added waypoints. |
| `clearRoute()` / `clearWaypoints()` | Reset routing state. |
| `setLayerVisibility(layer, visible)` | Show / hide a specific layer. |
| `toggleWaypointsModal(visible?)` | Show / hide the waypoints UI. |
| `destroy()` | Teardown — call on unmount. |
| `instance.api.get/post/delete(path, params)` | Escape hatch for any REST endpoint. |

## Example — everything enabled

```javascript
const mapInstance = new GrabMapsLib({
  container: 'map',
  baseUrl: 'https://maps.grab.com',
  apiKey: process.env.GRABMAPS_API_KEY,
  lat: 1.3521, lng: 103.8198, zoom: 12,

  showSearchBar: true,
  showLayersMenu: true,
  showWaypointsModal: true,

  search: { maxResults: 10, placeholder: 'Search places...' },
  routing: { enabled: true, color: '#4ade80', width: 6 },
  traffic: { showByDefault: false, updateInterval: 60, useTileLoading: true },
  incident: { showByDefault: false, incidentTypes: ['accident', 'construction'], severityLevels: ['high', 'critical'] },
  streetView: { enableCompass: true, enableMinimap: true },
  layers: { defaultLayers: ['poi', 'buildings'], availableLayers: ['traffic', 'poi', 'buildings', 'hd'] },

  errorHandler: (err) => console.error('GrabMaps:', err),
});

mapInstance.onReady(async () => {
  const hawker = await mapInstance.searchPlaces('hawker center', { limit: 10 });
  console.log(hawker);
});
```

## See also

- [`builders.md`](builders.md) — the composable API underneath `GrabMapsLib`.
- [`../mcp/dev_tools.md`](../mcp/dev_tools.md) — `generate_builder_map_code` MCP tool produces this config + HTML in one call.
