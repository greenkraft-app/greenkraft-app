-- DEEE — etapa 5: vanzari de fractii (din stocul de fractii rezultat din dezmembrari).
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Creeaza doar un tabel NOU; nu atinge tabelele existente.
--
-- Cate un rand pe fractie vanduta (un aviz cu mai multe fractii = mai multe randuri cu acelasi aviz).
-- Procentele de reciclare / valorificare / eliminare si codul R/D se completeaza per grup (client + cod + fractie)
-- din aplicatie si se salveaza pe randurile grupului.

create table if not exists public.deee_vanzari (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  data date not null,
  client text not null,
  client_cui text not null default '',
  nr_aviz text not null default '',
  fractie text not null,
  cod text not null default '',
  organizatie text not null,
  kg numeric not null check (kg > 0),
  observatii text not null default '',
  proc_reciclare numeric check (proc_reciclare is null or (proc_reciclare >= 0 and proc_reciclare <= 100)),
  proc_valorificare numeric check (proc_valorificare is null or (proc_valorificare >= 0 and proc_valorificare <= 100)),
  proc_eliminare numeric check (proc_eliminare is null or (proc_eliminare >= 0 and proc_eliminare <= 100)),
  cod_rd text not null default '',
  creat_de text
);
create index if not exists deee_vanzari_data_idx on public.deee_vanzari (data);
create index if not exists deee_vanzari_client_idx on public.deee_vanzari (client);

alter table public.deee_vanzari enable row level security;
drop policy if exists "acces_aplicatie" on public.deee_vanzari;
create policy "acces_aplicatie" on public.deee_vanzari for all using (true) with check (true);
