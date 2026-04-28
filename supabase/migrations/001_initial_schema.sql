-- ============================================================
-- TDD Platform — Initial Schema
-- Renewable energy project risk assessment platform
-- ============================================================

-- Enums
create type public.risk_rating as enum ('green', 'blue', 'yellow', 'orange', 'red');
create type public.project_type as enum ('wind', 'solar', 'hydro', 'storage', 'other');
create type public.project_status as enum ('development', 'construction', 'operation');

-- ============================================================
-- profiles: extends auth.users
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  organization text,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- projects: renewable energy assets
-- ============================================================
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        public.project_type not null,
  capacity_mw numeric(10, 3),
  location    text,
  status      public.project_status not null default 'development',
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- ============================================================
-- risk_categories: standard TDD analysis categories (seeded)
-- ============================================================
create table public.risk_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  description   text,
  display_order int not null
);

-- No RLS — categories are public read-only reference data
alter table public.risk_categories enable row level security;

create policy "Risk categories are readable by all authenticated users"
  on public.risk_categories for select
  to authenticated
  using (true);

-- Seed standard TDD categories
insert into public.risk_categories (name, description, display_order) values
  ('Permitting',        'Autorisations administratives et environnementales', 1),
  ('Design',            'Conception technique et ingénierie', 2),
  ('Grid Connection',   'Raccordement au réseau électrique', 3),
  ('CRE / Auction',     'Appel d''offres CRE et contrat de complément de rémunération', 4),
  ('Financial Model',   'Modèle financier et hypothèses économiques', 5),
  ('Yield Assessment',  'Étude de production et ressource', 6),
  ('Additional Docs',   'Documents complémentaires et due diligence', 7);

-- ============================================================
-- risk_assessments: per project per category
-- ============================================================
create table public.risk_assessments (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  category_id uuid not null references public.risk_categories(id),
  rating      public.risk_rating not null default 'yellow',
  summary     text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,
  unique (project_id, category_id)
);

alter table public.risk_assessments enable row level security;

create policy "Users can manage assessments for their projects"
  on public.risk_assessments for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = risk_assessments.project_id
        and projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- risk_items: granular risk points within a category
-- ============================================================
create table public.risk_items (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.risk_assessments(id) on delete cascade,
  title         text not null,
  description   text,
  rating        public.risk_rating not null default 'yellow',
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

alter table public.risk_items enable row level security;

create policy "Users can manage risk items for their projects"
  on public.risk_items for all
  using (
    exists (
      select 1
      from public.risk_assessments ra
      join public.projects p on p.id = ra.project_id
      where ra.id = risk_items.assessment_id
        and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger set_risk_assessments_updated_at
  before update on public.risk_assessments
  for each row execute function public.set_updated_at();

create trigger set_risk_items_updated_at
  before update on public.risk_items
  for each row execute function public.set_updated_at();
