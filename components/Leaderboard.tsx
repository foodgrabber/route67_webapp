'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Row = {
  id: string;
  username: string | null;
  avatar_emoji: string | null;
  points: number;
  checkins: number;
};

type Scope = 'global' | 'friends';
type Window = 'all' | '7d' | '24h';

interface LeaderboardProps {
  initialRows: Row[];
  currentUserId?: string | null;
}

const MAX_ROWS = 50;

function windowSince(w: Window): string | null {
  if (w === 'all') return null;
  if (w === '7d') return new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  return new Date(Date.now() - 86400 * 1000).toISOString();
}

function mergeAndSort(prev: Row[], updated: Row): Row[] {
  const idx = prev.findIndex((r) => r.id === updated.id);
  const next =
    idx >= 0
      ? prev.map((r, i) => (i === idx ? { ...r, ...updated } : r))
      : [...prev, updated];
  next.sort((a, b) => b.points - a.points);
  return next.slice(0, MAX_ROWS);
}

// Accept UPDATEs from the `profiles` table, which uses `total_points` /
// `total_checkins`. Translate into the RPC row shape.
type ProfileUpdate = {
  id: string;
  username: string | null;
  avatar_emoji: string | null;
  total_points: number;
  total_checkins: number;
};

function profileToRow(p: ProfileUpdate): Row {
  return {
    id: p.id,
    username: p.username,
    avatar_emoji: p.avatar_emoji,
    points: p.total_points,
    checkins: p.total_checkins,
  };
}

export function Leaderboard({ initialRows, currentUserId }: LeaderboardProps) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [scope, setScope] = useState<Scope>('global');
  const [window, setWindow] = useState<Window>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [noFriends, setNoFriends] = useState<boolean>(false);
  const fetchIdRef = useRef<number>(0);

  const fetchRows = useCallback(
    async (nextScope: Scope, nextWindow: Window) => {
      const supabase = createClient();
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      const p_since = windowSince(nextWindow);
      const fn =
        nextScope === 'friends' ? 'leaderboard_friends' : 'leaderboard_period';
      const { data, error } = await supabase.rpc(fn, { p_since });
      // Ignore stale responses.
      if (fetchId !== fetchIdRef.current) return;
      if (error) {
        setRows([]);
        setNoFriends(false);
      } else {
        const list = (data ?? []) as Row[];
        setRows(list);
        // Heuristic: if friends scope returns no one (not even me), treat as
        // "no friends yet". The RPC includes me when I have accepted friends,
        // so an empty list most likely means I have no accepted friends.
        setNoFriends(nextScope === 'friends' && list.length === 0);
      }
      setLoading(false);
    },
    [],
  );

  // Refetch whenever scope or window changes (skip the initial All-time +
  // Global state, which is already server-rendered).
  const isInitial = useRef<boolean>(true);
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    void fetchRows(scope, window);
  }, [scope, window, fetchRows]);

  // Realtime: only subscribe when All-time + Global, because denormalized
  // profile UPDATEs only map cleanly to that view.
  useEffect(() => {
    if (scope !== 'global' || window !== 'all') return;
    const supabase = createClient();
    const channel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updated = profileToRow(payload.new as ProfileUpdate);
          setRows((prev) => mergeAndSort(prev, updated));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scope, window]);

  // Tap-the-active-tab refetch for non-realtime views.
  const onScopeClick = (s: Scope) => {
    if (s === scope) {
      void fetchRows(s, window);
    } else {
      setScope(s);
    }
  };
  const onWindowClick = (w: Window) => {
    if (w === window) {
      void fetchRows(scope, w);
    } else {
      setWindow(w);
    }
  };

  const tabs = (
    <div className="flex flex-col gap-2">
      {/* Scope */}
      <div
        role="tablist"
        aria-label="Leaderboard scope"
        className="flex rounded-full bg-surface border border-border p-1 shadow-sm"
      >
        {(
          [
            { k: 'global', label: 'Global' },
            { k: 'friends', label: 'Friends' },
          ] as const
        ).map(({ k, label }) => {
          const active = scope === k;
          return (
            <button
              key={k}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onScopeClick(k)}
              className={[
                'flex-1 rounded-full px-3 py-2 font-body text-sm font-bold transition-colors',
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Window */}
      <div
        role="tablist"
        aria-label="Leaderboard time window"
        className="flex rounded-full bg-surface border border-border p-1 shadow-sm"
      >
        {(
          [
            { k: 'all', label: 'All-time' },
            { k: '7d', label: '7 days' },
            { k: '24h', label: '24 hours' },
          ] as const
        ).map(({ k, label }) => {
          const active = window === k;
          return (
            <button
              key={k}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onWindowClick(k)}
              className={[
                'flex-1 rounded-full px-3 py-2 font-body text-sm font-bold transition-colors',
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Empty states
  if (!loading && scope === 'friends' && noFriends) {
    return (
      <section className="flex flex-col gap-4">
        {tabs}
        <div className="rounded-3xl bg-surface border border-border shadow-sm p-10 text-center">
          <div className="text-4xl mb-3" aria-hidden>
            🤝
          </div>
          <div className="font-display text-xl text-text tracking-tight">
            No friends yet
          </div>
          <div className="mt-1 text-sm text-muted font-body">
            Add friends on the Friends tab to see them here
          </div>
        </div>
      </section>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        {tabs}
        <div className="rounded-3xl bg-surface border border-border shadow-sm p-10 text-center">
          <div className="text-4xl mb-3" aria-hidden>
            🫡
          </div>
          <div className="font-display text-xl text-text tracking-tight">
            No hunters yet in this window
          </div>
          <div className="mt-1 text-sm text-muted font-body">
            Be the first to claim a 67 spot.
          </div>
        </div>
      </section>
    );
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  // podium order visually: 2nd, 1st, 3rd (shorter, tallest, shortest)
  const podium: Array<{
    u: Row | undefined;
    rank: number;
    medal: string;
    heightClass: string;
    big?: boolean;
  }> = [
    { u: top3[1], rank: 2, medal: '🥈', heightClass: 'h-16' },
    { u: top3[0], rank: 1, medal: '🥇', heightClass: 'h-24', big: true },
    { u: top3[2], rank: 3, medal: '🥉', heightClass: 'h-12' },
  ];

  const dim = loading ? 'opacity-60' : '';

  return (
    <section className="flex flex-col gap-4">
      {tabs}

      {/* Top-3 podium */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-surface border border-border shadow-sm p-5 transition-opacity ${dim}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, rgba(0,177,79,0.12) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,176,32,0.14) 0%, transparent 40%)',
          }}
          aria-hidden
        />
        <div className="relative flex items-end justify-center gap-4">
          {podium.map(({ u, rank, medal, heightClass, big }) => {
            if (!u) {
              return (
                <div key={rank} className="flex flex-col items-center gap-2 opacity-30">
                  <div className="text-xl">{medal}</div>
                  <div
                    className={`w-16 rounded-t-2xl bg-surface-alt ${heightClass} flex items-start justify-center pt-1.5 font-display text-lg text-faint tracking-tight`}
                  >
                    {rank}
                  </div>
                </div>
              );
            }
            const you = currentUserId != null && u.id === currentUserId;
            const avatarSize = big ? 'w-14 h-14 text-2xl' : 'w-12 h-12 text-xl';
            const barBg = big
              ? 'bg-gradient-to-b from-primary to-primary-dark text-white'
              : 'bg-surface-alt text-muted';
            const nameClass = 'text-[11px] font-bold text-text max-w-[80px] truncate';
            return (
              <div key={rank} className="flex flex-col items-center gap-1.5">
                <div className="text-xl leading-none" aria-hidden>
                  {medal}
                </div>
                <div
                  className={`flex items-center justify-center rounded-full bg-primary-tint ring-2 ${
                    you ? 'ring-primary' : 'ring-surface'
                  } ${avatarSize}`}
                  aria-hidden
                >
                  {u.avatar_emoji ?? '67'}
                </div>
                <div className={nameClass}>{u.username ?? 'Anonymous'}</div>
                <div className="font-display text-base text-primary-dark leading-none tracking-tight">
                  {u.points.toLocaleString()}
                </div>
                <div
                  className={`w-16 rounded-t-2xl ${heightClass} ${barBg} flex items-start justify-center pt-1.5 font-display text-xl leading-none tracking-tight`}
                >
                  {rank}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Remaining rows */}
      {rest.length > 0 && (
        <ol className={`flex flex-col gap-2 transition-opacity ${dim}`}>
          {rest.map((row, i) => {
            const rank = i + 4;
            const you = currentUserId != null && row.id === currentUserId;
            return (
              <li
                key={row.id}
                className={[
                  'flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors border',
                  you
                    ? 'bg-primary-tint border-primary'
                    : 'bg-surface border-border',
                ].join(' ')}
              >
                <span
                  className="flex-none w-10 text-center font-display text-2xl text-text tabular-nums leading-none tracking-tight"
                  aria-label={`Rank ${rank}`}
                >
                  {rank}
                </span>
                <span
                  className={`flex-none flex items-center justify-center w-11 h-11 rounded-full text-xl ${
                    you ? 'bg-primary/20 ring-2 ring-primary' : 'bg-primary-tint'
                  }`}
                  aria-hidden
                >
                  {row.avatar_emoji ?? '67'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-text truncate leading-tight">
                    {row.username ?? 'Anonymous'}
                    {you && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-primary-dark">
                        you
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-faint">
                    {row.checkins} check-in{row.checkins === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="flex-none font-display text-2xl text-text tabular-nums leading-none tracking-tight">
                  {row.points.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default Leaderboard;
