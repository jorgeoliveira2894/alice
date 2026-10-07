-- LEBLON · Aprovação de conteúdos
-- Correr uma vez no Supabase: SQL Editor > New query > colar > Run.

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_name text not null,
  client_handle text not null default '',
  month text not null,               -- yyyy-mm
  theme text not null default '',
  share_token text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  position int not null default 0,
  kind text not null check (kind in ('post', 'carrossel', 'reel')),
  title text not null default '',
  caption text not null default '',
  date text not null default '',
  time text not null default '',
  media jsonb not null default '[]',
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'alteracoes')),
  feedback text not null default '',
  reviewed_at timestamptz
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  position int not null default 0,
  week int not null default 1,
  day text not null default '',
  title text not null default '',
  frames jsonb not null default '[]',
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'alteracoes')),
  feedback text not null default '',
  reviewed_at timestamptz
);

create index if not exists posts_plan_idx on public.posts (plan_id);
create index if not exists stories_plan_idx on public.stories (plan_id);

-- A agência só vê e edita os seus próprios planos.
alter table public.plans enable row level security;
alter table public.posts enable row level security;
alter table public.stories enable row level security;

drop policy if exists "owner plans" on public.plans;
create policy "owner plans" on public.plans
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "owner posts" on public.posts;
create policy "owner posts" on public.posts
  for all using (exists (select 1 from public.plans p where p.id = plan_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.owner_id = auth.uid()));

drop policy if exists "owner stories" on public.stories;
create policy "owner stories" on public.stories
  for all using (exists (select 1 from public.plans p where p.id = plan_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.owner_id = auth.uid()));

-- O cliente não tem conta: entra só com o link secreto (share_token).
-- Estas duas funções são a única porta de entrada para ele.
create or replace function public.get_plan_by_token(p_token text)
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'plan', json_build_object(
      'id', p.id, 'client_name', p.client_name, 'client_handle', p.client_handle,
      'month', p.month, 'theme', p.theme, 'share_token', p.share_token, 'created_at', p.created_at
    ),
    'posts', coalesce((select json_agg(x order by x.position) from public.posts x where x.plan_id = p.id), '[]'),
    'stories', coalesce((select json_agg(s order by s.position) from public.stories s where s.plan_id = p.id), '[]')
  )
  from public.plans p
  where p.share_token = p_token;
$$;

create or replace function public.review_item(
  p_token text, p_kind text, p_id uuid, p_status text, p_feedback text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan uuid;
begin
  if p_status not in ('pendente', 'aprovado', 'alteracoes') then
    raise exception 'Estado inválido';
  end if;
  select id into v_plan from public.plans where share_token = p_token;
  if v_plan is null then
    raise exception 'Link inválido';
  end if;
  if p_kind = 'post' then
    update public.posts set status = p_status, feedback = left(coalesce(p_feedback, ''), 4000), reviewed_at = now()
      where id = p_id and plan_id = v_plan;
  elsif p_kind = 'story' then
    update public.stories set status = p_status, feedback = left(coalesce(p_feedback, ''), 4000), reviewed_at = now()
      where id = p_id and plan_id = v_plan;
  else
    raise exception 'Tipo inválido';
  end if;
  if not found then
    raise exception 'Conteúdo não encontrado';
  end if;
end;
$$;

grant execute on function public.get_plan_by_token(text) to anon, authenticated;
grant execute on function public.review_item(text, text, uuid, text, text) to anon, authenticated;

-- Ficheiros (imagens e vídeos): bucket público para leitura, só a agência carrega.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "agency uploads" on storage.objects;
create policy "agency uploads" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "agency deletes" on storage.objects;
create policy "agency deletes" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and owner = auth.uid());
