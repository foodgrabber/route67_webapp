'use server';

// Server actions for the friends feature.
// - sendFriendRequest / acceptFriendRequest go through SECURITY DEFINER RPCs.
// - removeFriend deletes the symmetric (user_a < user_b) row directly via RLS.
// - getFriendState returns categorized accepted / incoming / outgoing lists.

import { createClient } from '@/lib/supabase/server';

export type FriendProfile = {
  id: string;
  username: string | null;
  avatar_emoji: string | null;
  total_points: number;
  total_checkins: number;
};

export type FriendState = {
  accepted: FriendProfile[];
  incoming: FriendProfile[];
  outgoing: FriendProfile[];
};

type ActionResult = { ok: true } | { error: string };

function normalizeError(message: unknown): string {
  if (typeof message === 'string' && message.length > 0) return message;
  if (message instanceof Error && message.message) return message.message;
  return 'Something went wrong';
}

export async function sendFriendRequest(username: string): Promise<ActionResult> {
  const trimmed = username.trim();
  if (!trimmed) return { error: 'Enter a username' };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('friend_request', {
    p_target_username: trimmed,
  });

  if (error) return { error: normalizeError(error.message) };

  // RPC returns jsonb { ok, target_id, pair }. Defensive: treat missing ok as error.
  if (data && typeof data === 'object' && 'ok' in data && (data as { ok: boolean }).ok === true) {
    return { ok: true };
  }
  return { error: 'Failed to send request' };
}

export async function acceptFriendRequest(otherId: string): Promise<ActionResult> {
  if (!otherId) return { error: 'Missing user id' };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('friend_accept', {
    p_other: otherId,
  });

  if (error) return { error: normalizeError(error.message) };

  if (data && typeof data === 'object' && 'ok' in data && (data as { ok: boolean }).ok === true) {
    return { ok: true };
  }
  return { error: 'Failed to accept request' };
}

export async function removeFriend(otherId: string): Promise<ActionResult> {
  if (!otherId) return { error: 'Missing user id' };

  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) return { error: 'Not authenticated' };
  const me = userRes.user.id;

  // Canonical ordering: user_a < user_b (string UUID compare matches the DB check constraint).
  const [userA, userB] = me < otherId ? [me, otherId] : [otherId, me];

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('user_a', userA)
    .eq('user_b', userB);

  if (error) return { error: normalizeError(error.message) };
  return { ok: true };
}

type FriendshipRow = {
  user_a: string;
  user_b: string;
  accepted: boolean;
  requested_by: string;
};

export async function getFriendState(): Promise<FriendState | { error: string }> {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) return { error: 'Not authenticated' };
  const me = userRes.user.id;

  // Two-query approach: fetch friendship rows, then fetch profiles in a single
  // `in` query. Supabase's PostgREST foreign-key join on friendships would need
  // two separate relationships (user_a/user_b both point to auth.users, not
  // profiles) so the join+hint dance is messier than just joining in app code.
  const { data: rows, error: rowsErr } = await supabase
    .from('friendships')
    .select('user_a, user_b, accepted, requested_by')
    .or(`user_a.eq.${me},user_b.eq.${me}`);

  if (rowsErr) return { error: normalizeError(rowsErr.message) };

  const friendshipRows = (rows ?? []) as FriendshipRow[];
  if (friendshipRows.length === 0) {
    return { accepted: [], incoming: [], outgoing: [] };
  }

  const otherIds = Array.from(
    new Set(
      friendshipRows.map((r) => (r.user_a === me ? r.user_b : r.user_a)),
    ),
  );

  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('id, username, avatar_emoji, total_points, total_checkins')
    .in('id', otherIds);

  if (profilesErr) return { error: normalizeError(profilesErr.message) };

  const byId = new Map<string, FriendProfile>();
  for (const p of (profiles ?? []) as FriendProfile[]) {
    byId.set(p.id, p);
  }

  const accepted: FriendProfile[] = [];
  const incoming: FriendProfile[] = [];
  const outgoing: FriendProfile[] = [];

  for (const r of friendshipRows) {
    const otherId = r.user_a === me ? r.user_b : r.user_a;
    const profile = byId.get(otherId);
    if (!profile) continue; // profile missing — skip defensively
    if (r.accepted) {
      accepted.push(profile);
    } else if (r.requested_by === me) {
      outgoing.push(profile);
    } else {
      incoming.push(profile);
    }
  }

  const byPoints = (a: FriendProfile, b: FriendProfile) => b.total_points - a.total_points;
  const byUsername = (a: FriendProfile, b: FriendProfile) =>
    (a.username ?? '').localeCompare(b.username ?? '');

  accepted.sort(byPoints);
  incoming.sort(byUsername);
  outgoing.sort(byUsername);

  return { accepted, incoming, outgoing };
}
