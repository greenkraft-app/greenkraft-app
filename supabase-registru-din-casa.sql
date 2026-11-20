-- Bifa „Din casă" pe borderourile din Registru PF (ca la Achiziții și Cheltuieli).
-- Rulează o singură dată în Supabase → SQL Editor.
alter table registru add column if not exists din_casa boolean not null default false;
