'use client';

// Hunt-mode picker. Two modes:
//   * "67 Lockdown" — radius hunt around the user (original flow, unchanged).
//   * "Detour Gang" — pick A → B, inflate corridor, collect 67s along the way.
// Port of design/project/app/{modes,plan}.jsx, simplified for MVP.

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { startHunt, startRouteHunt } from '@/lib/hunt';

type Mode = 'radius' | 'route';

type Endpoint = { lat: number; lng: number; label: string } | null;

const MODE_CARDS: Array<{
  id: Mode;
  name: string;
  tagline: string;
  blurb: string;
  emoji: string;
  accent: 'accent' | 'primary';
  bestFor: string;
}> = [
  {
    id: 'radius',
    name: '67 Lockdown',
    tagline: 'Hunt in this radius',
    blurb: 'Lock a radius around you. We surface up to 67 spots inside.',
    emoji: '🎯',
    accent: 'accent',
    bestFor: 'free time · max collection',
  },
  {
    id: 'route',
    name: 'Detour Gang',
    tagline: 'Hunt along the way',
    blurb: 'Pick A → B. We inflate the corridor and grab every 67 that fits the detour.',
    emoji: '🛣️',
    accent: 'primary',
    bestFor: 'commuting · going somewhere anyway',
  },
];

export default function NewHuntPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('radius');

  // Radius-mode state (unchanged from the old page).
  const [radius, setRadius] = useState(2.0);
  const [status, setStatus] = useState<'idle' | 'locating' | 'starting'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Route-mode state.
  const [startText, setStartText] = useState('');
  const [endText, setEndText] = useState('');
  const [startPt, setStartPt] = useState<Endpoint>(null);
  const [endPt, setEndPt] = useState<Endpoint>(null);
  const [corridorKm, setCorridorKm] = useState(0.8);
  const [profile, setProfile] = useState<'driving' | 'walking'>('driving');
  const [resolving, setResolving] = useState<'start' | 'end' | null>(null);
  const [routeStatus, setRouteStatus] = useState<'idle' | 'previewing' | 'starting'>('idle');
  const [routeError, setRouteError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    distance: number;
    duration: number;
    geometry: GeoJSON.LineString;
  } | null>(null);

  // Autocomplete suggestions (debounced against /api/grabmaps/suggest).
  type Suggestion = { label: string; address: string | null; lat: number; lng: number };
  const [startSug, setStartSug] = useState<Suggestion[]>([]);
  const [endSug, setEndSug] = useState<Suggestion[]>([]);
  const [focused, setFocused] = useState<'start' | 'end' | null>(null);

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

  // --- Route-mode helpers --------------------------------------------------

  async function geocode(q: string): Promise<Endpoint> {
    const res = await fetch(`/api/grabmaps/geocode?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Could not find "${q}"`);
    }
    const body = (await res.json()) as { lat: number; lng: number; label: string };
    return { lat: body.lat, lng: body.lng, label: body.label };
  }

  async function resolveStart() {
    if (!startText.trim()) {
      setStartPt(null);
      return;
    }
    setResolving('start');
    setRouteError(null);
    try {
      const pt = await geocode(startText.trim());
      setStartPt(pt);
      setStartText(pt?.label ?? startText);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Failed to resolve start');
      setStartPt(null);
    } finally {
      setResolving(null);
    }
  }

  async function resolveEnd() {
    if (!endText.trim()) {
      setEndPt(null);
      return;
    }
    setResolving('end');
    setRouteError(null);
    try {
      const pt = await geocode(endText.trim());
      setEndPt(pt);
      setEndText(pt?.label ?? endText);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Failed to resolve end');
      setEndPt(null);
    } finally {
      setResolving(null);
    }
  }

  function useCurrentLocationForStart() {
    if (!('geolocation' in navigator)) {
      setRouteError('Geolocation not available on this device');
      return;
    }
    setResolving('start');
    setRouteError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'My location',
        };
        setStartPt(pt);
        setStartText(pt.label);
        setResolving(null);
      },
      (err) => {
        setRouteError(err.message || 'Could not get your location');
        setResolving(null);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 10_000 },
    );
  }

  // Preview-only: fetch distance/duration/polyline for the current A→B without
  // creating a hunt. Matches example/frontend's /api/route pattern.
  const handlePreviewRoute = useCallback(async () => {
    if (routeStatus !== 'idle') return;
    if (!startPt || !endPt) {
      setRouteError('Pick a start and an end first');
      return;
    }
    setRouteError(null);
    setRouteStatus('previewing');
    try {
      const res = await fetch(
        `/api/grabmaps/route?startLat=${startPt.lat}&startLng=${startPt.lng}&endLat=${endPt.lat}&endLng=${endPt.lng}&profile=${profile}`,
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Route failed (${res.status})`);
      }
      const data = (await res.json()) as {
        distance: number;
        duration: number;
        geometry: GeoJSON.LineString;
      };
      setPreview(data);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Failed to fetch route');
    } finally {
      setRouteStatus('idle');
    }
  }, [routeStatus, startPt, endPt, profile]);

  // Commit — creates the hunt, inserts spots, pushes to /hunt/[id].
  const handleBeginRoute = useCallback(async () => {
    if (routeStatus !== 'idle') return;
    if (!startPt || !endPt) {
      setRouteError('Pick a start and an end first');
      return;
    }
    setRouteError(null);
    setRouteStatus('starting');
    try {
      const res = await startRouteHunt(
        corridorKm,
        { lat: startPt.lat, lng: startPt.lng },
        { lat: endPt.lat, lng: endPt.lng },
        profile,
      );
      if ('error' in res) {
        setRouteError(res.error);
        setRouteStatus('idle');
        return;
      }
      // Stash the route polyline so /hunt/[id] can render it without a schema
      // change. If the user refreshes, the spots still work.
      try {
        sessionStorage.setItem(
          `route:${res.huntId}`,
          JSON.stringify(res.routeGeoJson),
        );
      } catch {
        // private-mode / quota — route just won't render on reload.
      }
      router.push(`/hunt/${res.huntId}`);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Failed to start hunt');
      setRouteStatus('idle');
    }
  }, [corridorKm, endPt, routeStatus, router, startPt]);

  // Invalidate preview when the chosen points, profile, or corridor change.
  useEffect(() => {
    setPreview(null);
  }, [startPt, endPt, profile]);

  // Debounced suggestions: fetch as the user types.
  useEffect(() => {
    const q = startText.trim();
    if (q.length < 2 || startPt?.label === startText) {
      setStartSug([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/grabmaps/suggest?q=${encodeURIComponent(q)}&limit=6`);
        const body = (await res.json()) as { places?: Suggestion[] };
        setStartSug(body.places ?? []);
      } catch {
        setStartSug([]);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [startText, startPt]);

  useEffect(() => {
    const q = endText.trim();
    if (q.length < 2 || endPt?.label === endText) {
      setEndSug([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/grabmaps/suggest?q=${encodeURIComponent(q)}&limit=6`);
        const body = (await res.json()) as { places?: Suggestion[] };
        setEndSug(body.places ?? []);
      } catch {
        setEndSug([]);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [endText, endPt]);

  function chooseStartSuggestion(s: Suggestion) {
    setStartPt({ lat: s.lat, lng: s.lng, label: s.label });
    setStartText(s.label);
    setStartSug([]);
    setFocused(null);
  }
  function chooseEndSuggestion(s: Suggestion) {
    setEndPt({ lat: s.lat, lng: s.lng, label: s.label });
    setEndText(s.label);
    setEndSug([]);
    setFocused(null);
  }

  // Reset preview-fit when mode changes.
  useEffect(() => {
    setError(null);
    setRouteError(null);
  }, [mode]);

  const radiusBusy = status !== 'idle';
  const radiusCta =
    status === 'locating' ? 'Finding you…' : status === 'starting' ? 'Loading 67s…' : 'Begin hunt';

  const routeBusy = routeStatus !== 'idle' || resolving !== null;
  const previewing = routeStatus === 'previewing';
  const beginCta = routeStatus === 'starting' ? 'Loading 67s…' : 'Begin hunt';

  function swapEndpoints() {
    const s = startText;
    const sp = startPt;
    setStartText(endText);
    setStartPt(endPt);
    setEndText(s);
    setEndPt(sp);
    setPreview(null);
  }

  function fmtDistance(m: number) {
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  }
  function fmtDuration(s: number) {
    if (s < 60) return `${Math.round(s)} s`;
    if (s < 3600) return `${Math.round(s / 60)} min`;
    return `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`;
  }

  return (
    <div className="min-h-full px-4 pt-12 pb-8 bg-bg">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-4xl tracking-tight text-text leading-none">
          Pick your hunt
        </h1>
        <p className="mt-2 text-muted font-body text-sm">
          Two modes. Same 67 spots. Pick your vibe.
        </p>

        {/* Mode cards */}
        <div className="mt-6 grid grid-cols-1 gap-3">
          {MODE_CARDS.map((m) => {
            const active = mode === m.id;
            const accentBg = m.accent === 'primary' ? 'bg-primary' : 'bg-accent';
            const accentText = m.accent === 'primary' ? 'text-primary' : 'text-accent';
            const activeBorder =
              m.accent === 'primary' ? 'border-primary' : 'border-accent';
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`text-left relative overflow-hidden rounded-2xl p-4 bg-surface border-2 transition-shadow ${
                  active ? `${activeBorder} shadow-lg` : 'border-border'
                }`}
              >
                <div
                  className="absolute -top-4 -right-2 text-[88px] leading-none opacity-10 pointer-events-none select-none"
                  aria-hidden
                >
                  {m.emoji}
                </div>
                <div className="flex items-start gap-3 relative">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
                      active ? `${accentBg} text-white` : 'bg-surface-alt text-muted'
                    }`}
                  >
                    {m.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-text leading-none">
                        {m.name}
                      </span>
                      {active && (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-bold uppercase tracking-widest text-white ${accentBg}`}
                        >
                          Selected
                        </span>
                      )}
                    </div>
                    <div className={`mt-0.5 text-xs font-bold ${accentText}`}>
                      {m.tagline}
                    </div>
                    <div className="mt-2 text-xs text-muted leading-snug">
                      {m.blurb}
                    </div>
                    <div className="mt-2 text-[10px] text-faint italic">
                      Best for {m.bestFor}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Radius mode body */}
        {mode === 'radius' && (
          <>
            <div className="mt-6 bg-surface border border-border rounded-2xl p-5 shadow-sm">
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
                disabled={radiusBusy}
                className="mt-4 w-full accent-primary h-11"
                aria-label="Hunt radius in kilometres"
              />

              <div className="mt-2 flex justify-between text-[11px] text-faint font-body">
                <span>0.5 km</span>
                <span>3.0 km</span>
              </div>

              <div className="mt-5 text-sm text-muted font-body">
                67 spots within{' '}
                <span className="font-bold text-text">{radius.toFixed(1)} km</span> of
                you
              </div>
            </div>

            <button
              type="button"
              onClick={handleBegin}
              disabled={radiusBusy}
              className="mt-6 w-full min-h-[56px] rounded-2xl bg-primary text-white font-display tracking-wide text-lg shadow-lg hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {radiusCta}
            </button>

            {error && (
              <div className="mt-4 text-center text-sm text-accent font-body">
                {error}
              </div>
            )}
          </>
        )}

        {/* Route mode body — aligned with example/frontend Start/End pattern */}
        {mode === 'route' && (
          <>
            <div className="mt-6 bg-surface border border-border rounded-2xl p-4 shadow-sm space-y-3">
              {/* Start field (label above, input below, suggestions dropdown) */}
              <div className="relative">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="startInput"
                    className="text-[10px] font-bold uppercase tracking-widest text-faint"
                  >
                    Start
                  </label>
                  <button
                    type="button"
                    onClick={useCurrentLocationForStart}
                    disabled={routeBusy}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline disabled:opacity-50"
                  >
                    Use my location
                  </button>
                </div>
                <input
                  id="startInput"
                  type="text"
                  value={startText}
                  onChange={(e) => setStartText(e.target.value)}
                  onFocus={() => setFocused('start')}
                  onBlur={() => {
                    // Delay so a click on a suggestion lands first.
                    setTimeout(() => setFocused((f) => (f === 'start' ? null : f)), 150);
                    if (!startPt || startPt.label !== startText) resolveStart();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (startSug[0]) chooseStartSuggestion(startSug[0]);
                      else resolveStart();
                    }
                  }}
                  placeholder="Marina Bay Sands"
                  disabled={routeBusy}
                  autoComplete="off"
                  className="mt-1 w-full h-11 px-3 rounded-xl bg-surface-alt text-sm font-bold text-text ring-1 ring-transparent focus:ring-2 focus:ring-primary outline-none placeholder:text-faint placeholder:font-normal"
                  aria-autocomplete="list"
                  aria-expanded={focused === 'start' && startSug.length > 0}
                />
                {focused === 'start' && startSug.length > 0 && (
                  <ul
                    role="listbox"
                    className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-auto rounded-xl bg-surface border border-border shadow-lg divide-y divide-border/60"
                  >
                    {startSug.map((s, i) => (
                      <li key={`${s.lat},${s.lng},${i}`}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => chooseStartSuggestion(s)}
                          className="w-full text-left px-3 py-2 hover:bg-surface-alt"
                        >
                          <div className="text-sm font-bold text-text truncate">{s.label}</div>
                          {s.address && (
                            <div className="text-[11px] text-muted truncate">{s.address}</div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* End field */}
              <div className="relative">
                <label
                  htmlFor="endInput"
                  className="text-[10px] font-bold uppercase tracking-widest text-faint"
                >
                  End
                </label>
                <input
                  id="endInput"
                  type="text"
                  value={endText}
                  onChange={(e) => setEndText(e.target.value)}
                  onFocus={() => setFocused('end')}
                  onBlur={() => {
                    setTimeout(() => setFocused((f) => (f === 'end' ? null : f)), 150);
                    if (!endPt || endPt.label !== endText) resolveEnd();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (endSug[0]) chooseEndSuggestion(endSug[0]);
                      else resolveEnd();
                    }
                  }}
                  placeholder="Orchard Road"
                  disabled={routeBusy}
                  autoComplete="off"
                  className="mt-1 w-full h-11 px-3 rounded-xl bg-surface-alt text-sm font-bold text-text ring-1 ring-transparent focus:ring-2 focus:ring-primary outline-none placeholder:text-faint placeholder:font-normal"
                  aria-autocomplete="list"
                  aria-expanded={focused === 'end' && endSug.length > 0}
                />
                {focused === 'end' && endSug.length > 0 && (
                  <ul
                    role="listbox"
                    className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-auto rounded-xl bg-surface border border-border shadow-lg divide-y divide-border/60"
                  >
                    {endSug.map((s, i) => (
                      <li key={`${s.lat},${s.lng},${i}`}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => chooseEndSuggestion(s)}
                          className="w-full text-left px-3 py-2 hover:bg-surface-alt"
                        >
                          <div className="text-sm font-bold text-text truncate">{s.label}</div>
                          {s.address && (
                            <div className="text-[11px] text-muted truncate">{s.address}</div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Travel mode segmented control */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-faint mb-1">
                  Travel mode
                </div>
                <div
                  role="radiogroup"
                  aria-label="Travel mode"
                  className="inline-flex rounded-xl bg-surface-alt p-1"
                >
                  {(
                    [
                      { id: 'driving' as const, label: 'Driving' },
                      { id: 'walking' as const, label: 'Walking' },
                    ]
                  ).map((opt) => {
                    const active = profile === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setProfile(opt.id)}
                        disabled={routeBusy}
                        className={`px-4 h-9 rounded-lg text-xs font-bold uppercase tracking-widest transition ${
                          active
                            ? 'bg-surface text-text shadow-sm'
                            : 'text-muted hover:text-text'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Button row: Swap + Route (matches example button-row) */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={swapEndpoints}
                  disabled={routeBusy}
                  className="flex-1 h-11 rounded-xl bg-surface-alt text-muted font-bold text-xs uppercase tracking-widest hover:bg-border disabled:opacity-50"
                  aria-label="Swap start and end"
                >
                  ↑↓ Swap
                </button>
                <button
                  type="button"
                  onClick={handlePreviewRoute}
                  disabled={routeBusy || !startPt || !endPt}
                  className="flex-[2] h-11 rounded-xl bg-text text-surface font-bold text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-50"
                >
                  {previewing ? 'Routing…' : 'Route'}
                </button>
              </div>
            </div>

            {/* Summary card — shows after Route preview */}
            {preview && (
              <div className="mt-3 bg-surface border border-border rounded-2xl p-4 shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-faint">
                    Distance
                  </div>
                  <div className="font-display text-2xl text-text leading-none mt-1">
                    {fmtDistance(preview.distance)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-faint">
                    Duration
                  </div>
                  <div className="font-display text-2xl text-text leading-none mt-1">
                    {fmtDuration(preview.duration)}
                  </div>
                </div>
                <div className="col-span-2 border-t border-border pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-faint">
                    Start
                  </div>
                  <div className="text-sm font-bold text-text truncate">
                    {startPt?.label ?? '—'}
                  </div>
                </div>
                <div className="col-span-2 -mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-faint">
                    End
                  </div>
                  <div className="text-sm font-bold text-text truncate">
                    {endPt?.label ?? '—'}
                  </div>
                </div>
              </div>
            )}

            {/* Corridor slider (example calls it "Inflation radius") */}
            <div className="mt-3 bg-surface border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-baseline justify-between">
                <div className="text-[11px] font-bold uppercase tracking-wide text-faint">
                  Inflation radius
                </div>
                <div className="font-display text-3xl text-text leading-none">
                  {corridorKm.toFixed(1)}
                  <span className="text-sm font-bold text-muted ml-1">KM</span>
                </div>
              </div>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={corridorKm}
                onChange={(e) => setCorridorKm(Number(e.target.value))}
                disabled={routeBusy}
                className="mt-4 w-full accent-primary h-11"
                aria-label="Inflation radius in kilometres"
              />
              <div className="mt-2 flex justify-between text-[11px] text-faint font-body">
                <span>0.5 km</span>
                <span>3.0 km</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBeginRoute}
              disabled={routeBusy || !startPt || !endPt}
              className="mt-4 w-full min-h-[56px] rounded-2xl bg-primary text-white font-display tracking-wide text-lg shadow-lg hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {beginCta}
            </button>

            {routeError && (
              <div className="mt-4 text-center text-sm text-accent font-body">
                {routeError}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
