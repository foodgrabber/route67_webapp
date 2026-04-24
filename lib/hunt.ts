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
