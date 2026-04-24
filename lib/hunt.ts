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
import {
  bucketRarity,
  haversineMeters,
  nearestNeighborOrder,
  POINTS_BY_RARITY,
} from '@/lib/geo';
import { match67Tier } from '@/lib/grabmaps/filter67';

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

type RawSpot = {
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  place_id: string | null;
};

// Search a location with keyword "67" and parse the payload. Returns an empty
// array on upstream errors (callers should aggregate + fallback).
async function search67AtLocation(
  location: { lat: number; lng: number },
  limit: number,
  apiKey: string,
): Promise<RawSpot[]> {
  try {
    const url = buildGrabUrl('/api/v1/maps/poi/v1/search', {
      keyword: '67',
      country: 'SGP',
      location: `${location.lat},${location.lng}`,
      limit,
    });
    const payload = await fetchGrabJson<unknown>(url, {
      headers: { Authorization: grabAuthHeader(apiKey) },
    });
    return extractPlaces(payload).map(placeToSpot).filter((s): s is RawSpot => !!s);
  } catch (err) {
    console.error('[search67] failed', err);
    return [];
  }
}

// Given a pool of RawSpot candidates, keep those whose name or address mentions
// "67". Strict matches (starts with "67") sort first so they fill the slot list
// before looser word-boundary matches.
function filter67Candidates(spots: RawSpot[]): RawSpot[] {
  const scored = spots
    .map((s) => ({ ...s, tier: match67Tier({ name: s.name, address: s.address }) }))
    .filter((s) => s.tier !== 'none');
  // strict first, then loose, stable within tiers.
  scored.sort((a, b) => (a.tier === b.tier ? 0 : a.tier === 'strict' ? -1 : 1));
  return scored.map(({ tier, ...rest }) => {
    void tier;
    return rest;
  });
}

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

type RouteLineString = GeoJSON.Feature<GeoJSON.LineString>;

export async function startHunt(
  radiusKm: number,
  userLat: number,
  userLng: number,
): Promise<{ huntId: string; routeGeoJson?: RouteLineString } | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const apiKey = getApiKey();

    // Sample a small grid around the user so we get more "67" matches than a
    // single search would return — matches the spirit of the route mode's
    // multi-sample approach. Offsets are in degrees (~110km/deg lat, ~110*cos).
    const offsets: Array<[number, number]> = [
      [0, 0],
      [radiusKm * 0.006, 0],
      [-radiusKm * 0.006, 0],
      [0, radiusKm * 0.006],
      [0, -radiusKm * 0.006],
    ];
    const batches = await Promise.all(
      offsets.map(([dLat, dLng]) =>
        search67AtLocation(
          { lat: userLat + dLat, lng: userLng + dLng },
          20,
          apiKey,
        ),
      ),
    );
    const flat = batches.flat();

    // Dedupe by poi_id, else by rounded lat/lng.
    const seen = new Set<string>();
    const deduped: RawSpot[] = [];
    for (const s of flat) {
      const key = s.place_id
        ? `id:${s.place_id}`
        : `ll:${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(s);
    }

    // Keep only candidates whose name/address references "67".
    let raw = filter67Candidates(deduped);

    // Keep only those within the chosen radius.
    const radiusMeters = radiusKm * 1000;
    raw = raw.filter(
      (s) =>
        haversineMeters({ lat: userLat, lng: userLng }, { lat: s.lat, lng: s.lng }) <=
        radiusMeters,
    );

    if (raw.length === 0) {
      return {
        error:
          `No "67" spots found within ${radiusKm.toFixed(1)} km of you. ` +
          `Try widening the radius or moving to a different area.`,
      };
    }

    const withDist = raw
      .map((s) => ({
        ...s,
        dist: haversineMeters({ lat: userLat, lng: userLng }, { lat: s.lat, lng: s.lng }),
      }))
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

    // Build a suggested walking path through the 67-spots: nearest-neighbor
    // order from the user, cap waypoints at 8 (URL-length safety). End the
    // route at the farthest sampled spot so fetchRoute has a distinct end.
    let routeGeoJson: RouteLineString | undefined;
    if (withDist.length >= 2) {
      try {
        const origin = { lat: userLat, lng: userLng };
        const ordered = nearestNeighborOrder(origin, withDist);
        const maxWaypoints = 8;
        const sampled =
          ordered.length <= maxWaypoints
            ? ordered
            : Array.from({ length: maxWaypoints }, (_, i) =>
                ordered[Math.floor((i * ordered.length) / maxWaypoints)],
              );
        const last = sampled[sampled.length - 1];
        const middle = sampled.slice(0, -1);
        const stitched = await fetchRoute(
          origin,
          { lat: last.lat, lng: last.lng },
          { profile: 'walking', waypoints: middle.map((s) => ({ lat: s.lat, lng: s.lng })) },
        );
        if (stitched.coordinates.length >= 2) {
          routeGeoJson = {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: stitched.coordinates },
          };
        }
      } catch (err) {
        console.error('[startHunt] suggested route failed; skipping polyline', err);
      }
    }

    return { huntId: hunt.id, routeGeoJson };
  } catch (err) {
    console.error('[startHunt] unhandled', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

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

    // Sample 7 points along the route; at each, search Places with keyword="67"
    // (mirrors example/frontend's find67StopsAlongRoute pattern).
    const samples = sampleRoute(routeCoords, 7);
    const apiKey = getApiKey();

    let collected: RawSpot[] = [];
    try {
      const batches = await Promise.all(
        samples.map((pt) =>
          search67AtLocation({ lat: pt[1], lng: pt[0] }, 8, apiKey),
        ),
      );
      collected = batches.flat();
    } catch (err) {
      console.error('[startRouteHunt] parallel 67 search failed', err);
    }

    // Keep only candidates whose name or address references "67".
    collected = filter67Candidates(collected);

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
    const inside = unique
      .map((s) => ({
        ...s,
        distFromRoute: minDistanceToRouteMeters(
          { lat: s.lat, lng: s.lng },
          routeCoords,
        ),
        distFromStart: haversineMeters(start, { lat: s.lat, lng: s.lng }),
      }))
      .filter((s) => s.distFromRoute <= corridorMeters);

    if (inside.length === 0) {
      return {
        error:
          `No "67" spots found along that route (corridor ${corridor.toFixed(1)} km). ` +
          `Try a different route or widen the corridor.`,
      };
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

    // Re-route through the picked 67-spots so the polyline literally threads
    // through each stop in order. Cap waypoints at 8 to keep URL length sane.
    // If re-routing fails, fall back to the original start→end polyline.
    let polyline: [number, number][] = routeCoords;
    const maxWaypoints = 8;
    const waypointSpots =
      picked.length <= maxWaypoints
        ? picked
        : (() => {
            // Evenly sample `maxWaypoints` entries from the start-sorted list.
            const step = picked.length / maxWaypoints;
            return Array.from({ length: maxWaypoints }, (_, i) =>
              picked[Math.floor(i * step)],
            );
          })();

    if (waypointSpots.length > 0) {
      try {
        const stitched = await fetchRoute(start, end, {
          profile,
          waypoints: waypointSpots.map((s) => ({ lat: s.lat, lng: s.lng })),
        });
        if (stitched.coordinates.length >= 2) {
          polyline = stitched.coordinates;
          routeDistance = stitched.distance;
          routeDuration = stitched.duration;
        }
      } catch (err) {
        console.error('[startRouteHunt] waypoint re-route failed; keeping base line', err);
      }
    }

    console.log(
      `[startRouteHunt] ${(routeDistance / 1000).toFixed(1)} km / ` +
        `${Math.round(routeDuration / 60)} min · ${picked.length} 67-spots · ` +
        `${waypointSpots.length} waypoints`,
    );

    const routeGeoJson: RouteLineString = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: polyline },
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
