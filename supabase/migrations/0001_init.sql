-- ============================================================================
-- Pia · initial schema
-- Tables: households, household_members, children, weights, entries, messages,
--         recommendations, stocks, push_subscriptions, scheduled_reminders
-- All household-scoped tables enforce RLS via membership in `household_members`.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- Extensions
-- ──────────────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ──────────────────────────────────────────────────────────────────────────
-- Helper: are we a member of this household?
-- Used in every RLS policy to avoid duplication.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.is_household_member(h uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists(
    select 1 from public.household_members
    where household_id = h and user_id = auth.uid()
  );
end;
$$;

-- ──────────────────────────────────────────────────────────────────────────
-- households
-- ──────────────────────────────────────────────────────────────────────────
create table public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  created_at  timestamptz not null default now()
);

alter table public.households enable row level security;

create policy "members select households"
  on public.households for select
  using (public.is_household_member(id));

create policy "anyone may create a household"
  on public.households for insert
  with check (auth.uid() is not null);

create policy "members update household"
  on public.households for update
  using (public.is_household_member(id))
  with check (public.is_household_member(id));

-- ──────────────────────────────────────────────────────────────────────────
-- household_members
-- ──────────────────────────────────────────────────────────────────────────
create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  initial      char(1) not null,
  color        text not null check (color ~* '^#[0-9a-f]{6}$'),
  display_name text,
  created_at   timestamptz not null default now(),
  primary key (household_id, user_id)
);

alter table public.household_members enable row level security;

-- A user can always see their own row (bootstrap), and rows of households
-- they're already a member of.
create policy "see own membership rows"
  on public.household_members for select
  using (user_id = auth.uid() or public.is_household_member(household_id));

create policy "insert self into household"
  on public.household_members for insert
  with check (user_id = auth.uid());

create policy "members delete co-members"
  on public.household_members for delete
  using (public.is_household_member(household_id));

-- ──────────────────────────────────────────────────────────────────────────
-- children
-- ──────────────────────────────────────────────────────────────────────────
create table public.children (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name         text not null,
  birth_date   date,
  due_date     date,
  weight_kg    numeric(4,2),
  created_at   timestamptz not null default now(),
  check (birth_date is not null or due_date is not null)
);

create index children_household on public.children (household_id);

alter table public.children enable row level security;

create policy "members crud children"
  on public.children for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- ──────────────────────────────────────────────────────────────────────────
-- weights (history for P10–P90 growth chart)
-- ──────────────────────────────────────────────────────────────────────────
create table public.weights (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children(id) on delete cascade,
  measured_at timestamptz not null,
  weight_kg   numeric(4,2) not null check (weight_kg > 0),
  source      text  -- 'pédiatre', 'home', 'pmi'
);

create index weights_child on public.weights (child_id, measured_at desc);

alter table public.weights enable row level security;

create policy "members crud weights via child"
  on public.weights for all
  using (
    exists (
      select 1 from public.children c
      where c.id = weights.child_id and public.is_household_member(c.household_id)
    )
  )
  with check (
    exists (
      select 1 from public.children c
      where c.id = weights.child_id and public.is_household_member(c.household_id)
    )
  );

-- ──────────────────────────────────────────────────────────────────────────
-- entries (the polymorphic corpus)
-- ──────────────────────────────────────────────────────────────────────────
create type public.entry_type as enum (
  'rdv','course','biberon','change','sieste','medic',
  'admin','jalon','lecture','note','symptome'
);

create type public.entry_status as enum ('open','done','snoozed','ignored');
create type public.entry_source as enum ('vocal','text','photo');

create table public.entries (
  id                uuid primary key default gen_random_uuid(),
  household_id      uuid not null references public.households(id) on delete cascade,
  child_id          uuid references public.children(id) on delete set null,
  type              public.entry_type not null,
  payload           jsonb not null,
  who               uuid references auth.users(id),
  assigned_to       uuid references auth.users(id),
  source            public.entry_source not null,
  confidence        numeric(3,2) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  linked_to         uuid[] not null default '{}',
  recommendation_id text,  -- FK added after recommendations table is created
  status            public.entry_status not null default 'open',
  due_at            timestamptz,
  done_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- The recommendations table is created below — defer FK validation until then.
-- We'll re-add the FK after both tables exist.

create index entries_household_created on public.entries (household_id, created_at desc);
create index entries_household_type    on public.entries (household_id, type, due_at);
create index entries_household_status  on public.entries (household_id, status);

alter table public.entries enable row level security;

create policy "members crud entries"
  on public.entries for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

create trigger entries_touch_updated_at
  before update on public.entries
  for each row execute function public.touch_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- messages (raw chat — both user and Pia)
-- ──────────────────────────────────────────────────────────────────────────
create table public.messages (
  id                  uuid primary key default gen_random_uuid(),
  household_id        uuid not null references public.households(id) on delete cascade,
  user_id             uuid references auth.users(id),
  role                text not null check (role in ('user','assistant')),
  text                text,
  audio_path          text,
  audio_duration_ms   int,
  entries_created     uuid[] not null default '{}',
  created_at          timestamptz not null default now()
);

create index messages_household_created on public.messages (household_id, created_at desc);

alter table public.messages enable row level security;

create policy "members crud messages"
  on public.messages for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- ──────────────────────────────────────────────────────────────────────────
-- recommendations (public RAG corpus, seeded manually)
-- ──────────────────────────────────────────────────────────────────────────
create table public.recommendations (
  id          text primary key,
  text        text not null,
  type        text not null check (type in ('official','heuristic')),
  org         text,
  title       text,
  year        int,
  url         text,
  excerpt     text check (char_length(excerpt) <= 400),
  applies_to  jsonb,
  category    text not null
);

alter table public.recommendations enable row level security;

-- Anyone authenticated may read the corpus.
create policy "anyone reads recommendations"
  on public.recommendations for select
  to authenticated
  using (true);

-- Add the deferred FK from entries.recommendation_id now that the table exists.
alter table public.entries
  add constraint entries_recommendation_id_fkey
  foreign key (recommendation_id) references public.recommendations(id);

-- ──────────────────────────────────────────────────────────────────────────
-- stocks
-- ──────────────────────────────────────────────────────────────────────────
create table public.stocks (
  id                  uuid primary key default gen_random_uuid(),
  household_id        uuid not null references public.households(id) on delete cascade,
  item                text not null,
  unit                text not null,
  current_qty         numeric not null,
  daily_consumption   numeric,
  reorder_url         text,
  reorder_price       numeric(6,2),
  updated_at          timestamptz not null default now()
);

create index stocks_household on public.stocks (household_id);

alter table public.stocks enable row level security;

create policy "members crud stocks"
  on public.stocks for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- ──────────────────────────────────────────────────────────────────────────
-- push_subscriptions (one per device per user)
-- ──────────────────────────────────────────────────────────────────────────
create table public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index push_user on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "user crud own push subs"
  on public.push_subscriptions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────────────────
-- scheduled_reminders (post-naissance projections from Pia)
-- ──────────────────────────────────────────────────────────────────────────
create table public.scheduled_reminders (
  id                uuid primary key default gen_random_uuid(),
  household_id      uuid not null references public.households(id) on delete cascade,
  child_id          uuid references public.children(id) on delete cascade,
  fire_at           timestamptz not null,
  kind              text not null,    -- 'admin','vaccin','visite','reorder'…
  text              text not null,
  recommendation_id text references public.recommendations(id),
  fired             boolean not null default false,
  created_at        timestamptz not null default now()
);

create index reminders_fire on public.scheduled_reminders (fire_at) where fired = false;

alter table public.scheduled_reminders enable row level security;

create policy "members crud reminders"
  on public.scheduled_reminders for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- ──────────────────────────────────────────────────────────────────────────
-- Realtime publication — entries + messages are streamed to co-parents.
-- ──────────────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.entries;
alter publication supabase_realtime add table public.messages;
