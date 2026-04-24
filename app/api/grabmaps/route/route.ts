// Route preview: fetches a directions route (distance + duration + polyline) for
// A→B so the UI can show the trip before committing to a hunt. Matches the
// /api/route pattern from example/frontend/server.js.

import { fetchRoute } from '@/lib/grabmaps/directions';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const startLat = Number(url.searchParams.get('startLat'));
  const startLng = Number(url.searchParams.get('startLng'));
  const endLat = Number(url.searchParams.get('endLat'));
  const endLng = Number(url.searchParams.get('endLng'));

  if (![startLat, startLng, endLat, endLng].every(Number.isFinite)) {
    return Response.json(
      { error: 'startLat, startLng, endLat, endLng are all required numbers' },
      { status: 400 },
    );
  }

  try {
    const route = await fetchRoute(
      { lat: startLat, lng: startLng },
      { lat: endLat, lng: endLng },
    );
    return Response.json({
      distance: route.distance,
      duration: route.duration,
      geometry: { type: 'LineString', coordinates: route.coordinates },
    });
  } catch (err) {
    console.error('[api/grabmaps/route]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Route failed' },
      { status: 502 },
    );
  }
}
