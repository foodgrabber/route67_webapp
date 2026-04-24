// Autocomplete suggestions for Start/End inputs. Wraps GrabMaps Places search
// with a query+limit and returns a normalized list of places. Matches the
// /api/suggest endpoint from example/frontend/server.js (handleSuggest +
// suggestGrabPlaces).

import { buildGrabUrl, fetchGrabJson, getApiKey, grabAuthHeader } from '@/lib/grabmaps/client';

type RawPlace = {
  poi_id?: string;
  name?: string;
  formatted_address?: string;
  address?: string;
  location?: { latitude?: number; longitude?: number; lat?: number; lng?: number };
  lat?: number;
  lng?: number;
};

type Suggestion = {
  label: string;
  address: string | null;
  lat: number;
  lng: number;
  place_id: string | null;
};

function pickLatLng(p: RawPlace): { lat: number; lng: number } | null {
  const lat = p.location?.latitude ?? p.location?.lat ?? p.lat;
  const lng = p.location?.longitude ?? p.location?.lng ?? p.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat: lat as number, lng: lng as number };
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limitParam = Number(url.searchParams.get('limit'));
  const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 5, 1), 8);

  if (q.length < 2) {
    return Response.json({ places: [] as Suggestion[] });
  }

  try {
    const apiKey = getApiKey();
    const biasLat = Number(url.searchParams.get('lat')) || 1.3521;
    const biasLng = Number(url.searchParams.get('lng')) || 103.8198;
    const upstream = buildGrabUrl('/api/v1/maps/poi/v1/search', {
      keyword: q,
      country: 'SGP',
      location: `${biasLat},${biasLng}`,
      limit,
    });
    const payload = await fetchGrabJson<{ places?: RawPlace[] }>(upstream, {
      headers: { Authorization: grabAuthHeader(apiKey) },
    });

    const seen = new Set<string>();
    const places: Suggestion[] = [];
    for (const raw of payload.places ?? []) {
      const ll = pickLatLng(raw);
      if (!ll) continue;
      const key = raw.poi_id || `${raw.name}|${ll.lat.toFixed(5)},${ll.lng.toFixed(5)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      places.push({
        label: (raw.name || raw.formatted_address || 'Unnamed').trim(),
        address: raw.formatted_address || raw.address || null,
        lat: ll.lat,
        lng: ll.lng,
        place_id: raw.poi_id || null,
      });
      if (places.length >= limit) break;
    }

    return Response.json({ places });
  } catch (err) {
    console.error('[api/grabmaps/suggest]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Suggestions failed', places: [] as Suggestion[] },
      { status: 502 },
    );
  }
}
