-- FoodGrabber initial schema
-- Tables, view, trigger, RLS policies, check-in RPC, and realtime publication.

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- profiles: 1:1 with auth.users; cascaded on auth.users delete
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_emoji text default '67',
  total_points int not null default 0,
  total_checkins int not null default 0,
  created_at timestamptz not null default now()
);

-- hunts: one row per hunt session a user starts
create table public.hunts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  radius_km numeric(3,1) not null,
  origin_lat double precision not null,
  origin_lng double precision not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  points int not null default 0,
  distance_m int not null default 0
);

-- spots: the 67 candidate spots surfaced for a hunt
create table public.spots (
  id uuid primary key default gen_random_uuid(),
  hunt_id uuid not null references public.hunts(id) on delete cascade,
  grab_place_id text,
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  rarity text not null check (rarity in ('common','rare','legendary')),
  points int not null,
  claimed boolean not null default false
);

-- check_ins: immutable log of successful claims (writes via RPC only)
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  hunt_id uuid not null references public.hunts(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  points_awarded int not null,
  created_at timestamptz not null default now(),
  unique (hunt_id, spot_id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index hunts_user_started_idx on public.hunts (user_id, started_at desc);
create index spots_hunt_idx on public.spots (hunt_id);

-- -----------------------------------------------------------------------------
-- View: leaderboard (top 100 by total_points)
-- -----------------------------------------------------------------------------

create view public.leaderboard_v as
  select id, username, avatar_emoji, total_points, total_checkins
  from public.profiles
  order by total_points desc
  limit 100;

-- -----------------------------------------------------------------------------
-- Profile auto-creation trigger
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.hunts enable row level security;
alter table public.spots enable row level security;
alter table public.check_ins enable row level security;

-- profiles: world-readable (leaderboard), self-updatable
create policy profiles_select_all on public.profiles
  for select using (true);

create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id);

-- hunts: owner-only for all operations
create policy hunts_owner_all on public.hunts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- spots: readable + insertable only by the owner of the parent hunt
create policy spots_select_owner on public.spots
  for select using (
    exists (
      select 1 from public.hunts h
      where h.id = hunt_id and h.user_id = auth.uid()
    )
  );

create policy spots_insert_owner on public.spots
  for insert with check (
    exists (
      select 1 from public.hunts h
      where h.id = hunt_id and h.user_id = auth.uid()
    )
  );

-- check_ins: self-readable only; no write policies (RPC is the only writer)
create policy check_ins_select_self on public.check_ins
  for select using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- RPC: check_in_spot — validates proximity, claims the spot, awards points
-- -----------------------------------------------------------------------------

create or replace function public.check_in_spot(
  p_hunt_id uuid, p_spot_id uuid, p_user_lat double precision, p_user_lng double precision
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_spot record;
  v_hunt record;
  v_dist_m double precision;
  v_new_total int;
begin
  if v_user_id is null then raise exception 'not authenticated'; end if;

  select * into v_hunt from public.hunts where id = p_hunt_id and user_id = v_user_id;
  if not found then raise exception 'hunt not found'; end if;
  if v_hunt.ended_at is not null then raise exception 'hunt already ended'; end if;

  select * into v_spot from public.spots where id = p_spot_id and hunt_id = p_hunt_id;
  if not found then raise exception 'spot not in this hunt'; end if;
  if v_spot.claimed then raise exception 'already claimed'; end if;

  v_dist_m := 2 * 6371000 * asin(sqrt(
    power(sin(radians(v_spot.lat - p_user_lat)/2), 2) +
    cos(radians(p_user_lat)) * cos(radians(v_spot.lat)) *
    power(sin(radians(v_spot.lng - p_user_lng)/2), 2)
  ));

  if v_dist_m > 50 then
    raise exception 'too far (% m away)', round(v_dist_m)::int;
  end if;

  update public.spots set claimed = true where id = p_spot_id;

  insert into public.check_ins (hunt_id, spot_id, user_id, points_awarded)
  values (p_hunt_id, p_spot_id, v_user_id, v_spot.points);

  update public.hunts set points = points + v_spot.points where id = p_hunt_id;
  update public.profiles
    set total_points = total_points + v_spot.points,
        total_checkins = total_checkins + 1
    where id = v_user_id
    returning total_points into v_new_total;

  return jsonb_build_object(
    'ok', true, 'spot_id', p_spot_id,
    'points_awarded', v_spot.points,
    'total_points', v_new_total,
    'distance_m', round(v_dist_m)::int
  );
end $$;

revoke all on function public.check_in_spot(uuid, uuid, double precision, double precision) from public;
grant execute on function public.check_in_spot(uuid, uuid, double precision, double precision) to authenticated;

-- -----------------------------------------------------------------------------
-- Realtime publication
-- -----------------------------------------------------------------------------

alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.check_ins;
