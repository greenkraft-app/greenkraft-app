-- DEEE — etapa 11: registrele WEEELABEX / EN 50625-1 / GDPR (vizitatori, intretinere, incidente, scurgeri, decontaminare, depoluare,
-- neconformitati, certificate de distrugere a datelor, anexe de transport).
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Un singur tabel pentru toate registrele; campurile fiecarui registru stau in coloana 'date'.

create table if not exists public.deee_registre (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  registru text not null,
  data date not null,
  date jsonb not null default '{}'::jsonb,
  semnatura text,
  semnatura2 text,
  creat_de text
);
create index if not exists deee_registre_reg_idx on public.deee_registre (registru, data);

alter table public.deee_registre enable row level security;
drop policy if exists "acces_aplicatie" on public.deee_registre;
create policy "acces_aplicatie" on public.deee_registre for all using (true) with check (true);
