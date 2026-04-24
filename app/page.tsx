import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Signed-in but not onboarded → wizard. Missing profile row (trigger lag)
  // is treated as not-onboarded.
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded')
    .eq('id', user.id)
    .single();

  if (!profile || profile.onboarded !== true) {
    redirect('/onboarding');
  }
  redirect('/home');
}
