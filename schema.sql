-- ============================================================
-- Repens4R Pro — Schema Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- Profiles (criado automaticamente via trigger no signup)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  role text default 'Consultor',
  organization_name text default 'Minha Consultoria',
  organization_color text default '#1f8a55',
  plan text default 'Gratuito',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "profiles_select" on profiles for select using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Empresas
create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  cnpj text,
  segment text,
  size text default 'MEI',
  responsible text,
  email text,
  created_at timestamptz default now()
);

alter table empresas enable row level security;
create policy "empresas_all" on empresas using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Diagnósticos
create table if not exists diagnosticos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  empresa_id uuid references empresas on delete cascade not null,
  answers jsonb not null default '{}',
  scores jsonb not null default '{}',
  overall_score integer not null default 0,
  maturity text not null default 'Básico',
  note text,
  ai_analysis text,
  created_at timestamptz default now()
);

alter table diagnosticos enable row level security;
create policy "diagnosticos_all" on diagnosticos using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tarefas
create table if not exists tarefas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  diagnostico_id uuid references diagnosticos on delete cascade not null,
  empresa_id uuid references empresas on delete cascade not null,
  key text not null,
  area text not null,
  title text not null,
  description text not null,
  priority text not null default 'Média',
  impact text not null default 'Médio',
  difficulty text not null default 'Média',
  done boolean default false,
  created_at timestamptz default now()
);

alter table tarefas enable row level security;
create policy "tarefas_all" on tarefas using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger: cria profile automático no signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'Consultor')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
