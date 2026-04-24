-- Features: social (friendships), onboarding flag, time-scoped leaderboard.

-- ============================================================================
-- 1. Profiles: onboarding completion flag
-- ============================================================================

alter table public.profiles
  add column if not exists onboarded boolean not null default false;

-- ============================================================================
-- 2. Friendships — symmetric relation stored canonically (user_a < user_b).
--    Accepted flag lets requests be pending until the addressee accepts.
--    `requested_by` records who sent the request (so we know who to notify).
-- ============================================================================

create table if not exists public.friendships (
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  accepted boolean not null default false,
  requested_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);

create index if not exists friendships_user_a_idx on public.friendships (user_a);
create index if not exists friendships_user_b_idx on public.friendships (user_b);

alter table public.friendships enable row level security;

-- Read: either participant.
drop policy if exists friendships_read on public.friendships;
create policy friendships_read on public.friendships for select
  using (auth.uid() = user_a or auth.uid() = user_b);

-- Insert is only via the friend_request RPC (SECURITY DEFINER), so no insert policy.
-- Update: either participant can flip `accepted` to true / delete the row.
drop policy if exists friendships_update on public.friendships;
create policy friendships_update on public.friendships for update
  using (auth.uid() = user_a or auth.uid() = user_b)
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists friendships_delete on public.friendships;
create policy friendships_delete on public.friendships for delete
  using (auth.uid() = user_a or auth.uid() = user_b);

-- ============================================================================
-- 3. Friendship RPCs (send / accept / decline)
-- ============================================================================

-- Send a friend request to a user looked up by username.
create or replace function public.friend_request(p_target_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_target uuid;
  v_a uuid;
  v_b uuid;
begin
  if v_me is null then raise exception 'not authenticated'; end if;

  select id into v_target from public.profiles
  where username ilike p_target_username limit 1;
  if v_target is null then raise exception 'user not found'; end if;
  if v_target = v_me then raise exception 'cannot friend yourself'; end if;

  v_a := least(v_me, v_target);
  v_b := greatest(v_me, v_target);

  insert into public.friendships (user_a, user_b, accepted, requested_by)
  values (v_a, v_b, false, v_me)
  on conflict (user_a, user_b) do nothing;

  return jsonb_build_object(
    'ok', true,
    'target_id', v_target,
    'pair', jsonb_build_array(v_a, v_b)
  );
end;
$$;

revoke all on function public.friend_request(text) from public;
grant execute on function public.friend_request(text) to authenticated;

-- Accept a pending friend request identified by the other party's id.
create or replace function public.friend_accept(p_other uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_a uuid := least(v_me, p_other);
  v_b uuid := greatest(v_me, p_other);
  v_count int;
begin
  if v_me is null then raise exception 'not authenticated'; end if;

  update public.friendships
  set accepted = true
  where user_a = v_a and user_b = v_b
    and accepted = false
    and requested_by <> v_me; -- only the addressee can accept

  get diagnostics v_count = row_count;
  if v_count = 0 then raise exception 'no pending request'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.friend_accept(uuid) from public;
grant execute on function public.friend_accept(uuid) to authenticated;

-- ============================================================================
-- 4. Time-scoped leaderboard RPCs.
--    leaderboard_period(since) → global totals, optionally windowed by time.
--    leaderboard_friends(since) → same shape, restricted to me + my friends.
-- ============================================================================

create or replace function public.leaderboard_period(p_since timestamptz default null)
returns table (
  id uuid,
  username text,
  avatar_emoji text,
  points int,
  checkins int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.username,
    p.avatar_emoji,
    coalesce(sum(c.points_awarded), 0)::int as points,
    count(c.id)::int as checkins
  from public.profiles p
  left join public.check_ins c
    on c.user_id = p.id
    and (p_since is null or c.created_at >= p_since)
  group by p.id, p.username, p.avatar_emoji
  order by points desc nulls last, p.username asc
  limit 100;
$$;

revoke all on function public.leaderboard_period(timestamptz) from public;
grant execute on function public.leaderboard_period(timestamptz) to authenticated, anon;

create or replace function public.leaderboard_friends(p_since timestamptz default null)
returns table (
  id uuid,
  username text,
  avatar_emoji text,
  points int,
  checkins int
)
language sql
stable
security definer
set search_path = public
as $$
  with my_friends as (
    select case when user_a = auth.uid() then user_b else user_a end as fid
    from public.friendships
    where (user_a = auth.uid() or user_b = auth.uid())
      and accepted = true
    union
    select auth.uid()
  )
  select
    p.id,
    p.username,
    p.avatar_emoji,
    coalesce(sum(c.points_awarded), 0)::int as points,
    count(c.id)::int as checkins
  from public.profiles p
  join my_friends f on f.fid = p.id
  left join public.check_ins c
    on c.user_id = p.id
    and (p_since is null or c.created_at >= p_since)
  group by p.id, p.username, p.avatar_emoji
  order by points desc nulls last, p.username asc
  limit 100;
$$;

revoke all on function public.leaderboard_friends(timestamptz) from public;
grant execute on function public.leaderboard_friends(timestamptz) to authenticated;
