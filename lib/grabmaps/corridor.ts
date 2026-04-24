// Corridor math for "Detour Gang" mode: perpendicular distance from a POI to
// a route polyline, plus even sampling along the route for POI search.
//
// Ported from example/frontend/server.js (distancePointToSegmentMeters,
// nearestRouteDistance, sampleRoute).

import { haversineMeters, type LatLng } from '@/lib/geo';

// Flat-earth approximation — accurate enough for Singapore-scale distances
// (< ~30 km) and orders of magnitude faster than haversine in a hot loop.
function toMeters(reference: LatLng) {
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLng = 111_320 * Math.cos((reference.lat * Math.PI) / 180);
  return (p: LatLng) => ({
    x: (p.lng - reference.lng) * metersPerDegreeLng,
    y: (p.lat - reference.lat) * metersPerDegreeLat,
  });
}

export function pointToSegmentMeters(point: LatLng, a: LatLng, b: LatLng): number {
  const project = toMeters(point);
  const pa = project(a);
  const pb = project(b);
  const dx = pb.x - pa.x;
  const dy = pb.y - pa.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(pa.x * dx + pa.y * dy) / len2));
  const cx = pa.x + dx * t;
  const cy = pa.y + dy * t;
  return Math.hypot(cx, cy);
}

export function minDistanceToRouteMeters(
  point: LatLng,
  coords: [number, number][],
): number {
  if (!coords || coords.length === 0) return Number.POSITIVE_INFINITY;
  if (coords.length === 1) {
    return haversineMeters(point, { lat: coords[0][1], lng: coords[0][0] });
  }
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const a = { lng: coords[i][0], lat: coords[i][1] };
    const b = { lng: coords[i + 1][0], lat: coords[i + 1][1] };
    const d = pointToSegmentMeters(point, a, b);
    if (d < best) best = d;
  }
  return best;
}

// Pick N evenly-spaced points along the route (indices, not geodesic arc length
// — same approach as the reference). Deduplicates samples that land within ~75 m
// of each other so we don't waste parallel POI requests on the same spot.
export function sampleRoute(
  coords: [number, number][],
  samples: number,
): [number, number][] {
  if (!coords || coords.length === 0 || samples <= 0) return [];
  const lastIndex = coords.length - 1;
  const picked: [number, number][] = [];
  for (let i = 0; i < samples; i += 1) {
    const routeIndex = Math.round((lastIndex * i) / Math.max(1, samples - 1));
    picked.push(coords[routeIndex]);
  }
  return picked.filter((pt, idx, all) => {
    const p = { lat: pt[1], lng: pt[0] };
    return (
      all.findIndex(
        (other) => haversineMeters(p, { lat: other[1], lng: other[0] }) < 75,
      ) === idx
    );
  });
}
