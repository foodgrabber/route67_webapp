'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GrabMap } from '@/components/GrabMap';
import { Shield67 } from '@/components/ui/Shield67';

// Fallback center: NUS (lng, lat)
const FALLBACK_CENTER: [number, number] = [103.7764, 1.2966];

type UserPos = { lat: number; lng: number } | null;

// Decorative quick-filter chips. Not wired yet — visual only per design.
const FILTERS = ['All', 'Nearby', 'Legendary', 'Rare', 'Common'] as const;

export default function HomePage() {
  const [userPos, setUserPos] = useState<UserPos>(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('All');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('[home] geolocation denied or failed:', err.message);
        setGeoDenied(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const initialCenter: [number, number] = userPos
    ? [userPos.lng, userPos.lat]
    : FALLBACK_CENTER;

  return (
    <div className="relative w-full h-[calc(100vh-5rem)]">
      <GrabMap
        initialCenter={initialCenter}
        userLocation={userPos}
        className="w-full h-full"
      />

      {/* Frosted search bar + shield watermark + layers button */}
      <div className="absolute top-4 left-3 right-3 z-10 flex gap-2">
        <div className="flex-1 h-12 rounded-2xl bg-surface/80 backdrop-blur-md border border-border shadow-[0_4px_16px_-4px_rgba(10,58,31,0.15)] flex items-center gap-3 px-4">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted shrink-0"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="Search 67 spots…"
            className="flex-1 bg-transparent border-none outline-none text-sm text-text font-body placeholder:text-faint"
            aria-label="Search 67 spots"
          />
          {/* Shield watermark on the right */}
          <div className="shrink-0 -mr-1 opacity-90">
            <Shield67 size={28} />
          </div>
        </div>
        <button
          type="button"
          aria-label="Map layers"
          className="w-12 h-12 rounded-2xl bg-surface/80 backdrop-blur-md border border-border shadow-[0_4px_16px_-4px_rgba(10,58,31,0.15)] flex items-center justify-center text-text hover:bg-surface transition"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3l9 5-9 5-9-5 9-5z" />
            <path d="M3 13l9 5 9-5" />
            <path d="M3 18l9 5 9-5" />
          </svg>
        </button>
      </div>

      {/* Quick-filter chip row */}
      <div className="absolute top-[72px] left-0 right-0 z-10 flex gap-2 overflow-x-auto scrollbar-none px-3 pb-1 pt-1 [mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-12px),transparent)]">
        {FILTERS.map((f) => {
          const active = activeFilter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={[
                'shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest transition whitespace-nowrap border',
                active
                  ? 'bg-text text-surface border-text shadow-md'
                  : 'bg-surface/80 backdrop-blur text-text border-border hover:bg-surface',
              ].join(' ')}
              aria-pressed={active}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Geolocation denied notice */}
      {geoDenied && (
        <div className="absolute top-[116px] left-3 right-3 z-10 rounded-2xl bg-surface/95 backdrop-blur border border-border px-3 py-2 text-xs text-muted shadow-sm">
          Location unavailable — showing Kent Ridge by default.
        </div>
      )}

      {/* Pink-halo Hunt FAB at bottom-center */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <Link
          href="/hunt/new"
          className="pointer-events-auto group relative inline-flex items-center gap-3 h-16 pl-4 pr-6 rounded-full bg-accent text-white font-display text-lg leading-none tracking-tight shadow-[0_16px_40px_-6px_rgba(255,61,138,0.55)] ring-4 ring-accent/20 hover:bg-accent-dark transition-colors"
        >
          {/* pulsing halo */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-full bg-accent/30 blur-md opacity-70 group-hover:opacity-90 transition"
          />
          {/* inner shield button */}
          <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/25">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="relative uppercase">Start a hunt</span>
        </Link>
      </div>
    </div>
  );
}
