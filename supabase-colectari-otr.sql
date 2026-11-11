-- Achizitii: coloana "OTR" (CNREE / RLG) = catre ce OTR se aloca marfa din achizitia respectiva.
-- Marfa alocata iese automat din Stocuri (coloana "Alocat OTR").
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti -> Run. O singura data (e sigur si daca il rulezi din nou).
alter table public.colectari add column if not exists otr text not null default '';
