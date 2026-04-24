# REST — Search / POI

Five endpoints for keyword search, autocomplete, reverse geocoding, and radius-based nearby discovery.

Base: `https://maps.grab.com`. All require `Authorization: Bearer ${GRABMAPS_API_KEY}`.

---

## `GET /api/v1/maps/poi/v1/search` `[upstream-documented]`

Keyword POI search. Optional `location` bias improves relevance. Upstream: `partner-api.grab.com/maps/poi/v1/search`.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `keyword` | string | yes | Free-text query (`"hawker"`, `"Marina Bay Sands"`). |
| `country` | string (ISO3) | yes | e.g. `SGP`, `IDN`, `MYS`. |
| `location` | `"lat,lng"` | no | Bias results near this point. |
| `limit` | int | no | Default 10. |

### Example

```javascript
const q = new URLSearchParams({
  keyword: 'hawker',
  country: 'SGP',
  location: '1.3521,103.8198',
  limit: '2',
});
const r = await fetch(`https://maps.grab.com/api/v1/maps/poi/v1/search?${q}`, {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
});
const { places } = await r.json();
```

### Response shape (live sample, truncated)

```json
{
  "places": [
    {
      "poi_id": "IT.3EFWINC3XK0CO",
      "location": { "latitude": 1.28257, "longitude": 103.84311 },
      "country": "Singapore",
      "country_code": "SGP",
      "city": "Singapore City",
      "street": "Smith Street",
      "postcode": "050335",
      "name": "Hawker Centre, Chinatown Complex",
      "formatted_address": "335 Smith Street, Singapore, 050335",
      "category": "food and beverage::food court",
      "business_type": "food and beverage",
      "opening_hours": "{}",
      "administrative_areas": [ { "type": "SubRegion", "name": "Singapore" } ],
      "time_zone": { "name": "Asia/Singapore", "offset": 28800 }
    }
  ]
}
```

`opening_hours` is a JSON-encoded string (not an object) — parse client-side.

---

## `GET /api/v1/maps/poi/v1/autocomplete` `[playground-only]`

Short-keyword POI autocomplete. Debounce on the client.

**⚠ Availability:** returns **404** on this deployment as of 2026-04-24, despite being listed by `discover_api_endpoints`. Fall back to `/poi/v1/search` with a short `keyword`.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `keyword` | string | yes | Short prefix (`"mar"`). |
| `country` | string (ISO3) | yes | |
| `location` | `"lat,lng"` | no | Bias. |
| `limit` | int | no | |

### Example

```javascript
const r = await fetch(
  `https://maps.grab.com/api/v1/maps/poi/v1/autocomplete?keyword=mar&country=SGP`,
  { headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` } }
);
```

---

## `GET /api/v1/maps/poi/v1/reverse-geo` `[upstream-documented]`

Reverse-geocode a coordinate into the nearest POI / address.

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `location` | `"lat,lng"` | yes | Note: **lat first**. |

### Example

```javascript
const r = await fetch(
  `https://maps.grab.com/api/v1/maps/poi/v1/reverse-geo?location=1.3521,103.8198`,
  { headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` } }
);
const { places } = await r.json();
```

### Response shape

Same `places[]` shape as `/poi/v1/search`, typically returning the single closest match.

---

## `GET /api/v1/maps/place/v2/nearby` `[upstream-documented]`

Find Nearby Places V2. **Radius is in kilometres.**

### Parameters

| Name | Type | Req | Notes |
|---|---|---|---|
| `location` | `"lat,lng"` | yes | Centre. |
| `radius` | number (km) | no | Default 1. |
| `limit` | int | no | Default 10. |
| `rankBy` | `"distance"` \| `"popularity"` | no | |
| `language` | string | no | |

### Example

```javascript
const q = new URLSearchParams({
  location: '1.2816,103.8636',
  radius: '1',
  limit: '2',
  rankBy: 'distance',
});
const r = await fetch(`https://maps.grab.com/api/v1/maps/place/v2/nearby?${q}`, {
  headers: { Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}` },
});
const { uuid, status, places } = await r.json();
```

### Response shape (live sample, truncated)

```json
{
  "uuid": "d92913fe-3a93-4c02-b37b-978a403d0b04",
  "status": { "code": "SUCCESS", "message": "OK" },
  "places": [
    {
      "poi_id": "IT.26D4WJEEWYXEG",
      "location": { "latitude": 1.28157, "longitude": 103.86361 },
      "country": "Singapore",
      "street": "Marina Gardens Dr",
      "name": "Mr. Wholly"
    }
  ]
}
```

Unlike `/poi/v1/search`, the V2 nearby response includes a top-level `uuid` and `status` object.

---

## `POST /api/v1/grabplaces/nearby` `[playground-only]`

Grab Places internal nearby API. Takes a JSON body.

**⚠ Availability:** returns **404** on this deployment as of 2026-04-24. Use `/api/v1/maps/place/v2/nearby` instead.

### Request body

```json
{
  "latitude": 1.3521,
  "longitude": 103.8198,
  "radius": 1000,
  "keyword": "restaurant"
}
```

`radius` is in **metres** here (different from V2 nearby).

### Example

```javascript
const r = await fetch('https://maps.grab.com/api/v1/grabplaces/nearby', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.GRABMAPS_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    latitude: 1.3521,
    longitude: 103.8198,
    radius: 1000,
    keyword: 'restaurant',
  }),
});
```

---

## See also

- [`../map_components/builders.md`](../map_components/builders.md) — `client.search.searchPlaces(query, opts)` wraps `/poi/v1/search`.
- [`../mcp/search.md`](../mcp/search.md) — MCP tools `search`, `search_places`, `search_nearby_pois`.
