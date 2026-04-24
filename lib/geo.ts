// Geographic helpers: haversine distance + rarity bucketing.

export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_M = 6_371_000;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type Rarity = 'common' | 'rare' | 'legendary';

// nearest 60% -> common, next 30% -> rare, farthest 10% -> legendary
export function bucketRarity(
  distanceMeters: number,
  maxDistanceMeters: number,
): Rarity {
  if (maxDistanceMeters <= 0) return 'common';
  const ratio = Math.min(1, Math.max(0, distanceMeters / maxDistanceMeters));
  if (ratio <= 0.6) return 'common';
  if (ratio <= 0.9) return 'rare';
  return 'legendary';
}

export const POINTS_BY_RARITY: { common: 50; rare: 150; legendary: 500 } = {
  common: 50,
  rare: 150,
  legendary: 500,
};
