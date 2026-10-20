-- DEEE — etapa 3: achizitii (documente de colectare) cu echipamentele primite.
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Creeaza doar tabele NOI; nu atinge tabelele existente.

-- Un document de colectare = un furnizor, un aviz, UN cod EWC (HG 856) si greutatea totala primita.
create table if not exists public.deee_achizitii (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  data_colectare date not null,
  furnizor text not null,
  furnizor_cui text not null default '',
  nr_document text not null,
  tip_anexa text not null default 'Anexa 3',
  nr_anexa text not null default '',
  data_anexa date,
  organizatie text not null default 'NEALOCATE',
  nr_ticket text not null default '',
  data_ticket date,
  nr_siatd text not null default '',
  cod_hg856 text not null,
  greutate numeric not null check (greutate > 0),
  fara_licenta boolean not null default false,
  transportator text not null default '',
  nr_auto text not null default '',
  sofer text not null default '',
  observatii text not null default '',
  verificat boolean not null default false,
  tichet_id text,                 -- id-ul tichetului de cantar din Greenkraft, daca documentul vine dintr-unul
  creat_de text,
  unique (furnizor, nr_document, cod_hg856)
);
create index if not exists deee_achizitii_data_idx on public.deee_achizitii (data_colectare);
create index if not exists deee_achizitii_tichet_idx on public.deee_achizitii (tichet_id);

-- Distributia greutatii pe echipamente (cu bucati). Suma kg a liniilor trebuie sa fie egala cu greutatea documentului
-- (se verifica in aplicatie).
create table if not exists public.deee_achizitii_linii (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  achizitie_id uuid not null references public.deee_achizitii(id) on delete cascade,
  ord integer not null default 0,
  echipament text not null,
  buc integer not null default 0 check (buc >= 0),
  kg numeric not null check (kg > 0)
);
create index if not exists deee_achizitii_linii_ach_idx on public.deee_achizitii_linii (achizitie_id);

do $$
declare t text;
begin
  foreach t in array array['deee_achizitii','deee_achizitii_linii']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "acces_aplicatie" on public.%I', t);
    execute format('create policy "acces_aplicatie" on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;
