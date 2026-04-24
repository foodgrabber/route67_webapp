# GrabMaps API Docs — Source Map

Start here. This file tells an AI (or a human skimming) where to find every piece of the GrabMaps surface we've documented.

## Quick orientation

- **REST** — HTTP endpoints behind `Authorization: Bearer ${GRABMAPS_API_KEY}` → [`rest/`](rest/)
- **Library** — the `grab-maps` JS/TS package (MapLibre-based widgets + builders) → [`map_components/`](map_components/)
- **MCP** — 25 playground tools over HTTP → [`mcp/`](mcp/)
- **Credentials** — how auth works + links to `.env` / `.env.example` → [`api.md`](api.md)
- **One-pager** — everything above condensed into a single file, useful as a single-shot AI skill → [`Grabmaps_SKILL.md`](Grabmaps_SKILL.md)

## Find by task

| I want to… | Read |
|---|---|
| Initialise a map in the browser (CDN or npm) | [`map_components/quick_start.md`](map_components/quick_start.md) |
| Configure the all-in-one widget (`GrabMapsLib`) | [`map_components/grab_maps_lib.md`](map_components/grab_maps_lib.md) |
| Compose a custom map from builders | [`map_components/builders.md`](map_components/builders.md) |
| Use GrabMaps data without a map surface | [`map_components/builders.md#client-services`](map_components/builders.md#client-services) |
| Drop `grab-maps` and use MapLibre directly | [`map_components/maplibre.md`](map_components/maplibre.md) |
| Find copy-paste examples (init, search, route, polygons) | [`map_components/examples.md`](map_components/examples.md) |
| Search for POIs over HTTP | [`rest/search.md`](rest/search.md) |
| Compute a route for a map line | [`rest/routing.md`](rest/routing.md) |
| Get real-time traffic or incidents | [`rest/traffic.md`](rest/traffic.md) |
| Fetch 360° street-view photos | [`rest/street_view.md`](rest/street_view.md) |
| Understand the authenticated style fetch | [`rest/style_and_auth.md`](rest/style_and_auth.md) |
| See the full REST index + auth + legend | [`rest/README.md`](rest/README.md) |
| Drive the playground via MCP | [`mcp/README.md`](mcp/README.md) |
| Generate a full map scaffold | [`mcp/dev_tools.md`](mcp/dev_tools.md) (`generate_builder_map_code`) |
| Enumerate all REST endpoints programmatically | [`mcp/dev_tools.md`](mcp/dev_tools.md) (`discover_api_endpoints`) |

## Upstream vs. playground legend

Every REST and MCP entry carries a stability tag.

- `[upstream-documented]` — Listed in the official `https://maps.grab.com/developer/documentation` bundle (extracted 2026-04-24). Considered stable.
- `[playground-only]` — Exposed by this playground deployment but **not** in the official docs. Subject to change.

### Upstream-documented REST (5)

- `GET /api/style.json`
- `GET /api/v1/maps/poi/v1/search`
- `GET /api/v1/maps/poi/v1/reverse-geo`
- `GET /api/v1/maps/place/v2/nearby`
- `GET /api/v1/maps/eta/v1/direction`

### Upstream-documented MCP (3)

- `search_places` (same name upstream + playground)
- `search_nearby_pois` (upstream: `nearby_search`)
- `navigation` (upstream: `get_directions`)

Every other entry in `rest/` (14) and `mcp/` (22) is `[playground-only]`.

## Full file tree

```
docs/api/
├── source_map.md              # (this file)
├── api.md                     # credentials layout → .env / .env.example
├── Grabmaps_SKILL.md          # single-page canonical reference
├── rest/
│   ├── README.md              # index, auth, base URL, stability legend
│   ├── search.md              # 5 endpoints: search, autocomplete, reverse-geo, nearby, grabplaces
│   ├── routing.md             # 2 endpoints: direction, navigation
│   ├── traffic.md             # 7 endpoints: 3 real-time + 3 incidents + 1 traffic-tiles
│   ├── street_view.md         # 2 endpoints: openstreetcam photo, photos
│   └── style_and_auth.md      # 3 endpoints: style.json, alt proxy, oauth2/token
├── map_components/
│   ├── README.md              # integration levels + install + auth overview
│   ├── quick_start.md         # minimal map: CDN + npm
│   ├── grab_maps_lib.md       # GrabMapsLib widget: full options + methods
│   ├── builders.md            # GrabMapsBuilder + all builders + client services
│   ├── maplibre.md            # plain MapLibre + style.json fetch patterns
│   └── examples.md            # 8 end-to-end snippets
└── mcp/
    ├── README.md              # connection, auth, category map
    ├── search.md              # 3 tools
    ├── routing.md             # 7 tools
    ├── map_state.md           # 5 tools
    ├── traffic.md             # 3 tools
    ├── tiles_streetview.md    # 3 tools
    └── dev_tools.md           # 4 tools
```

Totals: **22 markdown files**, documenting **19 REST endpoints** + **25 MCP tools** + the `grab-maps` library.

## How to refresh

As the hackathon evolves, re-run these to pick up new endpoints or tools:

```bash
# 1. Re-enumerate REST endpoints (updates counts + discovers additions)
claude mcp call grab-maps-playground discover_api_endpoints | jq '.endpoints | length'

# 2. Re-extract upstream-documented ids from the docs SPA bundle
set -a; source .env; set +a
BUNDLE_URL=$(curl -sL -u "$GRABMAPS_DOCS_BASIC_USER:$GRABMAPS_DOCS_BASIC_PASS" \
  'https://maps.grab.com/developer/documentation' \
  | grep -oE 'assets/index-[^"]+\.js' | head -1)
curl -sL -u "$GRABMAPS_DOCS_BASIC_USER:$GRABMAPS_DOCS_BASIC_PASS" \
  "https://maps.grab.com/developer/$BUNDLE_URL" \
  | grep -oE 'id:"api-[a-z0-9-]+"' | sort -u

# 3. Re-probe each read-only REST endpoint (see rest/README.md for list)
# 4. Re-load MCP tool schemas: ToolSearch select:mcp__grab-maps-playground__<name>,...
```

## Authoritative upstream

- **Docs site:** https://maps.grab.com/developer/documentation (Basic Auth — see `api.md`)
- **Developer portal:** https://maps.grab.com/developer (Google / GitHub SSO)
- **Hackathon WhatsApp:** see [`../hackathon/luma_project.md`](../hackathon/luma_project.md)

## How this docs tree was compiled

- Bundle parsed for upstream-vs-playground tagging (17 `api-*` ids in 5 unique REST paths + 3 MCP tools).
- `discover_api_endpoints` MCP tool gave the full endpoint list with params + upstream URLs.
- `grabmaps_library_vibe_snippet` and `generate_builder_map_code` MCP tools gave current library init/task patterns.
- All 25 MCP tool schemas pulled via `ToolSearch`.
- Live REST response shapes captured with `curl -H "Authorization: Bearer ..."` against each read-only endpoint.
- Generation date: **2026-04-24**, during the GrabMaps API Hackathon in Singapore.
