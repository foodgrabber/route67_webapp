'use server';

// Server actions: startHunt, endHunt.
// Calls GrabMaps places/nearby directly server-side (env key safe here), falls
// back to hand-picked spots if the API under-delivers. Inserts a hunt + up to
// 67 spots with rarity assigned by distance bucket.

import { createClient } from '@/lib/supabase/server';
import {
  buildGrabUrl,
  fetchGrabJson,
  getApiKey,
  grabAuthHeader,
} from '@/lib/grabmaps/client';
import { fetchRoute } from '@/lib/grabmaps/directions';
import {
  minDistanceToRouteMeters,
  sampleRoute,
} from '@/lib/grabmaps/corridor';
import { FALLBACK_SPOTS } from '@/lib/grabmaps/fallbackSpots';
import { bucketRarity, haversineMeters, POINTS_BY_RARITY } from '@/lib/geo';

type NearbyPlace = {
  poi_id?: string;
  place_id?: string;
  name?: string;
  formatted_address?: string;
  address?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
  };
  lat?: number;
  lng?: number;
};

type NearbyPayload = {
  places?: NearbyPlace[];
  data?: NearbyPlace[];
  results?: NearbyPlace[];
};

type RawSpot = { name: string; address: string | null; lat: number; lng: number; place_id: string | null };

function extractPlaces(payload: unknown): NearbyPlace[] {
  if (!payload || typeof payload !== 'object') return [];
  const p = payload as NearbyPayload;
  if (Array.isArray(p.places)) return p.places;
  if (Array.isArray(p.data)) return p.data;
  if (Array.isArray(p.results)) return p.results;
  if (Array.isArray(payload)) return payload as NearbyPlace[];
  return [];
}

function placeToSpot(p: NearbyPlace): RawSpot | null {
  const lat = p.location?.latitude ?? p.location?.lat ?? p.lat;
  const lng = p.location?.longitude ?? p.location?.lng ?? p.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    name: p.name?.trim() || 'Unnamed spot',
    address: p.formatted_address || p.address || null,
    lat: lat as number,
    lng: lng as number,
    place_id: p.poi_id || p.place_id || null,
  };
}

export async function startHunt(
  radiusKm: number,
  userLat: number,
  userLng: number,
): Promise<{ huntId: string } | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    let raw: RawSpot[] = [];
    try {
      const apiKey = getApiKey();
      const url = buildGrabUrl('/api/v1/maps/place/v2/nearby', {
        location: `${userLat},${userLng}`,
        radius: radiusKm,
        limit: 120,
        rankBy: 'distance',
      });
      const payload = await fetchGrabJson<unknown>(url, {
        headers: { Authorization: grabAuthHeader(apiKey) },
      });
      raw = extractPlaces(payload).map(placeToSpot).filter((s): s is RawSpot => !!s);
    } catch (err) {
      console.error('[startHunt] nearby fetch failed', err);
    }

    if (raw.length < 10) {
      raw = FALLBACK_SPOTS.map((f) => ({
        name: f.name,
        address: f.address ?? null,
        lat: f.lat,
        lng: f.lng,
        place_id: null,
      }));
    }

    const withDist = raw
      .map((s) => ({ ...s, dist: haversineMeters({ lat: userLat, lng: userLng }, { lat: s.lat, lng: s.lng }) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 67);

    if (withDist.length === 0) return { error: 'No spots found' };

    const maxDist = withDist[withDist.length - 1].dist || 1;

    const { data: hunt, error: huntErr } = await supabase
      .from('hunts')
      .insert({
        user_id: user.id,
        radius_km: radiusKm,
        origin_lat: userLat,
        origin_lng: userLng,
      })
      .select('id')
      .single();
    if (huntErr || !hunt) {
      console.error('[startHunt] hunt insert failed', huntErr);
      return { error: huntErr?.message || 'Failed to create hunt' };
    }

    const spotRows = withDist.map((s) => {
      const rarity = bucketRarity(s.dist, maxDist);
      return {
        hunt_id: hunt.id,
        grab_place_id: s.place_id,
        name: s.name,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        rarity,
        points: POINTS_BY_RARITY[rarity],
      };
    });

    const { error: spotsErr } = await supabase.from('spots').insert(spotRows);
    if (spotsErr) {
      console.error('[startHunt] spots insert failed', spotsErr);
      return { error: spotsErr.message };
    }

    return { huntId: hunt.id };
  } catch (err) {
    console.error('[startHunt] unhandled', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

type RouteLineString = GeoJSON.Feature<GeoJSON.LineString>;

export async function startRouteHunt(
  corridorKm: number,
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  profile: 'driving' | 'walking' = 'driving',
): Promise<{ huntId: string; routeGeoJson: RouteLineString } | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // Clamp corridor to the documented slider range (0.5..3 km).
    const corridor = Math.min(3, Math.max(0.5, corridorKm));

    let routeCoords: [number, number][] = [];
    let routeDistance = 0;
    let routeDuration = 0;
    try {
      const route = await fetchRoute(start, end, { profile });
      routeCoords = route.coordinates;
      routeDistance = route.distance;
      routeDuration = route.duration;
    } catch (err) {
      console.error('[startRouteHunt] route fetch failed', err);
      return { error: err instanceof Error ? err.message : 'Could not build a route between those points' };
    }

    if (routeCoords.length < 2) {
      return { error: 'Empty route geometry' };
    }

    // Sample 6 points along the route; search nearby places at each in parallel.
    const samples = sampleRoute(routeCoords, 6);
    const apiKey = getApiKey();

    let collected: RawSpot[] = [];
    try {
      const batches = await Promise.all(
        samples.map(async (pt) => {
          const url = buildGrabUrl('/api/v1/maps/place/v2/nearby', {
            location: `${pt[1]},${pt[0]}`,
            radius: corridor,
            limit: 30,
            rankBy: 'distance',
          });
          try {
            const payload = await fetchGrabJson<unknown>(url, {
              headers: { Authorization: grabAuthHeader(apiKey) },
            });
            return extractPlaces(payload).map(placeToSpot).filter((s): s is RawSpot => !!s);
          } catch (err) {
            console.error('[startRouteHunt] sample fetch failed', err);
            return [] as RawSpot[];
          }
        }),
      );
      collected = batches.flat();
    } catch (err) {
      console.error('[startRouteHunt] parallel nearby failed', err);
    }

    // Dedupe by poi_id when available, else by rounded lat/lng.
    const seen = new Set<string>();
    const unique: RawSpot[] = [];
    for (const s of collected) {
      const key = s.place_id
        ? `id:${s.place_id}`
        : `ll:${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(s);
    }

    const corridorMeters = corridor * 1000;

    // Keep only spots within the corridor.
    let inside = unique
      .map((s) => ({
        ...s,
        distFromRoute: minDistanceToRouteMeters(
          { lat: s.lat, lng: s.lng },
          routeCoords,
        ),
        distFromStart: haversineMeters(start, { lat: s.lat, lng: s.lng }),
      }))
      .filter((s) => s.distFromRoute <= corridorMeters);

    // Fallback: if upstream returned too little, filter the hand-picked set.
    if (inside.length < 10) {
      const fallback = FALLBACK_SPOTS.map((f) => ({
        name: f.name,
        address: f.address ?? null,
        lat: f.lat,
        lng: f.lng,
        place_id: null as string | null,
      }))
        .map((s) => ({
          ...s,
          distFromRoute: minDistanceToRouteMeters(
            { lat: s.lat, lng: s.lng },
            routeCoords,
          ),
          distFromStart: haversineMeters(start, { lat: s.lat, lng: s.lng }),
        }))
        .filter((s) => s.distFromRoute <= corridorMeters);

      // Merge + redupe.
      const mergedSeen = new Set<string>();
      inside = [...inside, ...fallback].filter((s) => {
        const key = s.place_id
          ? `id:${s.place_id}`
          : `ll:${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
        if (mergedSeen.has(key)) return false;
        mergedSeen.add(key);
        return true;
      });
    }

    if (inside.length === 0) {
      return { error: 'No 67 spots found in that corridor — try widening it' };
    }

    // Sort traversal order by distance from start, cap at 67.
    inside.sort((a, b) => a.distFromStart - b.distFromStart);
    const picked = inside.slice(0, 67);

    // Rarity by distance-from-route: closer = common, farther = legendary.
    const maxDistFromRoute =
      picked.reduce((m, s) => Math.max(m, s.distFromRoute), 0) || 1;

    const { data: hunt, error: huntErr } = await supabase
      .from('hunts')
      .insert({
        user_id: user.id,
        radius_km: corridor,
        origin_lat: start.lat,
        origin_lng: start.lng,
      })
      .select('id')
      .single();
    if (huntErr || !hunt) {
      console.error('[startRouteHunt] hunt insert failed', huntErr);
      return { error: huntErr?.message || 'Failed to create hunt' };
    }

    const spotRows = picked.map((s) => {
      const rarity = bucketRarity(s.distFromRoute, maxDistFromRoute);
      return {
        hunt_id: hunt.id,
        grab_place_id: s.place_id,
        name: s.name,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        rarity,
        points: POINTS_BY_RARITY[rarity],
      };
    });

    const { error: spotsErr } = await supabase.from('spots').insert(spotRows);
    if (spotsErr) {
      console.error('[startRouteHunt] spots insert failed', spotsErr);
      return { error: spotsErr.message };
    }

    // Small perf hint for unused route stats — keep them in the log for demo.
    if (routeDistance || routeDuration) {
      console.log(
        `[startRouteHunt] route ${(routeDistance / 1000).toFixed(1)} km / ` +
          `${Math.round(routeDuration / 60)} min · ${picked.length} spots`,
      );
    }

    const routeGeoJson: RouteLineString = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: routeCoords },
    };

    return { huntId: hunt.id, routeGeoJson };
  } catch (err) {
    console.error('[startRouteHunt] unhandled', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function endHunt(
  huntId: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('hunts')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', huntId)
      .eq('user_id', user.id)
      .is('ended_at', null);
    if (error) {
      console.error('[endHunt] update failed', error);
      return { error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error('[endHunt] unhandled', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
