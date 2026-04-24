import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/OnboardingWizard';

// First-time onboarding wizard.
// Lives OUTSIDE the (app) route group on purpose so the BottomNav and the
// "redirect unonboarded users to /onboarding" guard don't apply here.
export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded, username, avatar_emoji')
    .eq('id', user.id)
    .single();

  // Repeat visits after completion should go straight to the map.
  if (profile?.onboarded) redirect('/home');

  return (
    <OnboardingWizard
      initialUsername={profile?.username ?? ''}
      initialEmoji={profile?.avatar_emoji ?? '🏎️'}
    />
  );
}
