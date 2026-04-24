// Node proxy for GrabMaps forward geocoding (place-name → lat/lng).
// Wraps /api/v1/maps/poi/v1/search with country=SGP, limit=1.

import { buildGrabUrl, fetchGrabJson, getApiKey, grabAuthHeader } from '@/lib/grabmaps/client';

type PlaceLocation = {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
};

type Place = {
  name?: string;
  formatted_address?: string;
  address?: string;
  location?: PlaceLocation;
  lat?: number;
  lng?: number;
};

type SearchPayload = {
  places?: Place[];
  data?: Place[];
  results?: Place[];
};

function extractFirst(payload: unknown): Place | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as SearchPayload;
  const list = p.places || p.data || p.results;
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[0];
}

export async function GET(req: Request): Promise<Response> {
  const reqUrl = new URL(req.url);
  const q = (reqUrl.searchParams.get('q') || '').trim();
  const nearLat = Number(reqUrl.searchParams.get('lat'));
  const nearLng = Number(reqUrl.searchParams.get('lng'));

  if (!q) {
    return Response.json({ error: 'Missing search query' }, { status: 400 });
  }

  try {
    const apiKey = getApiKey();
    const upstream = buildGrabUrl('/api/v1/maps/poi/v1/search', {
      keyword: q,
      country: 'SGP',
      limit: 1,
    });
    // Optional location bias — improves relevance for short queries like "mrt".
    if (Number.isFinite(nearLat) && Number.isFinite(nearLng)) {
      upstream.searchParams.set('location', `${nearLat},${nearLng}`);
    }

    const payload = await fetchGrabJson<unknown>(upstream, {
      headers: { Authorization: grabAuthHeader(apiKey) },
    });

    const place = extractFirst(payload);
    if (!place) {
      return Response.json({ error: 'No results for that query' }, { status: 404 });
    }

    const lat = place.location?.latitude ?? place.location?.lat ?? place.lat;
    const lng = place.location?.longitude ?? place.location?.lng ?? place.lng;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return Response.json({ error: 'Result missing coordinates' }, { status: 502 });
    }

    const label = place.name || place.formatted_address || place.address || q;

    return Response.json({ lat, lng, label }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[geocode]', err);
    const message = err instanceof Error ? err.message : 'geocode failed';
    return Response.json({ error: message }, { status: 502 });
  }
}
