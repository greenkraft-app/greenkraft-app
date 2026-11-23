-- Vânzări: coloanele „Aparține" (cui aparține livrarea) și „Suma achitată" (total sau parțial).
-- Rulează o singură dată în Supabase → SQL Editor.
alter table livrari add column if not exists apartine text not null default '';
alter table livrari add column if not exists suma_achitata text not null default '';
