-- DEEE — etapa 13: datele companiei ("Compania Mea" din WiseWeee), folosite pe documentele tiparite (NIR, proces-verbal, registre).
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou: nu suprascrie ce ai modificat). Un singur rand (id = 1).

create table if not exists public.deee_companie (
  id integer primary key default 1 check (id = 1),
  updated_at timestamptz not null default now(),
  den text not null default '',
  cui text not null default '',
  email text not null default '',
  telefon text not null default '',
  nr_autorizatie text not null default '',
  nr_reg_com text not null default '',
  adresa text not null default '',
  punct_lucru text not null default '',
  gestionar text not null default ''
);

alter table public.deee_companie enable row level security;
drop policy if exists "acces_aplicatie" on public.deee_companie;
create policy "acces_aplicatie" on public.deee_companie for all using (true) with check (true);

insert into public.deee_companie (id, den, cui, adresa, punct_lucru, gestionar) values
  (1, 'GREEN KRAFT SRL', 'RO36191378', 'Soseaua de centura dreapta 18A, 770110 Afumati',
   'Soseaua de Centura Dreapta nr. 18A, comuna Afumati, jud. Ilfov', 'Alexandru I.')
on conflict (id) do nothing;
