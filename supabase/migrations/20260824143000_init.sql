-- Haruda Method: one chart per signed-in user, with themes, actions, logs, and week notes.
-- Apply in the SQL editor if the CLI is not linked:
-- https://supabase.com/dashboard/project/xljzmxexjzfqqewcjeoj/sql/new
--
-- Google OAuth is configured in Authentication → Providers → Google
-- (Client ID + secret from .env). In Google Cloud, add this authorized redirect:
-- https://xljzmxexjzfqqewcjeoj.supabase.co/auth/v1/callback

create table public.charts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  id text not null,
  goal text not null,
  why text,
  deadline date,
  created_at date not null default (timezone('utc', now()))::date,
  updated_at timestamptz not null default now()
);

create table public.themes (
  id text primary key,
  user_id uuid not null references public.charts (user_id) on delete cascade,
  position smallint not null check (position between 1 and 8),
  title text not null,
  unique (user_id, position)
);

create table public.actions (
  id text primary key,
  user_id uuid not null references public.charts (user_id) on delete cascade,
  theme_id text not null references public.themes (id) on delete cascade,
  title text not null,
  target smallint not null check (target between 1 and 14),
  sort_order smallint not null default 0
);

create table public.logs (
  id text primary key,
  user_id uuid not null references public.charts (user_id) on delete cascade,
  action_id text not null references public.actions (id) on delete cascade,
  date date not null,
  note text
);

create table public.week_notes (
  user_id uuid not null references public.charts (user_id) on delete cascade,
  week_key date not null,
  note text not null default '',
  primary key (user_id, week_key)
);

create index logs_user_date_idx on public.logs (user_id, date);
create index logs_action_idx on public.logs (action_id);
create index actions_user_idx on public.actions (user_id, sort_order);
create index themes_user_idx on public.themes (user_id, position);

alter table public.charts enable row level security;
alter table public.themes enable row level security;
alter table public.actions enable row level security;
alter table public.logs enable row level security;
alter table public.week_notes enable row level security;

create policy "charts_own" on public.charts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "themes_own" on public.themes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "actions_own" on public.actions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "logs_own" on public.logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "week_notes_own" on public.week_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.save_chart(payload jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  theme_row jsonb;
  action_row jsonb;
  log_row jsonb;
  note_key text;
  sort_i int := 0;
begin
  if uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  insert into public.charts as c (user_id, id, goal, why, deadline, created_at)
  values (
    uid,
    payload->>'id',
    payload->>'goal',
    nullif(payload->>'why', ''),
    nullif(payload->>'deadline', '')::date,
    coalesce(nullif(payload->>'createdAt', '')::date, current_date)
  )
  on conflict (user_id) do update
    set id = excluded.id,
        goal = excluded.goal,
        why = excluded.why,
        deadline = excluded.deadline,
        updated_at = now();

  delete from public.themes where user_id = uid;
  delete from public.week_notes where user_id = uid;

  for theme_row in
    select value from jsonb_array_elements(coalesce(payload->'themes', '[]'::jsonb))
  loop
    insert into public.themes (id, user_id, position, title)
    values (
      theme_row->>'id',
      uid,
      (theme_row->>'position')::smallint,
      theme_row->>'title'
    );
  end loop;

  for action_row in
    select value from jsonb_array_elements(coalesce(payload->'actions', '[]'::jsonb))
  loop
    insert into public.actions (id, user_id, theme_id, title, target, sort_order)
    values (
      action_row->>'id',
      uid,
      action_row->>'themeId',
      action_row->>'title',
      (action_row->>'target')::smallint,
      sort_i
    );
    sort_i := sort_i + 1;
  end loop;

  for log_row in
    select value from jsonb_array_elements(coalesce(payload->'logs', '[]'::jsonb))
  loop
    insert into public.logs (id, user_id, action_id, date, note)
    values (
      log_row->>'id',
      uid,
      log_row->>'actionId',
      (log_row->>'date')::date,
      nullif(log_row->>'note', '')
    );
  end loop;

  for note_key in
    select jsonb_object_keys(coalesce(payload->'weekNotes', '{}'::jsonb))
  loop
    insert into public.week_notes (user_id, week_key, note)
    values (uid, note_key::date, coalesce(payload->'weekNotes'->>note_key, ''));
  end loop;
end;
$$;

create or replace function public.load_chart()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result jsonb;
begin
  if uid is null then
    return null;
  end if;

  select jsonb_build_object(
    'id', c.id,
    'goal', c.goal,
    'why', c.why,
    'deadline', c.deadline,
    'createdAt', c.created_at,
    'themes', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'position', t.position,
          'title', t.title
        )
        order by t.position
      )
      from public.themes t
      where t.user_id = uid
    ), '[]'::jsonb),
    'actions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'themeId', a.theme_id,
          'title', a.title,
          'target', a.target
        )
        order by a.sort_order
      )
      from public.actions a
      where a.user_id = uid
    ), '[]'::jsonb),
    'logs', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', l.id,
          'actionId', l.action_id,
          'date', l.date,
          'note', l.note
        )
      )
      from public.logs l
      where l.user_id = uid
    ), '[]'::jsonb),
    'weekNotes', coalesce((
      select jsonb_object_agg(wn.week_key::text, wn.note)
      from public.week_notes wn
      where wn.user_id = uid
    ), '{}'::jsonb)
  )
  into result
  from public.charts c
  where c.user_id = uid;

  return result;
end;
$$;

create or replace function public.delete_chart()
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  delete from public.charts where user_id = auth.uid();
end;
$$;

grant select, insert, update, delete on table
  public.charts,
  public.themes,
  public.actions,
  public.logs,
  public.week_notes
to authenticated;

grant execute on function public.save_chart(jsonb) to authenticated;
grant execute on function public.load_chart() to authenticated;
grant execute on function public.delete_chart() to authenticated;
