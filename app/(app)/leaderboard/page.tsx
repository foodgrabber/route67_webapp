import { createClient } from '@/lib/supabase/server';
import { Leaderboard } from '@/components/Leaderboard';
import { Shield67 } from '@/components/ui/Shield67';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const [{ data: user }, { data: rows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('leaderboard_v').select('*').limit(50),
  ]);

  return (
    <main className="min-h-screen bg-bg px-4 pt-10 pb-6">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <header className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white shadow-lg shadow-primary/20">
          {/* faint 67 watermark */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-2 font-display text-[120px] leading-none text-white/10 tracking-tight select-none"
          >
            67
          </div>
          <div className="relative">
            <Shield67 size={64} />
          </div>
          <div className="relative">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/75">
              Live leaderboard
            </div>
            <h1 className="font-display text-3xl leading-none tracking-tight">
              Top 50 Hunters
            </h1>
            <p className="mt-1 text-xs text-white/85 font-body">
              Most 67s claimed · updates live
            </p>
          </div>
        </header>

        <Leaderboard
          initialRows={rows ?? []}
          currentUserId={user?.user?.id ?? null}
        />
      </div>
    </main>
  );
}
