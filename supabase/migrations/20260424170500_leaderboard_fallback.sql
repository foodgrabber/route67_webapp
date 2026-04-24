-- Fix leaderboard RPCs so all-time (p_since = null) uses the denormalized
-- profiles.total_points (which includes seeded demo users), while
-- time-windowed calls aggregate live from check_ins.

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
    case
      when p_since is null then p.total_points
      else coalesce(sum(c.points_awarded), 0)::int
    end as points,
    case
      when p_since is null then p.total_checkins
      else count(c.id)::int
    end as checkins
  from public.profiles p
  left join public.check_ins c
    on c.user_id = p.id
    and (p_since is not null and c.created_at >= p_since)
  group by p.id, p.username, p.avatar_emoji, p.total_points, p.total_checkins
  order by points desc nulls last, p.username asc
  limit 100;
$$;

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
    case
      when p_since is null then p.total_points
      else coalesce(sum(c.points_awarded), 0)::int
    end as points,
    case
      when p_since is null then p.total_checkins
      else count(c.id)::int
    end as checkins
  from public.profiles p
  join my_friends f on f.fid = p.id
  left join public.check_ins c
    on c.user_id = p.id
    and (p_since is not null and c.created_at >= p_since)
  group by p.id, p.username, p.avatar_emoji, p.total_points, p.total_checkins
  order by points desc nulls last, p.username asc
  limit 100;
$$;

-- grants are preserved from the earlier create, but re-apply defensively.
grant execute on function public.leaderboard_period(timestamptz) to authenticated, anon;
grant execute on function public.leaderboard_friends(timestamptz) to authenticated;
