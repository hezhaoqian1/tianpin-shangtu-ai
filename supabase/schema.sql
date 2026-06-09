-- 甜拼商图 AI initial Supabase schema.
-- Auth users are owned by Supabase Auth; business tables reference auth.users(id).

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  default_platform text not null default 'xianyu',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  scenario text not null check (scenario in ('xianyu', 'xiaohongshu', 'shop_main', 'wechat')),
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready', 'exported', 'failed')),
  product_type text,
  product_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('upload', 'cutout', 'background', 'export')),
  storage_path text not null,
  width integer,
  height integer,
  mime_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.product_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  model text not null,
  analysis jsonb not null,
  confidence numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.publish_packs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  platform text not null,
  style text not null,
  status text not null default 'ready',
  copy jsonb not null default '{}'::jsonb,
  score jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.canvases (
  id uuid primary key default gen_random_uuid(),
  publish_pack_id uuid not null references public.publish_packs(id) on delete cascade,
  asset_type text not null check (asset_type in ('cover', 'detail', 'flaw_callout', 'spec', 'lifestyle')),
  width integer not null,
  height integer not null,
  background jsonb not null,
  layers jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.edit_commands (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  publish_pack_id uuid not null references public.publish_packs(id) on delete cascade,
  user_message text not null,
  command jsonb not null,
  model text not null,
  status text not null default 'applied' check (status in ('applied', 'rejected', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  task_type text not null check (task_type in ('vision', 'copy', 'layout', 'edit', 'image_edit')),
  provider text not null check (provider in ('openai', 'xai', 'photoroom', 'fal', 'mock')),
  model text not null,
  input_tokens integer,
  output_tokens integer,
  cost_estimate numeric,
  latency_ms integer,
  status text not null,
  error_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.style_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  platform text not null,
  preset jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  free_runs_used integer not null default 0,
  paid_runs_used integer not null default 0,
  image_runs_used integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, period_start)
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.media_assets enable row level security;
alter table public.product_analyses enable row level security;
alter table public.publish_packs enable row level security;
alter table public.canvases enable row level security;
alter table public.edit_commands enable row level security;
alter table public.ai_runs enable row level security;
alter table public.style_presets enable row level security;
alter table public.usage_credits enable row level security;

create policy "profiles are owned by user" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects are owned by user" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "media assets are owned by user" on public.media_assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "style presets are owned by user" on public.style_presets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "usage credits are owned by user" on public.usage_credits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Child tables are reachable through owned projects/packs.
create policy "product analyses follow project owner" on public.product_analyses
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = product_analyses.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "publish packs follow project owner" on public.publish_packs
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = publish_packs.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "canvases follow publish pack owner" on public.canvases
  for all using (
    exists (
      select 1
      from public.publish_packs
      join public.projects on projects.id = publish_packs.project_id
      where publish_packs.id = canvases.publish_pack_id
        and projects.user_id = auth.uid()
    )
  );

create policy "edit commands follow project owner" on public.edit_commands
  for all using (
    exists (
      select 1 from public.projects
      where projects.id = edit_commands.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "ai runs are visible to owner" on public.ai_runs
  for select using (auth.uid() = user_id);

