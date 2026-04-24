'use server';

// Server actions for the first-time onboarding wizard.
// - checkUsernameAvailable: case-insensitive uniqueness probe (excluding the
//   caller's own profile, so a signed-in user re-entering their current handle
//   doesn't get a false "taken").
// - completeOnboarding: validates server-side, persists username + avatar
//   emoji, and flips `onboarded = true`. Once set the app layout stops
//   redirecting to /onboarding.

import { createClient } from '@/lib/supabase/server';

export type OnboardingResult = { ok: true } | { error: string };
export type UsernameCheck =
  | { available: true }
  | { available: false; reason: string };

// 3-20 chars, letters/digits/underscores only. Mirrors the client regex so
// we never get into a state where the client says "valid" but the server
// rejects.
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

function normalizeError(message: unknown): string {
  if (typeof message === 'string' && message.length > 0) return message;
  if (message instanceof Error && message.message) return message.message;
  return 'Something went wrong';
}

function validateUsername(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (trimmed.length < 3) return { ok: false, error: 'Username must be at least 3 characters' };
  if (trimmed.length > 20) return { ok: false, error: 'Username must be 20 characters or fewer' };
  if (!USERNAME_RE.test(trimmed)) {
    return { ok: false, error: 'Use letters, numbers, and underscores only' };
  }
  return { ok: true, value: trimmed };
}

function validateEmoji(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: false, error: 'Pick an avatar' };
  // Cheap sanity bound — emoji glyphs can be multi-codepoint but shouldn't
  // blow past a handful of chars. 16 is generous for ZWJ sequences.
  if (trimmed.length > 16) return { ok: false, error: 'Avatar too long' };
  return { ok: true, value: trimmed };
}

export async function checkUsernameAvailable(username: string): Promise<UsernameCheck> {
  const validation = validateUsername(username);
  if (!validation.ok) return { available: false, reason: validation.error };

  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  const me = userRes.user?.id ?? null;

  let query = supabase
    .from('profiles')
    .select('id')
    .ilike('username', validation.value)
    .limit(1);

  if (me) query = query.neq('id', me);

  const { data, error } = await query.maybeSingle();
  if (error) return { available: false, reason: normalizeError(error.message) };
  if (data) return { available: false, reason: 'Taken, try another' };
  return { available: true };
}

export async function completeOnboarding(
  username: string,
  emoji: string,
): Promise<OnboardingResult> {
  const nameCheck = validateUsername(username);
  if (!nameCheck.ok) return { error: nameCheck.error };
  const emojiCheck = validateEmoji(emoji);
  if (!emojiCheck.ok) return { error: emojiCheck.error };

  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) return { error: 'Not authenticated' };
  const me = userRes.user.id;

  // Re-check uniqueness server-side, even if the client already did. Race:
  // two people finishing onboarding with the same handle within the probe
  // window. This is still a TOCTOU window (the write below could collide on
  // the unique index), but we surface the friendlier error first.
  const { data: existing, error: checkErr } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', nameCheck.value)
    .neq('id', me)
    .maybeSingle();
  if (checkErr) return { error: normalizeError(checkErr.message) };
  if (existing) return { error: 'Taken, try another' };

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      username: nameCheck.value,
      avatar_emoji: emojiCheck.value,
      onboarded: true,
    })
    .eq('id', me);

  if (updateErr) {
    // Postgres unique-violation on username surfaces as 23505.
    const msg = updateErr.message ?? '';
    if (msg.includes('profiles_username_key') || msg.includes('duplicate key')) {
      return { error: 'Taken, try another' };
    }
    return { error: normalizeError(msg) };
  }

  return { ok: true };
}
