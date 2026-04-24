# `grab-maps` Library Reference

Client-side map components — the **`grab-maps`** JavaScript/TypeScript library — built on **MapLibre GL JS v5**. Four integration levels; pick the one that matches your control needs.

## Integration levels

| Level | Entry | Use for | File |
|---|---|---|---|
| **All-in-one widget** | `new GrabMapsLib({...})` | Fastest path to a map with search + layers + routing UI | [`quick_start.md`](quick_start.md), [`grab_maps_lib.md`](grab_maps_lib.md) |
| **Composable builder** | `GrabMapsBuilder → MapBuilder` | Custom UIs; you compose only the bits you need | [`builders.md`](builders.md) |
| **Client-only** | `GrabMapsBuilder.quick(…)` + `client.search` / `client.routing` | Pure data calls, no map surface | [`builders.md`](builders.md#client-services) |
| **Plain MapLibre** | `new maplibregl.Map({ style })` after fetching `style.json` | Full MapLibre control, GrabMaps tiles/style | [`maplibre.md`](maplibre.md) |

## Install

### CDN (no build tools)

```html
<script type="module" src="https://maps.grab.com/developer/assets/js/grabmaps.es.js"></script>
<link rel="stylesheet" href="https://maps.grab.com/developer/assets/css/maplibre-gl.css" />
```

### npm (bundled apps)

```bash
npm install grab-maps maplibre-gl
```

```javascript
import { GrabMapsLib, GrabMapsBuilder, MapBuilder } from 'grab-maps';
import 'grab-maps/style.css';
import 'maplibre-gl/dist/maplibre-gl.css';
```

- MapLibre declared at `^5.11.0`. `grabMap.getMap()` / `mapInstance.getMap()` returns a `maplibregl.Map` per v5 API.
- For subpath deploys, pass `assetsBasePath` in `GrabMapsOptions`.
- Full architecture & upgrade notes live in `DOCS.md`, `README.md`, `MAPLIBRE.md` inside the npm package.

## Auth

Every integration level needs a Bearer API key on protected calls (the library handles this once `apiKey` is set):

```javascript
apiKey: process.env.GRABMAPS_API_KEY  // from .env
```

See [`../api.md`](../api.md) for credential layout.

## Common gotchas

- **One client, many builders.** Reuse a single `GrabMapsClient` across `MapBuilder`, `SearchBuilder`, etc. to avoid redundant auth handshakes.
- **Coord order.** The library mostly accepts `[lng, lat]` (MapLibre convention). `client.routing.getRoute(start, end)` takes `[latitude, longitude]` pairs — opposite. Read the method signature before plotting.
- **Routing off by default.** In the config-based builder API, set `route_config.enabled = true` to unlock routing UI + methods.
- **Teardown.** Call `mapInstance.destroy()` (widget) or `map.remove()` (MapLibre) when unmounting.

## See also

- [`../rest/`](../rest/) — the HTTP endpoints this library wraps.
- [`../mcp/`](../mcp/) — MCP tools that generate executable JS for the same surface.
