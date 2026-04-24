'use client';

// Live hunt screen: map + progress header + selected-spot sheet with check-in.
// Data is loaded client-side through the browser Supabase client; RLS limits
// rows to the authenticated user.

import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { endHunt } from '@/lib/hunt';
import { GrabMap, type GrabMapSpot } from '@/components/GrabMap';
import { CheckInButton } from '@/components/CheckInButton';
import { RarityChip } from '@/components/ui/RarityChip';
import { Pill } from '@/components/ui/Pill';
import { haversineMeters, type Rarity } from '@/lib/geo';

type HuntRow = {
  id: string;
  radius_km: number;
  origin_lat: number;
  origin_lng: number;
  started_at: string;
  ended_at: string | null;
  points: number;
};

type SpotRow = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  rarity: Rarity;
  points: number;
  claimed: boolean;
};

export default function HuntPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: huntId } = use(params);
  const router = useRouter();

  const [hunt, setHunt] = useState<HuntRow | null>(null);
  const [spots, setSpots] = useState<SpotRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [routeGeoJson, setRouteGeoJson] =
    useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate route polyline (if this hunt was started in Detour Gang mode).
  // The polyline is stashed in sessionStorage by /hunt/new before router.push;
  // schema isn't extended for MVP.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(`route:${huntId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as GeoJSON.Feature<GeoJSON.LineString>;
      if (
        parsed &&
        parsed.type === 'Feature' &&
        parsed.geometry?.type === 'LineString' &&
        Array.isArray(parsed.geometry.coordinates) &&
        parsed.geometry.coordinates.length >= 2
      ) {
        setRouteGeoJson(parsed);
      }
    } catch {
      // Ignore malformed sessionStorage entries.
    }
  }, [huntId]);

  // Initial load of hunt + spots.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const [{ data: huntData, error: huntErr }, { data: spotData, error: spotErr }] =
        await Promise.all([
          supabase.from('hunts').select('*').eq('id', huntId).single(),
          supabase
            .from('spots')
            .select('id,name,address,lat,lng,rarity,points,claimed')
            .eq('hunt_id', huntId)
            .order('rarity'),
        ]);
      if (cancelled) return;
      if (huntErr || !huntData) {
        setLoadError(huntErr?.message || 'Hunt not found');
        return;
      }
      setHunt(huntData as HuntRow);
      setSpots((spotData ?? []) as SpotRow[]);
    })();

    return () => {
      cancelled = true;
    };
  }, [huntId]);

  // Live geolocation tracking.
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn('[watchPosition]', err.message),
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const selected = useMemo(
    () => spots.find((s) => s.id === selectedId) ?? null,
    [spots, selectedId],
  );

  const mapSpots: GrabMapSpot[] = useMemo(
    () =>
      spots.map((s) => ({
        id: s.id,
        lat: s.lat,
        lng: s.lng,
        rarity: s.rarity,
        claimed: s.claimed,
        name: s.name,
      })),
    [spots],
  );

  const claimedCount = spots.filter((s) => s.claimed).length;
  const totalPoints = spots.filter((s) => s.claimed).reduce((n, s) => n + s.points, 0);

  const initialCenter: [number, number] = hunt
    ? [hunt.origin_lng, hunt.origin_lat]
    : [103.8198, 1.3521];

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  async function handleEnd() {
    if (ending) return;
    setEnding(true);
    const res = await endHunt(huntId);
    if ('error' in res) {
      setEnding(false);
      showToast(res.error);
      return;
    }
    router.push(`/hunt/${huntId}/end`);
  }

  function handleCheckInSuccess(spotId: string, result: { points_awarded: number }) {
    setSpots((prev) => prev.map((s) => (s.id === spotId ? { ...s, claimed: true } : s)));
    showToast(`+${result.points_awarded} claimed`);
  }

  async function handleDemoCheckIn(spot: SpotRow) {
    if (spot.claimed) return;
    const supabase = createClient();
    const { data, error } = await supabase.rpc('check_in_spot', {
      p_hunt_id: huntId,
      p_spot_id: spot.id,
      p_user_lat: spot.lat,
      p_user_lng: spot.lng,
    });
    if (error) {
      showToast(error.message);
      return;
    }
    const r = (data ?? {}) as { points_awarded?: number };
    handleCheckInSuccess(spot.id, { points_awarded: r.points_awarded ?? spot.points });
  }

  const distanceLabel = (() => {
    if (!selected || !userPos) return null;
    const d = haversineMeters(userPos, { lat: selected.lat, lng: selected.lng });
    return d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;
  })();

  if (loadError) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 bg-bg">
        <div className="font-display text-2xl text-text">Hunt not found</div>
        <div className="mt-2 text-muted text-sm">{loadError}</div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-3 rounded-2xl bg-primary text-white font-display"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] overflow-hidden">
      <div className="absolute inset-0">
        <GrabMap
          initialCenter={initialCenter}
          initialZoom={14}
          spots={mapSpots}
          radiusKm={routeGeoJson ? undefined : hunt?.radius_km}
          userLocation={userPos}
          routeGeoJson={routeGeoJson}
          onSpotClick={(id) => setSelectedId(id)}
          className="w-full h-full"
        />
      </div>

      {/* Header: progress + end button */}
      <div className="absolute top-3 left-3 right-3 z-10 flex gap-2 items-stretch">
        <div className="flex-1 bg-surface/95 backdrop-blur rounded-2xl border border-border shadow-sm px-4 py-2.5 flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide font-bold text-faint">
              Progress
            </div>
            <div className="font-display text-xl text-text leading-none truncate">
              {claimedCount}/{spots.length}{' '}
              <span className="text-primary text-base">·</span>{' '}
              <span className="text-primary">+{totalPoints}</span>
            </div>
          </div>
          {hunt && (
            <Pill tone="accent" className="ml-auto flex-shrink-0">
              {hunt.radius_km} km
            </Pill>
          )}
        </div>
        <button
          type="button"
          onClick={handleEnd}
          disabled={ending}
          className="px-4 rounded-2xl bg-text text-surface font-display text-sm shadow-sm disabled:opacity-60"
        >
          {ending ? '…' : 'End hunt'}
        </button>
      </div>

      {toast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-text text-surface px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          {toast}
        </div>
      )}

      {/* Selected-spot bottom sheet */}
      {selected && (
        <div className="absolute left-0 right-0 bottom-0 z-10 bg-surface rounded-t-3xl shadow-2xl px-4 pt-3 pb-6">
          <div className="w-11 h-1.5 rounded-full bg-border mx-auto mb-3" />
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex gap-2 items-center mb-1">
                <RarityChip rarity={selected.rarity} />
                {distanceLabel && <Pill tone="primary">{distanceLabel}</Pill>}
                {selected.claimed && <Pill tone="accent">Claimed</Pill>}
              </div>
              <div className="font-display text-xl text-text leading-tight truncate">
                {selected.name}
              </div>
              {selected.address && (
                <div className="text-xs text-muted mt-0.5 truncate">{selected.address}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-surface-alt text-muted font-bold flex items-center justify-center flex-shrink-0"
            >
              ×
            </button>
          </div>

          <div className="mt-4">
            <CheckInButton
              huntId={huntId}
              spotId={selected.id}
              spotLat={selected.lat}
              spotLng={selected.lng}
              rarity={selected.rarity}
              userLat={userPos?.lat ?? null}
              userLng={userPos?.lng ?? null}
              disabled={selected.claimed}
              onSuccess={(result) => handleCheckInSuccess(selected.id, result)}
            />
            {!selected.claimed && (
              <button
                type="button"
                onClick={() => handleDemoCheckIn(selected)}
                className="mt-2 w-full text-[11px] uppercase tracking-widest font-bold text-faint hover:text-muted py-2"
              >
                📍 Demo: claim without walking
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
