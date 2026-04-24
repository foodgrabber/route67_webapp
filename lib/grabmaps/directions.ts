// GrabMaps Directions API wrapper.
// Calls the upstream-documented `/api/v1/maps/eta/v1/direction` endpoint and
// decodes the polyline6 `route.geometry` server-side so callers get ready-made
// `[lng, lat]` coordinate pairs suitable for a GeoJSON LineString.
//
// Ported from example/frontend/server.js (routeGrab, decodePolyline).

import { buildGrabUrl, fetchGrabJson, getApiKey, grabAuthHeader } from './client';

export type LatLng = { lat: number; lng: number };

export type GrabRoute = {
  distance: number; // metres
  duration: number; // seconds
  coordinates: [number, number][]; // [lng, lat] pairs
};

type GrabDirectionResponse = {
  code?: string;
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: string;
    legs?: unknown[];
  }>;
};

// Decode a Google-style polyline (precision 6 by default) into an array of
// [lng, lat] pairs. Identical to example/frontend/server.js:451.
export function decodePolyline(encoded: string, precision = 6): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];
  const factor = 10 ** precision;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
}

export async function fetchRoute(
  start: LatLng,
  end: LatLng,
  opts?: { profile?: string; waypoints?: LatLng[] },
): Promise<GrabRoute> {
  const apiKey = getApiKey();
  const url = buildGrabUrl('/api/v1/maps/eta/v1/direction');
  // `coordinates` is a repeated param — `URL.searchParams.set` would collapse
  // both values, so append explicitly. Start, then any waypoints in order, then end.
  url.searchParams.append('coordinates', `${start.lng},${start.lat}`);
  for (const w of opts?.waypoints ?? []) {
    url.searchParams.append('coordinates', `${w.lng},${w.lat}`);
  }
  url.searchParams.append('coordinates', `${end.lng},${end.lat}`);
  url.searchParams.set('profile', opts?.profile || 'driving');
  url.searchParams.set('overview', 'full');
  url.searchParams.set('geometries', 'polyline6');

  const payload = await fetchGrabJson<GrabDirectionResponse>(url, {
    headers: { Authorization: grabAuthHeader(apiKey) },
  });

  const route = payload.routes?.[0];
  if (!route) {
    throw new Error('No route returned by GrabMaps');
  }

  const coordinates = route.geometry
    ? decodePolyline(route.geometry, 6)
    : [
        [start.lng, start.lat] as [number, number],
        [end.lng, end.lat] as [number, number],
      ];

  return {
    distance: Number(route.distance) || 0,
    duration: Number(route.duration) || 0,
    coordinates,
  };
}
