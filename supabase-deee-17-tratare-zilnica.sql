-- DEEE — etapa 17: monitorizarea zilnica a marfii tratate (bazin de marfa netratata, PV zilnic de tratare, fractii rezultate).
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Trebuie rulat dupa etapa 14 (fisiere atasate).
--
-- Fluxul: se introduce zilnic cate kg au intrat la tratare (deee_tr_intrari); la sfarsit de program responsabilul completeaza PV-ul zilei
-- (deee_tr_pv): ce s-a tratat (deee_tr_pv_marfa) si ce fractii au rezultat (deee_tr_pv_fractii). Ce ramane netratat ramane in bazin.

create table if not exists public.deee_tr_intrari (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  data date not null,
  kg numeric not null check (kg > 0),
  echipament text not null default '',      -- gol = marfa amestecata
  nr_tichet text not null default '',       -- tichetul de cantar, doar ca informatie
  observatii text not null default '',
  creat_de text
);
create index if not exists deee_tr_intrari_data_idx on public.deee_tr_intrari (data);

create table if not exists public.deee_tr_pv (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  data date not null,
  nr_pv text not null default '',
  tratat_de text not null default '',       -- cine a tratat (nume, separate prin virgula); mai tarziu se leaga de lista de angajati
  ora_inceput text not null default '',
  ora_sfarsit text not null default '',
  observatii text not null default '',
  creat_de text
);
create index if not exists deee_tr_pv_data_idx on public.deee_tr_pv (data);

create table if not exists public.deee_tr_pv_marfa (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  pv_id uuid not null references public.deee_tr_pv(id) on delete cascade,
  ord integer not null default 0,
  echipament text not null default '',      -- gol = marfa amestecata
  kg numeric not null check (kg > 0),
  buc integer not null default 0 check (buc >= 0)
);
create index if not exists deee_tr_pv_marfa_idx on public.deee_tr_pv_marfa (pv_id);

create table if not exists public.deee_tr_pv_fractii (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  pv_id uuid not null references public.deee_tr_pv(id) on delete cascade,
  ord integer not null default 0,
  fractie text not null,
  cod text not null default '',
  kg numeric not null check (kg > 0)
);
create index if not exists deee_tr_pv_fractii_idx on public.deee_tr_pv_fractii (pv_id);

do $$
declare t text;
begin
  foreach t in array array['deee_tr_intrari','deee_tr_pv','deee_tr_pv_marfa','deee_tr_pv_fractii']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "acces_aplicatie" on public.%I', t);
    execute format('create policy "acces_aplicatie" on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;

-- Poza / PDF-ul PV-ului semnat se ataseaza ca fisier al PV-ului (aceeasi stocare ca la achizitii si vanzari).
alter table public.deee_fisiere add column if not exists tratare_id uuid references public.deee_tr_pv(id) on delete cascade;
do $$
declare c text;
begin
  -- doar verificarea "o singura sursa" (cea care pomeneste achizitie_id); verificarea pentru categorie ramane
  for c in select conname from pg_constraint where conrelid = 'public.deee_fisiere'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%achizitie_id%' loop
    execute format('alter table public.deee_fisiere drop constraint %I', c);
  end loop;
  alter table public.deee_fisiere add constraint deee_fisiere_o_sursa
    check ((achizitie_id is not null)::int + (vanzare_id is not null)::int + (tratare_id is not null)::int = 1);
end $$;
create index if not exists deee_fisiere_trat_idx on public.deee_fisiere (tratare_id);
