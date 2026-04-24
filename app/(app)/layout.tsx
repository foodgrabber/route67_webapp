import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/BottomNav';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // First-time users haven't set a username yet and shouldn't see the map
  // shell. Redirect to the wizard at /onboarding (which lives outside this
  // route group, so this guard doesn't loop). If the profile row hasn't been
  // auto-created yet (handle_new_user trigger lag), treat that as not-onboarded
  // too — the wizard page will create the profile row via the trigger on read.
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded')
    .eq('id', user.id)
    .single();

  if (!profile || profile.onboarded !== true) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <main className="flex-1 pb-20 relative">{children}</main>
      <BottomNav />
    </div>
  );
}
