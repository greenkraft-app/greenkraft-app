-- DEEE — etapa 9: pretul fractiilor vandute (pret pe kg si valoare), ca in WiseWeee.
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Vanzarile existente raman neschimbate (pret si valoare goale).

alter table public.deee_vanzari add column if not exists pret_kg numeric check (pret_kg is null or pret_kg >= 0);
alter table public.deee_vanzari add column if not exists valoare numeric check (valoare is null or valoare >= 0);
