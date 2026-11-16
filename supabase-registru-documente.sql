-- Registru documente (fostul „Contracte"): contracte, adeverințe și alte documente, cu numerotare separată pe tip.
-- Rulează o singură dată în Supabase → SQL Editor. Rândurile existente rămân „Contract".
alter table contracte add column if not exists tip text not null default 'Contract';
