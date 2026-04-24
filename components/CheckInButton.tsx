'use client';

// Distance-gated check-in button. Calls the `check_in_spot` RPC on success.

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { haversineMeters, POINTS_BY_RARITY, type Rarity } from '@/lib/geo';

interface CheckInButtonProps {
  huntId: string;
  spotId: string;
  spotLat: number;
  spotLng: number;
  rarity: Rarity;
  userLat: number | null;
  userLng: number | null;
  disabled?: boolean;
  onSuccess?: (result: { points_awarded: number; total_points: number; distance_m: number }) => void;
}

type RpcResult = {
  ok?: boolean;
  spot_id?: string;
  points_awarded?: number;
  total_points?: number;
  distance_m?: number;
};

export function CheckInButton({
  huntId,
  spotId,
  spotLat,
  spotLng,
  rarity,
  userLat,
  userLng,
  disabled,
  onSuccess,
}: CheckInButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  const points = POINTS_BY_RARITY[rarity];

  const havePos = userLat != null && userLng != null;
  const distance = havePos
    ? haversineMeters({ lat: userLat, lng: userLng }, { lat: spotLat, lng: spotLng })
    : Infinity;

  const tooFar = havePos && distance > 50;
  const gateDisabled = !havePos || tooFar || busy || disabled || claimed;

  async function handleClick() {
    if (gateDisabled || !havePos) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc('check_in_spot', {
        p_hunt_id: huntId,
        p_spot_id: spotId,
        p_user_lat: userLat,
        p_user_lng: userLng,
      });
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      const result = data as RpcResult | null;
      if (result?.ok) {
        setClaimed(true);
        onSuccess?.({
          points_awarded: result.points_awarded ?? points,
          total_points: result.total_points ?? 0,
          distance_m: result.distance_m ?? Math.round(distance),
        });
        setTimeout(() => setClaimed(false), 1200);
      } else {
        setError('Check-in failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setBusy(false);
    }
  }

  let label: string;
  let tone: 'primary' | 'muted' | 'claimed';
  if (claimed) {
    label = 'Claimed!';
    tone = 'claimed';
  } else if (!havePos) {
    label = 'Waiting for location';
    tone = 'muted';
  } else if (tooFar) {
    label = `${Math.round(distance)} m away — get closer`;
    tone = 'muted';
  } else if (busy) {
    label = 'Checking in…';
    tone = 'primary';
  } else {
    label = `CHECK IN (+${points})`;
    tone = 'primary';
  }

  const baseCls =
    'w-full rounded-2xl shadow-lg py-4 font-display tracking-wide text-base disabled:cursor-not-allowed';
  const toneCls =
    tone === 'primary'
      ? 'bg-primary text-white hover:bg-primary-dark'
      : tone === 'claimed'
      ? 'bg-primary-dark text-white'
      : 'bg-surface-alt text-muted';

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={gateDisabled}
        className={`${baseCls} ${toneCls}`}
      >
        {label}
      </button>
      {error && (
        <div className="mt-2 text-sm text-center text-accent font-body">{error}</div>
      )}
    </div>
  );
}

export default CheckInButton;
