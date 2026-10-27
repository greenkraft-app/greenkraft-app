-- DEEE — etapa 12: dezmembrarea fractiilor compuse in sub-fractii si concasarea (ca "Dezm. Fractii" din WiseWeee).
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Creeaza doar tabele NOI; nu atinge tabelele existente.
--
-- O operatiune ia fractii din stoc (intrari) si da alte fractii (iesiri); totalul intrat trebuie sa fie egal cu totalul iesit.
-- Tipul "Concasare" (materiale pentru agregate reciclate) are in plus: cod CED, tip material, echipamente utilizate, mentiuni.

create table if not exists public.deee_dezm_fr (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nr_operatiune text not null unique,
  data date not null,
  organizatie text not null,
  tip text not null default 'Dezmembrare' check (tip in ('Dezmembrare', 'Concasare')),
  observatii text not null default '',
  cod_ced text not null default '',
  tip_material text not null default '',
  echipamente_utilizate text not null default '',
  mentiuni text not null default '',
  creat_de text
);

create table if not exists public.deee_dezm_fr_intrari (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dezm_id uuid not null references public.deee_dezm_fr(id) on delete cascade,
  ord integer not null default 0,
  fractie text not null,
  cod text not null default '',
  kg numeric not null check (kg > 0)
);
create index if not exists deee_dezm_fr_intrari_idx on public.deee_dezm_fr_intrari (dezm_id);

create table if not exists public.deee_dezm_fr_iesiri (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dezm_id uuid not null references public.deee_dezm_fr(id) on delete cascade,
  ord integer not null default 0,
  fractie text not null,
  cod text not null default '',
  kg numeric not null check (kg > 0)
);
create index if not exists deee_dezm_fr_iesiri_idx on public.deee_dezm_fr_iesiri (dezm_id);

do $$
declare t text;
begin
  foreach t in array array['deee_dezm_fr','deee_dezm_fr_intrari','deee_dezm_fr_iesiri']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "acces_aplicatie" on public.%I', t);
    execute format('create policy "acces_aplicatie" on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;
