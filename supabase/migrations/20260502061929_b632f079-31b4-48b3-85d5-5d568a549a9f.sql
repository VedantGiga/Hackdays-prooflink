
-- Profiles table
create table public.prooflink_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  headline text,
  github_handle text,
  leetcode_handle text,
  resume_path text,
  generated_data jsonb,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prooflink_profiles_username_idx on public.prooflink_profiles (username);

alter table public.prooflink_profiles enable row level security;

-- Public read
create policy "Profiles are publicly viewable"
  on public.prooflink_profiles for select
  using (true);

-- Owner write
create policy "Users can insert their own profile"
  on public.prooflink_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.prooflink_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.prooflink_profiles for delete
  to authenticated
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger prooflink_profiles_updated_at
  before update on public.prooflink_profiles
  for each row execute function public.set_updated_at();

-- Storage bucket for resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Storage RLS: each user folder = their uid
create policy "Resumes are publicly readable"
  on storage.objects for select
  using (bucket_id = 'resumes');

create policy "Users can upload their own resume"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own resume"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own resume"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
