// End-of-hunt celebration screen. Reads the hunt row + check-in count
// server-side via the authenticated Supabase client.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Shield67 } from '@/components/ui/Shield67';

type HuntRow = {
  id: string;
  radius_km: number;
  started_at: string;
  ended_at: string | null;
  points: number;
};

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return `${m}m ${s.toString().padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, '0')}m`;
}

export default async function EndPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: huntId } = await params;
  const supabase = await createClient();

  const { data: huntData } = await supabase
    .from('hunts')
    .select('id, radius_km, started_at, ended_at, points')
    .eq('id', huntId)
    .single();
  if (!huntData) notFound();
  const hunt = huntData as HuntRow;

  const { count } = await supabase
    .from('check_ins')
    .select('id', { count: 'exact', head: true })
    .eq('hunt_id', huntId);
  const claimed = count ?? 0;

  const end = hunt.ended_at ? new Date(hunt.ended_at) : new Date();
  const start = new Date(hunt.started_at);
  const duration = formatDuration(end.getTime() - start.getTime());

  return (
    <div className="relative min-h-full overflow-hidden bg-bg">
      {/* green hero ribbon (fades into bg) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-gradient-to-b from-primary via-primary/90 to-bg"
      />

      {/* Soft 67 rain behind content. Time-boxed: static gradient of 12 rotated "67" */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.16]">
        {Array.from({ length: 12 }).map((_, i) => {
          const left = `${(i * 37) % 100}%`;
          const delay = `${(i * 0.25).toFixed(2)}s`;
          const duration = `${4 + (i % 4)}s`;
          const size = `${22 + (i % 5) * 8}px`;
          return (
            <div
              key={i}
              className="absolute -top-12 font-display leading-none tracking-tight text-white select-none"
              style={{
                left,
                fontSize: size,
                animation: `r67-fall-rain ${duration} linear ${delay} infinite`,
              }}
            >
              67
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto flex max-w-md flex-col items-center px-4 pt-12 pb-8 text-center text-white">
        {/* ribbon label */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur">
            W · Hunt complete
          </span>
        </div>

        {/* Shield — centered, scaled up, with pop-in */}
        <div className="mt-6 r67-pop-in">
          <Shield67 size={128} />
        </div>

        <div className="mt-3 text-[11px] font-bold uppercase tracking-widest text-white/75">
          Certified Sigma
        </div>

        <h1 className="mt-3 font-display text-5xl leading-none tracking-tight drop-shadow-md">
          HUNT COMPLETE FR
        </h1>
        <p className="mt-3 text-sm italic text-white/90">
          every 67 in the radius: collected
        </p>

        {/* Big XP number */}
        <div className="mt-8 inline-flex items-baseline gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-white/85">
            +
          </span>
          <span className="font-display text-[96px] leading-none tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
            {hunt.points}
          </span>
          <span className="text-xl font-black uppercase tracking-widest">
            XP
          </span>
        </div>

        {/* Stat row */}
        <div className="mt-8 grid w-full grid-cols-3 rounded-3xl border border-border bg-surface text-text shadow-lg shadow-black/5 overflow-hidden">
          <div className="py-4 px-2">
            <div className="font-display text-4xl leading-none tracking-tight">
              {claimed}
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-faint">
              Spots
            </div>
          </div>
          <div className="border-x border-border py-4 px-2">
            <div className="font-display text-4xl leading-none tracking-tight text-primary">
              {hunt.points}
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-faint">
              Points
            </div>
          </div>
          <div className="py-4 px-2">
            <div className="font-display text-2xl leading-none tracking-tight">
              {duration}
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-faint">
              Time
            </div>
          </div>
        </div>

        {/* Radius card */}
        <div className="mt-3 w-full rounded-3xl border border-border bg-surface p-5 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-faint">
                Hunt radius
              </div>
              <div className="mt-1 font-display text-3xl leading-none tracking-tight text-text">
                {hunt.radius_km}
                <span className="ml-1 text-sm font-bold text-muted">KM</span>
              </div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-primary-dark bg-primary-tint px-3 py-1 rounded-full">
              Locked
            </div>
          </div>
        </div>

        {/* CTAs */}
        <Link
          href="/leaderboard"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary text-white font-display text-lg tracking-tight py-4 shadow-lg shadow-primary/30 hover:bg-primary-dark transition"
        >
          <span className="text-lg" aria-hidden>
            🏆
          </span>
          See the board
        </Link>
        <Link
          href="/hunt/new"
          className="mt-3 flex w-full items-center justify-center rounded-2xl border border-border bg-surface text-text font-display text-base tracking-tight py-3.5 hover:bg-surface-alt transition"
        >
          Hunt again
        </Link>
        <Link
          href="/home"
          className="mt-2 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text py-2"
        >
          ← Back to map
        </Link>
      </div>
    </div>
  );
}
