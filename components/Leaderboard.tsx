'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Row = {
  id: string;
  username: string | null;
  avatar_emoji: string | null;
  total_points: number;
  total_checkins: number;
};

interface LeaderboardProps {
  initialRows: Row[];
  currentUserId?: string | null;
}

const MAX_ROWS = 50;

function mergeAndSort(prev: Row[], updated: Row): Row[] {
  const idx = prev.findIndex((r) => r.id === updated.id);
  const next = idx >= 0 ? prev.map((r, i) => (i === idx ? { ...r, ...updated } : r)) : [...prev, updated];
  next.sort((a, b) => b.total_points - a.total_points);
  return next.slice(0, MAX_ROWS);
}

export function Leaderboard({ initialRows, currentUserId }: LeaderboardProps) {
  const [rows, setRows] = useState<Row[]>(initialRows);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updated = payload.new as Row;
          setRows((prev) => mergeAndSort(prev, updated));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (rows.length === 0) {
    return (
      <section className="rounded-3xl bg-surface border border-border shadow-sm p-10 text-center">
        <div className="text-4xl mb-3" aria-hidden>
          🫡
        </div>
        <div className="font-display text-xl text-text tracking-tight">
          No hunters yet
        </div>
        <div className="mt-1 text-sm text-muted font-body">
          Be the first to claim a 67 spot.
        </div>
      </section>
    );
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  // podium order visually: 2nd, 1st, 3rd (shorter, tallest, shortest)
  const podium: Array<{ u: Row | undefined; rank: number; medal: string; heightClass: string; big?: boolean }> = [
    { u: top3[1], rank: 2, medal: '🥈', heightClass: 'h-16' },
    { u: top3[0], rank: 1, medal: '🥇', heightClass: 'h-24', big: true },
    { u: top3[2], rank: 3, medal: '🥉', heightClass: 'h-12' },
  ];

  return (
    <section className="flex flex-col gap-4">
      {/* Top-3 podium */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border shadow-sm p-5">
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
                  <div className={`w-16 rounded-t-2xl bg-surface-alt ${heightClass} flex items-start justify-center pt-1.5 font-display text-lg text-faint tracking-tight`}>
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
                  {u.total_points.toLocaleString()}
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
        <ol className="flex flex-col gap-2">
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
                    {row.total_checkins} check-in{row.total_checkins === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="flex-none font-display text-2xl text-text tabular-nums leading-none tracking-tight">
                  {row.total_points.toLocaleString()}
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
