// Node proxy for GrabMaps reverse geocoding.

import { buildGrabUrl, getApiKey, grabAuthHeader } from '@/lib/grabmaps/client';

export async function GET(req: Request): Promise<Response> {
  const reqUrl = new URL(req.url);
  const latRaw = reqUrl.searchParams.get('lat');
  const lngRaw = reqUrl.searchParams.get('lng');

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: 'Missing or invalid lat/lng' }, { status: 400 });
  }

  try {
    const apiKey = getApiKey();
    const upstream = buildGrabUrl('/api/v1/maps/poi/v1/reverse-geo', {
      location: `${lat},${lng}`,
    });

    const response = await fetch(upstream, {
      headers: { Authorization: grabAuthHeader(apiKey) },
    });

    const body = await response.text();
    let payload: unknown = null;
    if (body) {
      try {
        payload = JSON.parse(body);
      } catch {
        payload = { message: body };
      }
    }

    if (!response.ok) {
      const p = (payload ?? {}) as Record<string, unknown>;
      const detail =
        (p.Message as string | undefined) ||
        (p.message as string | undefined) ||
        `reverse-geo failed: ${response.status}`;
      return Response.json({ error: detail }, { status: 502 });
    }

    return Response.json(payload);
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'reverse-geo failed';
    return Response.json({ error: message }, { status: 502 });
  }
}
