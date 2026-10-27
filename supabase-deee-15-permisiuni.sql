-- DEEE — etapa 15: permisiuni pe sectiunile DEEE, per utilizator (complet / doar vizualizare / fara acces).
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Fara niciun rand salvat, toti utilizatorii au acces complet (ca pana acum);
-- Administratorul (Alexandru) are mereu acces la tot si poate seta permisiunile din ♻️ DEEE -> 🔑 Permisiuni.

create table if not exists public.deee_permisiuni (
  user_name text primary key,
  updated_at timestamptz not null default now(),
  rol text not null default '',
  sectiuni jsonb not null default '{}'::jsonb,
  modificat_de text
);

alter table public.deee_permisiuni enable row level security;
drop policy if exists "acces_aplicatie" on public.deee_permisiuni;
create policy "acces_aplicatie" on public.deee_permisiuni for all using (true) with check (true);
