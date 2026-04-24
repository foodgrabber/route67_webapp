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
    <div className="relative min-h-full bg-bg overflow-hidden">
      {/* green hero ribbon */}
      <div
        className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary via-primary-dark to-bg"
        aria-hidden
      />

      <div className="relative px-4 pt-14 pb-16 max-w-md mx-auto flex flex-col items-center text-center">
        <Shield67 size={88} />
        <div className="mt-5 inline-block px-3 py-1 rounded-full bg-black/25 text-white text-[11px] font-bold tracking-wider uppercase">
          Certified Sigma
        </div>
        <h1 className="mt-3 font-display text-5xl text-white leading-none tracking-tight">
          HUNT COMPLETE
        </h1>
        <p className="mt-2 text-white/85 text-sm italic">
          every 67 in the radius: collected
        </p>

        <div className="mt-6 inline-flex items-baseline gap-1 text-white">
          <span className="text-xs font-bold tracking-wide opacity-80">+</span>
          <span className="font-display text-7xl leading-none tracking-tight drop-shadow">
            {hunt.points}
          </span>
          <span className="text-lg font-bold tracking-wide">XP</span>
        </div>

        <div className="mt-8 w-full bg-surface border border-border rounded-2xl shadow-sm p-5 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="font-display text-3xl text-text leading-none">{claimed}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-faint">
              Spots
            </div>
          </div>
          <div className="border-x border-border">
            <div className="font-display text-3xl text-primary leading-none">
              {hunt.points}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-faint">
              Points
            </div>
          </div>
          <div>
            <div className="font-display text-2xl text-text leading-none">{duration}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-faint">
              Time
            </div>
          </div>
        </div>

        <div className="mt-4 w-full bg-surface border border-border rounded-2xl shadow-sm p-4 text-left">
          <div className="text-[10px] font-bold uppercase tracking-wide text-faint">
            Hunt radius
          </div>
          <div className="mt-1 font-display text-2xl text-text leading-none">
            {hunt.radius_km} km
          </div>
        </div>

        <Link
          href="/"
          className="mt-8 w-full inline-flex items-center justify-center rounded-2xl bg-primary text-white font-display tracking-wide text-lg py-4 shadow-lg hover:bg-primary-dark"
        >
          Back to map
        </Link>
        <Link
          href="/hunt/new"
          className="mt-3 w-full inline-flex items-center justify-center rounded-2xl bg-surface text-text border border-border font-display tracking-wide text-base py-3"
        >
          Hunt again
        </Link>
      </div>
    </div>
  );
}
