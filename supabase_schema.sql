-- ============================================================
-- BATTLE ARENA — Complete Supabase Schema
-- Run this entire file in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. TEAMS
create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  tag         text not null,       -- e.g. "NW"
  color       text not null default '#00e5ff',
  total_itrs  int  not null default 0,
  battle_wins int  not null default 0,
  created_at  timestamptz default now()
);

-- 2. PROFILES (one row per user, mirrors auth.users)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  username    text not null,
  color       text not null default '#00e5ff',
  team_id     uuid references teams(id) on delete set null,
  is_admin    boolean not null default false,
  total_itrs  int not null default 0,
  battle_wins int not null default 0,
  created_at  timestamptz default now()
);

-- Auto-create profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. BATTLE SIDES (display info for each side of a battle)
create table if not exists battle_sides (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  tag   text not null,
  color text not null default '#00e5ff'
);

-- 4. BATTLES
create table if not exists battles (
  id                  uuid primary key default gen_random_uuid(),
  battle_type         text not null default 'solo',  -- 'solo' | 'team'
  status              text not null default 'pending', -- 'pending' | 'active' | 'completed'
  challenger_side_id  uuid references battle_sides(id),
  opponent_side_id    uuid references battle_sides(id),
  winner_side         text,        -- 'challenger' | 'opponent'
  wager               text,
  start_date          date,
  created_by          uuid references profiles(id),
  created_at          timestamptz default now()
);

-- 5. BATTLE MEMBERS (who is on which side)
create table if not exists battle_members (
  id         uuid primary key default gen_random_uuid(),
  battle_id  uuid not null references battles(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  side       text not null  -- 'challenger' | 'opponent'
);

-- 6. DAILY SCORES
create table if not exists daily_scores (
  id         uuid primary key default gen_random_uuid(),
  battle_id  uuid not null references battles(id) on delete cascade,
  side       text not null,        -- 'challenger' | 'opponent'
  day_number int  not null,        -- 1–7
  itr_count  int  not null default 0,
  log_date   date not null default current_date,
  logged_by  uuid references profiles(id),
  created_at timestamptz default now(),
  unique (battle_id, side, day_number)   -- one entry per side per day
);

-- ── Helper RPC functions ──────────────────────────────────

create or replace function increment_battle_wins(uid uuid)
returns void language sql security definer as $$
  update profiles set battle_wins = battle_wins + 1 where id = uid;
$$;

create or replace function increment_total_itrs(uid uuid, amount int)
returns void language sql security definer as $$
  update profiles set total_itrs = total_itrs + amount where id = uid;
$$;

-- Also update the team's total_itrs when a member logs ITRs
create or replace function sync_team_itrs()
returns trigger language plpgsql security definer as $$
declare
  v_team_id uuid;
begin
  select team_id into v_team_id from profiles where id = new.logged_by;
  if v_team_id is not null then
    update teams
    set total_itrs = (
      select coalesce(sum(ds.itr_count),0)
      from daily_scores ds
      join battle_members bm on bm.battle_id = ds.battle_id and bm.side = ds.side
      join profiles p on p.id = bm.user_id
      where p.team_id = v_team_id
    )
    where id = v_team_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_score_logged on daily_scores;
create trigger on_score_logged
  after insert on daily_scores
  for each row execute procedure sync_team_itrs();

-- ── Row Level Security ────────────────────────────────────

alter table profiles      enable row level security;
alter table teams         enable row level security;
alter table battles       enable row level security;
alter table battle_sides  enable row level security;
alter table battle_members enable row level security;
alter table daily_scores  enable row level security;

-- Profiles: anyone logged in can read; only owner or admin can update
create policy "Profiles readable by all auth users"
  on profiles for select to authenticated using (true);

create policy "Profiles editable by owner or admin"
  on profiles for update to authenticated
  using (auth.uid() = id or exists (select 1 from profiles where id = auth.uid() and is_admin));

create policy "Profiles insertable by admin"
  on profiles for insert to authenticated
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- Teams: readable by all, writable by admin
create policy "Teams readable by all"     on teams for select to authenticated using (true);
create policy "Teams writable by admin"   on teams for all to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- Battle sides: readable by all, insertable by auth users
create policy "Battle sides readable"     on battle_sides for select to authenticated using (true);
create policy "Battle sides insertable"   on battle_sides for insert to authenticated with check (true);

-- Battles: readable by all, insertable by auth users
create policy "Battles readable by all"   on battles for select to authenticated using (true);
create policy "Battles insertable"        on battles for insert to authenticated with check (true);
create policy "Battles updatable"         on battles for update to authenticated using (true);

-- Battle members: readable by all, insertable by auth users
create policy "Members readable"          on battle_members for select to authenticated using (true);
create policy "Members insertable"        on battle_members for insert to authenticated with check (true);

-- Daily scores: readable by all; only member of that battle side can insert
create policy "Scores readable"           on daily_scores for select to authenticated using (true);
create policy "Scores insertable by member" on daily_scores for insert to authenticated
  with check (
    exists (
      select 1 from battle_members
      where battle_id = daily_scores.battle_id
        and user_id = auth.uid()
        and side = daily_scores.side
    )
  );

-- ── Enable Realtime ───────────────────────────────────────
-- Run in Supabase → Database → Replication → enable for:
-- battles, daily_scores

-- ── Admin: Allow service role to bypass RLS for user creation ──
-- This is automatic for the service role key.
-- Use the service-role key ONLY in your edge function or admin scripts,
-- never expose it in frontend code.
