-- DEEE — etapa 10: clasificarea implicita a fractiilor (reciclare / valorificare / eliminare), pentru calculul ratelor R&R.
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou: nu suprascrie ce ai completat deja).
--
-- Pentru fiecare fractie se poate spune ce procent se recicleaza, ce procent se valorifica (altfel decat reciclare) si ce procent
-- se elimina (cele trei insumeaza 100). Se foloseste la ratele R&R pentru fractiile nevandute sau vandute fara procente R/D.
-- Valorile de mai jos sunt orientative, doar pentru fractiile evidente (metale, sticla, plastic, beton, componente electronice,
-- lemn / cauciuc / izolatii, pierderi). Fractiile periculoase (baterii, condensatori, toner, neon, ecrane) raman necompletate:
-- le completezi tu in aplicatie, la ♻️ DEEE -> Rate R&R -> Clasificare implicita.

alter table public.deee_fractii add column if not exists rd_reciclare numeric check (rd_reciclare is null or (rd_reciclare >= 0 and rd_reciclare <= 100));
alter table public.deee_fractii add column if not exists rd_valorificare numeric check (rd_valorificare is null or (rd_valorificare >= 0 and rd_valorificare <= 100));
alter table public.deee_fractii add column if not exists rd_eliminare numeric check (rd_eliminare is null or (rd_eliminare >= 0 and rd_eliminare <= 100));

-- reciclare 100%
update public.deee_fractii set rd_reciclare = 100, rd_valorificare = 0, rd_eliminare = 0
where rd_reciclare is null and rd_valorificare is null and rd_eliminare is null
  and den in ('Fier', 'Inox', 'Aluminiu', 'Cupru', 'Alama / Bronz', 'Alama', 'Plumb', 'Sticla', 'Plastic', 'Plastic si cauciuc', 'Beton',
              'Circuite imprimate', 'Cabluri electrice', 'Componente electronice', 'Surse de alimentare', 'Transformatoare',
              'Motoare electrice', 'HDD, Floppy, unitati optice', 'CD ROM');

-- valorificare 100% (energetica / alte forme)
update public.deee_fractii set rd_reciclare = 0, rd_valorificare = 100, rd_eliminare = 0
where rd_reciclare is null and rd_valorificare is null and rd_eliminare is null
  and den in ('Cauciuc', 'Material izolant', 'Spuma poliutermica', 'Spuma poliuretanica', 'Lemn');

-- eliminare 100%
update public.deee_fractii set rd_reciclare = 0, rd_valorificare = 0, rd_eliminare = 100
where rd_reciclare is null and rd_valorificare is null and rd_eliminare is null
  and (den in ('Pierderi tehnologice', 'Vata de sticla') or cod = '99 99 99');
