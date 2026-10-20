-- DEEE — etapa 1: nomenclatoare (organizatii, echipamente, fractii) si retete de dezmembrare.
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou: nu sterge si nu dubleaza nimic).
-- Creeaza doar tabele NOI; nu atinge tabelele existente ale aplicatiei.
--
-- Datele de pornire (organizatii, echipamente, fractii) sunt cele vazute in WiseWeee; le poti edita
-- din aplicatie: tab-ul ♻️ DEEE -> Nomenclatoare.

create table if not exists public.deee_organizatii (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  den text not null unique,
  activ boolean not null default true
);

create table if not exists public.deee_echipamente (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  den text not null unique,
  activ boolean not null default true
);

-- O fractie e identificata prin denumire + cod EWC (ex. "Fier" exista si cu 19 12 02, si cu 16 02 16).
create table if not exists public.deee_fractii (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  den text not null,
  cod text not null default '',
  activ boolean not null default true,
  unique (den, cod)
);

-- Retete: cate o "versiune" pe echipament. La modificare se creeaza versiune noua (cea veche ramane in istoric,
-- cu activ = false), ca dezmembrarile deja facute sa nu se schimbe retroactiv.
create table if not exists public.deee_retete (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  echipament text not null,
  versiune integer not null default 1,
  ref_kg numeric,
  activ boolean not null default true,
  creat_de text,
  unique (echipament, versiune)
);

create table if not exists public.deee_retete_linii (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reteta_id uuid not null references public.deee_retete(id) on delete cascade,
  ord integer not null default 0,
  fractie text not null,
  cod text not null default '',
  procent numeric not null default 0
);
create index if not exists deee_retete_linii_reteta_idx on public.deee_retete_linii (reteta_id);

-- Acces din aplicatie (aceeasi cheie publica ca pentru restul tabelelor).
do $$
declare t text;
begin
  foreach t in array array['deee_organizatii','deee_echipamente','deee_fractii','deee_retete','deee_retete_linii']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "acces_aplicatie" on public.%I', t);
    execute format('create policy "acces_aplicatie" on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;

-- ── Date de pornire ───────────────────────────────────────────────────────────
insert into public.deee_organizatii (den) values
  ('CNREE'), ('ECOPOSITIVE'), ('ECOTIC'), ('ENVIRON'), ('REDPOINT'), ('RLG'), ('NEALOCATE')
on conflict (den) do nothing;

insert into public.deee_echipamente (den) values
  ('Alte echipamente de mari dimensiuni > 50 cm'),
  ('Alte echipamente de mici dimensiuni < 50 cm'),
  ('Aparat sudura Mare'), ('Aparat sudura Mic'), ('APARAT APA'),
  ('Aragaz'), ('Aspirator Mare'),
  ('Cuptor cu microunde'),
  ('Imprimanta / FOTOCOPIATOARE Mica'),
  ('Lampa NEON Mica'),
  ('Masina de spalat'), ('Masina de spalat vase'),
  ('PANOU ELECTRIC Mic'), ('Polizor Mic'),
  ('Server Mare'), ('Tablou Electric Mic'), ('Unitati centrale')
on conflict (den) do nothing;

insert into public.deee_fractii (den, cod) values
  ('Fier', '19 12 02'), ('Inox', '19 12 02'),
  ('Aluminiu', '19 12 03'), ('Alama / Bronz', '19 12 03'), ('Cupru', '19 12 03'),
  ('Plastic', '19 12 04'), ('Material izolant', '19 12 04'), ('Spuma poliuretanica', '19 12 04'), ('Cauciuc', '19 12 04'),
  ('Sticla', '19 12 05'), ('Lemn', '19 12 07'), ('Beton', '19 12 09'), ('Vata de sticla', '19 12 12'),
  ('Alte baterii (Li-ion)', '16 02 05'),
  ('Condensatori non PCB', '16 02 15*'),
  ('Fier', '16 02 16'), ('Beton', '16 02 16'), ('Plastic', '16 02 16'),
  ('Cabluri electrice', '16 02 16'), ('Circuite imprimate', '16 02 16'), ('Condensatori non PCB', '16 02 16'),
  ('Componente electronice', '16 02 16'), ('Surse de alimentare', '16 02 16'),
  ('Transformatoare', '16 02 16'), ('Motoare electrice', '16 02 16'),
  ('HDD, Floppy, unitati optice', '16 02 16')
on conflict (den, cod) do nothing;
