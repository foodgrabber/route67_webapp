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
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <header className="flex items-center gap-4">
          <Shield67 size={56} />
          <div>
            <h1 className="font-display text-2xl text-text">FoodGrabber</h1>
            <p className="font-body text-sm text-muted">Top 50 Hunters — Live</p>
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
