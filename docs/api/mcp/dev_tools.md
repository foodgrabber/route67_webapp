# MCP — Dev tools

Four tools. Schemas / examples / endpoint lists — the tools you'd reach for *while coding*.

---

## `discover_api_endpoints` `[playground-only]`

**Full name:** `mcp__grab-maps-playground__discover_api_endpoints`

The canonical source of truth for what REST endpoints the playground gateway exposes. Used to generate [`../rest/README.md`](../rest/README.md).

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `category` | string | no | Filter: `search`, `routing`, `traffic`, `streetview`, `geocoding`, `style`, `auth`. Omit for all. |

### Return

```json
{
  "success": true,
  "message": "Found 19 endpoint(s)",
  "endpoints": [
    {
      "category": "search",
      "endpoint": "/api/v1/maps/poi/v1/search",
      "method": "GET",
      "description": "Keyword POI search (no server-side radius/category/bounds)",
      "query_params": ["keyword", "country", "location", "limit"],
      "example": "/api/v1/maps/poi/v1/search?keyword=Marina+Bay&country=SGP&location=1.3521,103.8198&limit=10",
      "upstream": "https://partner-api.grab.com/maps/poi/v1/search"
    }
  ]
}
```

Call this periodically during the hackathon to catch endpoint additions / removals.

---

## `generate_builder_map_code` `[playground-only]`

**Full name:** `mcp__grab-maps-playground__generate_builder_map_code`

Returns a complete HTML + JS (or TS) scaffold using the GrabMaps library's config-based API. **Start here** for any new page — regenerate rather than hand-editing config.

### Input (summary — full schema is ~40 options, grouped)

| Group | Keys |
|---|---|
| **Required** | `center_lat`, `center_lng`, `zoom` |
| **Map** | `map_config: { enable_navigation, enable_buildings, enable_labels, enable_coverage, enable_attribution, interactive, layers: {...} }` |
| **Search** | `search_config: { max_results, placeholder, fly_to_on_select, categories, debounce_ms }` |
| **Routing** | `route_config: { enabled, color, width, show_instructions }` — **routing off by default**. |
| **Traffic** | `traffic_config: { show_by_default, update_interval, use_tile_loading, tile_zoom_level }` |
| **Incidents** | `incident_config: { show_by_default, update_interval, incident_types, severity_levels, enable_clustering, enable_icons, enable_labels }` |
| **Street view** | `street_view_config: { enable_compass, enable_minimap, enable_navigation_dots, field_of_view, enable_auto_refetch }` |
| **POIs** | `pois: [{ name, lat, lng, address? }, ...]` |
| **Format** | `language: "javascript" | "typescript"`, `include_style: bool` |

### Return

```json
{ "code": "<!doctype html>...", "language": "javascript" }
```

Drop the returned HTML into a static file and open in a browser.

### FoodGrabber starter config

```json
{
  "center_lat": 1.3521,
  "center_lng": 103.8198,
  "zoom": 12,
  "map_config": { "enable_navigation": true, "enable_buildings": true },
  "search_config": { "max_results": 10, "placeholder": "Find the next 67 spot..." },
  "route_config": { "enabled": true, "color": "#f59e0b", "width": 6 },
  "pois": [
    { "name": "Lau Pa Sat", "lat": 1.2809, "lng": 103.8507 }
  ],
  "language": "javascript"
}
```

---

## `grabmaps_library_vibe_snippet` `[playground-only]`

**Full name:** `mcp__grab-maps-playground__grabmaps_library_vibe_snippet`

On-demand code snippet for a specific library integration + task. Great for "how do I do X with GrabMapsLib?" questions.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `integration` | string | yes | `grab_maps_lib`, `composable_map_builder`, `client_hub_only`, `lib_instance_api`, `browser_globals`, `imports_reference`, `maplibre_under_grabmap`, `maplibre_standalone`. |
| `task` | string | no | GrabMaps: `init`, `search_places`, `calculate_route`, `fly_to`, `streetview_nearest`, `client_raw_search`. MapLibre: `init`, `fly_to`, `geojson_layer`, `map_click`, `fit_bounds`, `navigation_control`. |
| `api_key_expr` | string | no | JS expression for the key (e.g. `process.env.GRABMAPS_API_KEY`). |
| `center_lat` / `center_lng` / `zoom` | string | no | Snippet coordinates. |
| `language` | string | no | `javascript` (default) or `typescript`. |

### Return

```json
{
  "success": true,
  "code": "<JS snippet>",
  "message": "GrabMapsLib shell (all-in-one widget)",
  "consumer_hints": "...",
  "maplibre_note": "..."
}
```

### Common invocations

| Want | `integration` | `task` |
|---|---|---|
| Minimal CDN map | `grab_maps_lib` | `init` |
| Composable map for custom UI | `composable_map_builder` | `init` |
| No map, just data fetches | `client_hub_only` | `client_raw_search` |
| Bare MapLibre with auth'd style | `maplibre_standalone` | `init` |
| Add a GeoJSON layer on top of library map | `maplibre_under_grabmap` | `geojson_layer` |

---

## `create_api_key` `[playground-only]` (mutating)

**Full name:** `mcp__grab-maps-playground__create_api_key`

Creates a new API key for your playground account. **Don't call this during exploration** — every call burns a key slot.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `name` | string | yes | e.g. `"FoodGrabber prod"`. |
| `permissions` | string | no | Default `all`. |
| `rate_limit_per_minute` | int | no | Default 60. |
| `rate_limit_per_hour` | int | no | Default 1000. |
| `request_limit` | int | no | Hard cap on lifetime requests. |

### Return

`{ key, name, permissions, rate_limits, created_at }`.

### When to use

- You rotated the hackathon key and need a fresh one scoped to your app.
- You want a rate-limited key to embed in a client-side demo with tighter bounds.

Prefer the UI in `https://maps.grab.com/developer` for one-off key creation; use this tool only if you're scripting multiple keys.
