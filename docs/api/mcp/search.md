# MCP — Search

Three tools. One returns place data (`search`); two generate JS for the playground UI (`search_places`, `search_nearby_pois`).

---

## `search` `[playground-only]`

**Full name:** `mcp__grab-maps-playground__search`

Data-fetching. Keyword POI search — returns an array of place objects directly.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `keyword` | string | yes | Free-text search. |
| `country` | string | yes | ISO3, e.g. `SGP`. |
| `location` | `{ latitude, longitude }` | no | Bias toward this point. |
| `limit` | int | no | Default 10. |

### Return

`{ is_confident, uuid, places: [{ poi_id, location, country, street, name, formatted_address, category, business_type, opening_hours, time_zone, ... }] }`

### Example call & response (live, Singapore hawker centres)

```json
{
  "keyword": "hawker center",
  "country": "SGP",
  "location": { "latitude": 1.3521, "longitude": 103.8198 },
  "limit": 3
}
```

Returns (truncated):

```json
{
  "is_confident": true,
  "places": [
    {
      "poi_id": "IT.277PTIMV0QRZE",
      "location": { "latitude": 1.280927, "longitude": 103.850677 },
      "name": "Hawker Center Lau Pa Sat",
      "formatted_address": "Cross Street, Singapore",
      "category": "food and beverage",
      "business_type": "food and beverage"
    }
  ]
}
```

**See also:** wraps [`/api/v1/maps/poi/v1/search`](../rest/search.md#-api-v1-maps-poi-v1-search-upstream-documented).

---

## `search_places` `[upstream-documented]`

**Full name:** `mcp__grab-maps-playground__search_places`

Code-generating. Returns a JS snippet that calls `mapInstance.searchPlaces(...)` in the browser.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `query` | string | yes | Search query. |
| `limit` | int | no | Default 10. |
| `show_markers` | bool | no | Default false. |
| `fly_to` | bool | no | Fly to first result. |

### Return

```json
{ "code": "<JavaScript snippet>", "message": "..." }
```

### Example return

```javascript
const results = await mapInstance.searchPlaces('coffee shops near me', { limit: 10 });
console.log(results);
```

**See also:** [`../map_components/grab_maps_lib.md`](../map_components/grab_maps_lib.md) — `searchPlaces()` method.

---

## `search_nearby_pois` `[upstream-documented]`

**Full name:** `mcp__grab-maps-playground__search_nearby_pois`

Data-fetching. Nearby-places search by radius. Upstream docs name this tool `nearby_search`; this deployment renamed it.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `latitude` / `longitude` | number | yes | Centre. |
| `radius_km` | number | no | Default 1 km; omit to derive from `zoom`. |
| `zoom` | number | no | Alternative to `radius_km` — derives km from zoom. |
| `limit` | int | no | |
| `rank_by` | string | no | e.g. `distance` (default). |
| `language` | string | no | |

### Return

`{ places: [{ poi_id, location, name, formatted_address, category, business_type, ... }], radius_km, result_count }`

### Example call & response (live, Gardens by the Bay)

```json
{ "latitude": 1.2816, "longitude": 103.8636, "radius_km": 1, "limit": 3 }
```

```json
{
  "places": [
    {
      "poi_id": "IT.26D4WJEEWYXEG",
      "name": "Mr. Wholly",
      "formatted_address": "18 Marina Gardens Dr, #01-19, Singapore, 18953",
      "location": { "latitude": 1.2815684, "longitude": 103.863613 }
    }
  ],
  "radius_km": 1,
  "result_count": 3
}
```

**See also:** wraps [`/api/v1/maps/place/v2/nearby`](../rest/search.md#-api-v1-maps-place-v2-nearby-upstream-documented).
