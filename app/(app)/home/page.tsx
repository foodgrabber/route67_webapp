'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GrabMap } from '@/components/GrabMap';

// Fallback center: NUS (lng, lat)
const FALLBACK_CENTER: [number, number] = [103.7764, 1.2966];

type UserPos = { lat: number; lng: number } | null;

export default function HomePage() {
  const [userPos, setUserPos] = useState<UserPos>(null);
  const [geoDenied, setGeoDenied] = useState(false);

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

      {/* Floating search bar (top) — styled placeholder, not wired */}
      <div className="absolute top-4 left-3 right-3 z-10 flex gap-2">
        <div className="flex-1 h-11 rounded-2xl bg-surface/95 backdrop-blur border border-border shadow-md flex items-center gap-2 px-4">
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
            className="flex-1 bg-transparent border-none outline-none text-sm text-text font-body placeholder:text-muted"
            aria-label="Search 67 spots"
          />
        </div>
      </div>

      {/* Geolocation denied notice */}
      {geoDenied && (
        <div className="absolute top-20 left-3 right-3 z-10 rounded-xl bg-surface/95 backdrop-blur border border-border px-3 py-2 text-xs text-muted shadow-sm">
          Location unavailable — showing Kent Ridge by default.
        </div>
      )}

      {/* Floating "Start a hunt" CTA, centered above bottom nav */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <Link
          href="/hunt/new"
          className="pointer-events-auto inline-flex items-center gap-2 h-14 px-7 rounded-full bg-primary text-white font-display text-base tracking-wide shadow-xl shadow-primary/40 hover:bg-primary-dark transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
          Start a hunt
        </Link>
      </div>
    </div>
  );
}
