-- Istoricul (audit_log) devine "doar adaugare": nimeni — nici din aplicatie, nici direct prin API —
-- nu mai poate modifica sau sterge un rand deja scris si nici goli tabela. Modificarile lui Catalin si Mihai
-- (si ale oricui) raman permanent.
--
-- Rulare: Supabase Dashboard -> SQL Editor -> lipesti tot fisierul -> Run. Se ruleaza o singura data (e sigur
-- si daca il rulezi din nou). Nu sterge si nu schimba randurile existente.
--
-- Nota: dupa activare, ca sa stergi vreodata randuri din audit_log (de ex. la o curatare voita) trebuie mai intai
-- sa elimini triggerele de mai jos, din acelasi SQL Editor:
--   drop trigger audit_log_fara_modificare on public.audit_log;
--   drop trigger audit_log_fara_golire on public.audit_log;

create or replace function public.audit_log_doar_adaugare()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log este doar pentru adaugare: randurile nu se pot modifica sau sterge';
end;
$$;

drop trigger if exists audit_log_fara_modificare on public.audit_log;
create trigger audit_log_fara_modificare
  before update or delete on public.audit_log
  for each row execute function public.audit_log_doar_adaugare();

drop trigger if exists audit_log_fara_golire on public.audit_log;
create trigger audit_log_fara_golire
  before truncate on public.audit_log
  for each statement execute function public.audit_log_doar_adaugare();
