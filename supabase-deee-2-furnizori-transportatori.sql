-- DEEE — etapa 2: furnizori/clienti DEEE si transportatori (cu masini si soferi).
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Creeaza doar tabele NOI; nu atinge tabelele existente.

-- Furnizori / clienti DEEE. CUI-ul (sau CNP-ul pentru persoane fizice) identifica firma.
create table if not exists public.deee_furnizori (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  cui text not null unique,
  den text not null,
  tip text not null check (tip in ('COLECTOR','PF','PJ','CLIENT','PARTENER')),
  nr_reg_com text not null default '',
  nr_aut_mediu text not null default '',
  persoana_contact text not null default '',
  telefon text not null default '',
  email text not null default '',
  judet text not null default '',
  localitate text not null default '',
  nr_auto text not null default '',
  adresa text not null default '',
  activ boolean not null default true
);

create table if not exists public.deee_transportatori (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  den text not null unique,
  tip text not null default 'PJ' check (tip in ('PJ','PF')),
  cui text not null default '',
  activ boolean not null default true
);

-- Masinile unui transportator (cu licenta de transport, daca e cazul).
create table if not exists public.deee_masini (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  transportator_id uuid not null references public.deee_transportatori(id) on delete cascade,
  nr_auto text not null,
  fara_licenta boolean not null default false,
  nr_licenta text not null default '',
  data_licenta date,
  data_expirare date,
  unique (transportator_id, nr_auto)
);
create index if not exists deee_masini_transp_idx on public.deee_masini (transportator_id);

-- Soferii fiecarei masini.
create table if not exists public.deee_soferi (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  masina_id uuid not null references public.deee_masini(id) on delete cascade,
  nume text not null,
  unique (masina_id, nume)
);
create index if not exists deee_soferi_masina_idx on public.deee_soferi (masina_id);

do $$
declare t text;
begin
  foreach t in array array['deee_furnizori','deee_transportatori','deee_masini','deee_soferi']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "acces_aplicatie" on public.%I', t);
    execute format('create policy "acces_aplicatie" on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;
