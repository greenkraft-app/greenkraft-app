-- DEEE — etapa 7: organizatia se alege pe fiecare linie (echipament) dintr-un document de achizitie, nu doar pe document.
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Liniile existente primesc organizatia documentului lor, deci stocul ramane identic.

alter table public.deee_achizitii_linii add column if not exists organizatie text;

update public.deee_achizitii_linii l
set organizatie = a.organizatie
from public.deee_achizitii a
where a.id = l.achizitie_id and l.organizatie is null;
