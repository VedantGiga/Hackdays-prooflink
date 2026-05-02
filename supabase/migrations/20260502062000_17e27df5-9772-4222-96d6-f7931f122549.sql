
-- Fix function search path
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Drop the broad public SELECT policy on resumes; public bucket already
-- allows direct-URL access to files. We don't want clients to list contents.
drop policy if exists "Resumes are publicly readable" on storage.objects;
