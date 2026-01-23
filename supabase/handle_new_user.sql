-- Supabase SQL: handle_new_user
-- Usage: run in Supabase SQL editor. Creates a trigger that inserts a profile/record
-- based on the role present in NEW.raw_user_meta_data->>'role'.

-- Function: handle_new_user()
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  role_text text := coalesce(NEW.raw_user_meta_data->>'role', 'candidat');
  full_name text := NEW.raw_user_meta_data->>'full_name';
begin
  -- If a central profiles table exists, prefer inserting there
  if to_regclass('public.profiles') is not null then
    insert into public.profiles (id, email, full_name, role, created_at)
    values (NEW.id, NEW.email, coalesce(full_name, NEW.email), role_text, now())
    on conflict (id) do nothing;
    return new;
  end if;

  -- Otherwise insert into role-specific tables
  if role_text = 'candidat' then
    -- candidats table uses uuid id in your schema
    insert into public.candidats (id, nom_complet, updated_at)
    values (NEW.id, coalesce(full_name, NEW.email), now())
    on conflict (id) do nothing;
  elsif role_text = 'entreprise' then
    insert into public.entreprises (id, nom_societe, updated_at)
    values (NEW.id, coalesce(full_name, NEW.email), now())
    on conflict (id) do nothing;
  elsif role_text = 'admin' then
    -- admins table in your app uses serial integer id; create admin row without forcing id
    insert into public.admins (email, full_name, role, created_at)
    values (NEW.email, coalesce(full_name, NEW.email), 'admin', now())
    on conflict (email) do nothing;
  else
    -- fallback: create candidat
    insert into public.candidats (id, nom_complet, updated_at)
    values (NEW.id, coalesce(full_name, NEW.email), now())
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

-- Trigger on auth.users to call the function after insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Example Row Level Security (RLS) policies
-- 1) Profiles: admins can select all, users can select their own
alter table if exists public.profiles enable row level security;

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid() and p2.role = 'admin'
    )
  );

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select using (auth.uid() = id::text OR auth.uid() = id);

-- 2) Jobs: candidates see published jobs; admins see all
alter table if exists public.jobs enable row level security;

drop policy if exists "Candidates view published jobs" on public.jobs;
create policy "Candidates view published jobs"
  on public.jobs
  for select using (
    published = true
    or exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid() and p2.role = 'admin'
    )
  );

-- Notes:
-- - Run this in Supabase SQL Editor. Test by creating accounts via supabase.auth.signUp()
--   with options: { data: { role: 'candidat'|'entreprise'|'admin', full_name: '...' } }
-- - Adjust table/column names if your schema differs.
