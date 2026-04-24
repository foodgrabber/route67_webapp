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

function rankMedallion(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
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

  return (
    <section className="rounded-2xl bg-surface border border-border overflow-hidden">
      <header className="px-5 py-4 border-b border-border">
        <h2 className="font-display text-xl text-text">Leaderboard</h2>
      </header>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-muted font-body">
          No hunters yet. Be the first to claim a spot!
        </div>
      ) : (
        <ol className="divide-y divide-border">
          {rows.map((row, i) => {
            const rank = i + 1;
            const isCurrentUser = currentUserId != null && row.id === currentUserId;
            const rowBg = isCurrentUser
              ? 'bg-primary-tint border-l-4 border-primary'
              : 'hover:bg-surface-alt border-l-4 border-transparent';

            return (
              <li
                key={row.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${rowBg}`}
              >
                <span
                  className={`flex-none w-10 text-center font-display ${
                    rank <= 3 ? 'text-xl' : 'text-sm text-muted tabular-nums'
                  }`}
                  aria-label={`Rank ${rank}`}
                >
                  {rankMedallion(rank)}
                </span>
                <span
                  className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-primary-tint text-xl"
                  aria-hidden="true"
                >
                  {row.avatar_emoji ?? '67'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-text truncate">
                    {row.username ?? 'Anonymous'}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs font-bold uppercase tracking-wide text-primary-dark">
                        you
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted font-body">
                    {row.total_checkins} check-in{row.total_checkins === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="flex-none font-display text-lg text-text tabular-nums">
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
