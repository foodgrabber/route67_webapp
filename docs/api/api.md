# GrabMaps — Credentials & Access

All secrets live in the repo-root [`.env`](../../.env) (gitignored). Copy [`.env.example`](../../.env.example) to `.env` and fill in real values from the GrabMaps developer portal.

## Environment variables

| Key | Purpose |
|---|---|
| `GRABMAPS_API_KEY` | Bearer token for protected REST endpoints — `Authorization: Bearer ${GRABMAPS_API_KEY}`. |
| `GRABMAPS_MCP_TOKEN` | Bearer token for the MCP HTTP transport. **Separate from the API key**; mismatched keys are a common error. |
| `GRABMAPS_MCP_URL` | MCP transport URL (usually `https://maps.grab.com/api/v1/mcp`). |
| `GRABMAPS_DOCS_BASIC_USER` / `GRABMAPS_DOCS_BASIC_PASS` | Basic Auth for `https://maps.grab.com/developer/documentation`. |

## Getting keys

1. Register at **https://maps.grab.com/developer** with the email you signed up to the hackathon with (Google or GitHub SSO).
2. Generate an **API key** and an **MCP URL/key** — each lives in its own portal panel.
3. Paste the values into `.env`.

## Connect the MCP server to Claude Code

```bash
set -a; source .env; set +a
claude mcp add --transport http grab-maps-playground \
  "$GRABMAPS_MCP_URL" \
  --header "Authorization: Bearer $GRABMAPS_MCP_TOKEN"
```

## Upstream library include

CDN bundle for plain HTML / static sites:

```html
<script type="module" src="https://maps.grab.com/developer/assets/js/grabmaps.es.js"></script>
```

For bundled apps: `npm install grab-maps maplibre-gl` and import in your build.

## Where to go next

- [`source_map.md`](source_map.md) — canonical index for this docs tree
- [`Grabmaps_SKILL.md`](Grabmaps_SKILL.md) — single-page library + REST + MCP reference
- [`rest/`](rest/) — HTTP endpoint reference (19 endpoints)
- [`map_components/`](map_components/) — `grab-maps` JS library (npm + CDN)
- [`mcp/`](mcp/) — MCP tool reference (25 tools)
