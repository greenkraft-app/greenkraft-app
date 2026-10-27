-- DEEE — etapa 14: fisiere atasate (poze si documente) la achizitii si la vanzari de fractii.
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Creeaza un bucket PRIVAT de stocare ("deee-fisiere"; fisierele se deschid doar prin
-- linkuri temporare generate de aplicatie) si un tabel cu lista fisierelor.
-- Limita pe fisier: 15 MB. Tipuri acceptate: imagini, PDF, Word, Excel, text.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deee-fisiere', 'deee-fisiere', false, 15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv']
)
on conflict (id) do nothing;

-- Acces din aplicatie la fisierele din acest bucket (aceeasi cheie publica ca pentru restul tabelelor).
drop policy if exists "deee_fisiere_acces" on storage.objects;
create policy "deee_fisiere_acces" on storage.objects for all
  using (bucket_id = 'deee-fisiere') with check (bucket_id = 'deee-fisiere');

-- Lista fisierelor: fiecare apartine unei achizitii SAU unei vanzari; la stergerea documentului dispare si inregistrarea
-- (fisierul din stocare il sterge aplicatia inainte de stergerea documentului).
create table if not exists public.deee_fisiere (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  achizitie_id uuid references public.deee_achizitii(id) on delete cascade,
  vanzare_id uuid references public.deee_vanzari(id) on delete cascade,
  nume text not null,
  cale text not null unique,
  mime text not null default '',
  marime integer not null default 0,
  categorie text not null default 'document' check (categorie in ('poza', 'document')),
  creat_de text,
  check ((achizitie_id is not null)::int + (vanzare_id is not null)::int = 1)
);
create index if not exists deee_fisiere_ach_idx on public.deee_fisiere (achizitie_id);
create index if not exists deee_fisiere_van_idx on public.deee_fisiere (vanzare_id);

alter table public.deee_fisiere enable row level security;
drop policy if exists "acces_aplicatie" on public.deee_fisiere;
create policy "acces_aplicatie" on public.deee_fisiere for all using (true) with check (true);
