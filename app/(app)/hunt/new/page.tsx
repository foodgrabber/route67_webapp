'use client';

// Start-a-hunt page. Grabs geolocation, lets the user pick a radius,
// then calls the `startHunt` server action and navigates to the live hunt.

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { startHunt } from '@/lib/hunt';

export default function NewHuntPage() {
  const router = useRouter();
  const [radius, setRadius] = useState(2.0);
  const [status, setStatus] = useState<'idle' | 'locating' | 'starting'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleBegin() {
    if (status !== 'idle') return;
    setError(null);
    setStatus('locating');
    if (!('geolocation' in navigator)) {
      setStatus('idle');
      setError('Geolocation not available on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus('starting');
        try {
          const res = await startHunt(radius, pos.coords.latitude, pos.coords.longitude);
          if ('error' in res) {
            setError(res.error);
            setStatus('idle');
            return;
          }
          router.push(`/hunt/${res.huntId}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to start hunt');
          setStatus('idle');
        }
      },
      (err) => {
        setError(err.message || 'Could not get your location');
        setStatus('idle');
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 10_000 },
    );
  }

  const busy = status !== 'idle';
  const cta = status === 'locating'
    ? 'Finding you…'
    : status === 'starting'
    ? 'Loading 67s…'
    : 'Begin hunt';

  return (
    <div className="min-h-full px-4 pt-12 pb-8 bg-bg">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-4xl tracking-tight text-text leading-none">
          Start a hunt
        </h1>
        <p className="mt-2 text-muted font-body text-sm">
          Lock a radius around you. We surface up to 67 spots inside.
        </p>

        <div className="mt-8 bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wide text-faint">
              Hunt radius
            </div>
            <div className="font-display text-3xl text-text leading-none">
              {radius.toFixed(1)}
              <span className="text-sm font-bold text-muted ml-1">KM</span>
            </div>
          </div>

          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            disabled={busy}
            className="mt-4 w-full accent-primary h-11"
            aria-label="Hunt radius in kilometres"
          />

          <div className="mt-2 flex justify-between text-[11px] text-faint font-body">
            <span>0.5 km</span>
            <span>3.0 km</span>
          </div>

          <div className="mt-5 text-sm text-muted font-body">
            67 spots within <span className="font-bold text-text">{radius.toFixed(1)} km</span> of you
          </div>
        </div>

        <button
          type="button"
          onClick={handleBegin}
          disabled={busy}
          className="mt-6 w-full min-h-[56px] rounded-2xl bg-primary text-white font-display tracking-wide text-lg shadow-lg hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {cta}
        </button>

        {error && (
          <div className="mt-4 text-center text-sm text-accent font-body">{error}</div>
        )}
      </div>
    </div>
  );
}
