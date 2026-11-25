-- Sectiunea AUTO: vehicule si documentele lor (RCA, rovinieta, ITP, CASCO, licenta transport etc.), cu data expirarii.
-- Ruleaza o singura data in Supabase -> SQL Editor (e sigur si daca il rulezi din nou: nu sterge si nu dubleaza nimic).
-- Creeaza doar tabele NOI; nu atinge tabelele existente.

create table if not exists public.auto_vehicule (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nr text not null default '',          -- numar de inmatriculare
  marca text not null default '',       -- marca / model
  tip text not null default '',         -- Camion, Autoutilitara, Autoturism, Remorca, Utilaj
  vin text not null default '',         -- serie sasiu
  an text not null default '',          -- an fabricatie
  sofer text not null default '',
  detalii text not null default '',
  activ boolean not null default true
);

create table if not exists public.auto_documente (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nr_masina text not null default '',
  tip text not null default 'RCA',      -- RCA, Rovinieta, ITP, CASCO, Licenta transport, Copie conforma, Tahograf, Asigurare CMR, Altul
  nr_doc text not null default '',      -- seria / numarul politei, al rovinietei etc.
  emitent text not null default '',     -- asigurator / statie ITP / emitent
  data_start text not null default '',  -- format ZZ.LL.AAAA, ca in restul aplicatiei
  data_exp text not null default '',
  valoare text not null default '',
  achitat text not null default '',     -- Da / Nu
  detalii text not null default ''
);

do $$
declare t text;
begin
  foreach t in array array['auto_vehicule', 'auto_documente'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "acces_aplicatie" on public.%I', t);
    execute format('create policy "acces_aplicatie" on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;
