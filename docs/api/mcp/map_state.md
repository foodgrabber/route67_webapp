# MCP — Map state & UI

Five tools. All code-generating (targets the playground UI's `mapInstance`). All `[playground-only]`.

---

## `fly_to` (mutating)

Smoothly pan the map to a location.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `location` | string | yes | `"lng,lat"` or place name. |
| `zoom` | int | no | 0–22, default 16. |

### Return

JS snippet:

```javascript
await mapInstance.flyTo([106.8272, -6.1754], 14);
```

---

## `control_layers` (mutating on `show`/`hide`/`toggle`, config-only on `set_*`)

Show / hide map layers, or generate a config with layer defaults.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `action` | string | yes | `show`, `hide`, `toggle`, `enable_menu`, `set_defaults`, `set_enabled`. |
| `layer` | string | conditional | `traffic`, `poi`, `buildings`, `coverage`, `hd`, `batch-traffic`. Required for show/hide/toggle. |
| `show_menu` | bool | no | Default true. |
| `default_layers` / `enabled_layers` / `available_layers` | string[] | no | For config actions. |

### Return

JS snippet calling `mapInstance.setLayerVisibility(layer, visible)` or a config object.

### Layer cheatsheet

| Layer | Effect |
|---|---|
| `traffic` | Real-time traffic overlay. |
| `poi` | POI markers. |
| `buildings` | 3D building extrusions. |
| `coverage` | Camera coverage paths (for street view). |
| `hd` | High-definition map tiles. |
| `batch-traffic` | Batch-loaded traffic data. |

**Priority:** `enabledLayers` > `defaultLayers`. If `show_menu` is false, only `enabledLayers` is honoured.

---

## `update_map_state_from_url` (read-only)

Parse a GrabMaps playground URL (or iframe src) and extract its `{ lat, lng, zoom }`.

### Input

| Param | Type | Req |
|---|---|---|
| `url` | string | yes |

### Return

`{ center: { lat, lng }, zoom }` — or an error if the URL can't be parsed.

Useful for syncing agent context to the user's current view.

---

## `toggle_waypoints_modal` (mutating)

Show / hide / toggle the waypoint planner modal.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `visible` | bool | no | Omit to toggle. |

### Return

JS snippet calling `mapInstance.setWaypointsModalVisible()` or `.toggleWaypointsModal()`.

---

## `open_poi` (mutating)

Open the POI detail modal at a coordinate or place name.

### Input

| Param | Type | Req | Notes |
|---|---|---|---|
| `location` | string | yes | `"lng,lat"` or place name. |

### Return

JS snippet:

```javascript
await mapInstance.openPOI('Marina Bay Sands, Singapore');
```

**See also:** [`../map_components/grab_maps_lib.md`](../map_components/grab_maps_lib.md) — the underlying methods.
