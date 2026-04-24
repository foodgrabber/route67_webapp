# MCP Tools Reference

The **grab-maps-playground** MCP server exposes **25 tools** over HTTP. Use them from any MCP-speaking client (Claude Code, Cursor, Copilot CLI) to drive the GrabMaps playground or to ask the server for schemas, snippets, and endpoint lists.

## Connection

```bash
set -a; source .env; set +a
claude mcp add --transport http grab-maps-playground \
  "$GRABMAPS_MCP_URL" \
  --header "Authorization: Bearer $GRABMAPS_MCP_TOKEN"
```

- Transport: **HTTP**
- Auth: `Authorization: Bearer ${GRABMAPS_MCP_TOKEN}` (separate from the REST API key — mismatching them is the most common setup error).
- URL: `https://maps.grab.com/api/v1/mcp`.

Drop the generated config into your Claude Code settings (see [`../api.md`](../api.md)).

## Stability tags

| Tag | Tools |
|---|---|
| `[upstream-documented]` | `search_places`, `search_nearby_pois` (upstream name `nearby_search`), `navigation` (upstream name `get_directions`) — 3 tools. |
| `[playground-only]` | Everything else — 22 tools. Exposed by this deployment, not in Grab's official docs; API may change. |

## Category map

| Category | File | Tools |
|---|---|---|
| Search | [`search.md`](search.md) | `search`, `search_places`, `search_nearby_pois` |
| Routing | [`routing.md`](routing.md) | `add_waypoint`, `add_route`, `calculate_waypoint_route`, `clear_route`, `clear_waypoints`, `route_waypoints`, `navigation` |
| Map state | [`map_state.md`](map_state.md) | `fly_to`, `control_layers`, `update_map_state_from_url`, `toggle_waypoints_modal`, `open_poi` |
| Traffic | [`traffic.md`](traffic.md) | `get_traffic`, `get_traffic_tile`, `get_incidents` |
| Tiles & street view | [`tiles_streetview.md`](tiles_streetview.md) | `get_tile`, `get_street_view`, `open_street_view` |
| Dev tools | [`dev_tools.md`](dev_tools.md) | `discover_api_endpoints`, `generate_builder_map_code`, `grabmaps_library_vibe_snippet`, `create_api_key` |

Total: 3 + 7 + 5 + 3 + 3 + 4 = **25 tools**.

## Two flavours of tool

Most MCP tools fall into one of these patterns — worth knowing before you call them:

- **Data-fetching** — returns JSON data that was fetched server-side (e.g. `search`, `search_nearby_pois`, `get_incidents`). Safe to call ad-hoc.
- **Code-generating** — returns a JavaScript snippet for you to paste into the playground UI (`search_places`, `add_route`, `fly_to`, `open_poi`, ...). Side-effect-free from your side; effect happens when a human pastes and runs the code. The description calls these out as "💡 IMPORTANT: generates JavaScript code that needs to be executed in the user's browser."

The **`[playground-only]`** side-effect tools (e.g. `add_route`, `clear_waypoints`, `create_api_key`) modify the playground session or account state once executed. Treat those carefully.

## See also

- [`../rest/`](../rest/) — the REST endpoints most MCP tools are a thin layer over.
- [`../map_components/`](../map_components/) — the JavaScript library the code-generating tools target.
