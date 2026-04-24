'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  /** Paths that activate this tab (prefix-match). */
  match: string[];
};

function MapPinIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function TargetIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TrophyIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3" />
      <path d="M17 6h3v2a3 3 0 0 1-3 3" />
      <path d="M10 14h4v3h-4z" />
      <path d="M8 20h8" />
      <path d="M12 17v3" />
    </svg>
  );
}

function PeopleIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M15 14.2c.63-.27 1.3-.4 2-.4 2.8 0 5 2.2 5 5" />
    </svg>
  );
}

const TABS: Tab[] = [
  {
    href: '/home',
    label: 'Map',
    match: ['/home'],
    icon: (active) => <MapPinIcon active={active} />,
  },
  {
    href: '/hunt/new',
    label: 'Hunt',
    match: ['/hunt'],
    icon: (active) => <TargetIcon active={active} />,
  },
  {
    href: '/friends',
    label: 'Friends',
    match: ['/friends'],
    icon: (active) => <PeopleIcon active={active} />,
  },
  {
    href: '/leaderboard',
    label: 'Board',
    match: ['/leaderboard'],
    icon: (active) => <TrophyIcon active={active} />,
  },
];

function isActive(pathname: string | null, tab: Tab): boolean {
  if (!pathname) return false;
  return tab.match.some(
    (m) => pathname === m || pathname.startsWith(`${m}/`),
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-20 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 pointer-events-none"
    >
      <ul className="pointer-events-auto mx-auto flex max-w-sm items-stretch justify-between gap-0.5 rounded-full bg-surface/95 px-1.5 py-1.5 shadow-[0_10px_40px_-8px_rgba(10,58,31,0.25)] ring-1 ring-border backdrop-blur-md">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex h-12 items-center justify-center gap-1 rounded-full font-body transition-all px-1',
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-muted hover:text-text',
                ].join(' ')}
              >
                {tab.icon(active)}
                <span
                  className={[
                    'text-[10px] font-bold uppercase tracking-wider leading-none',
                    active ? 'inline' : 'hidden sm:inline',
                  ].join(' ')}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
