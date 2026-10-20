-- DEEE — etapa 4: dezmembrari (operatiuni) si stoc initial / ajustari.
--
-- Rulare: Supabase Dashboard -> SQL Editor -> New query -> lipesti tot fisierul -> Run. O singura data
-- (e sigur si daca il rulezi din nou). Creeaza doar tabele NOI; nu atinge tabelele existente.
--
-- Stocurile NU au tabel propriu: se calculeaza in aplicatie din achizitii (intrari), dezmembrari (scaderi din
-- echipamente, intrari in fractii) si, mai tarziu, vanzari de fractii. "Stoc initial" serveste la pornire
-- (ce aveai deja inainte sa treci pe aplicatie) si la corectii; poate fi si negativ (scadere).

-- O operatiune de dezmembrare = o singura organizatie; echipamentele consumate si fractiile rezultate au acelasi total (balanta).
create table if not exists public.deee_dezmembrari (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nr_operatiune text not null unique,
  data date not null,
  organizatie text not null,
  observatii text not null default '',
  status text not null default 'Finalizat',
  creat_de text
);

create table if not exists public.deee_dezm_echipamente (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dezm_id uuid not null references public.deee_dezmembrari(id) on delete cascade,
  ord integer not null default 0,
  echipament text not null,
  cod_ewc text not null default '',
  kg numeric not null check (kg > 0),
  buc integer not null default 0 check (buc >= 0)
);
create index if not exists deee_dezm_ech_idx on public.deee_dezm_echipamente (dezm_id);

create table if not exists public.deee_dezm_fractii (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dezm_id uuid not null references public.deee_dezmembrari(id) on delete cascade,
  ord integer not null default 0,
  fractie text not null,
  cod text not null default '',
  kg numeric not null check (kg > 0)
);
create index if not exists deee_dezm_fr_idx on public.deee_dezm_fractii (dezm_id);

create table if not exists public.deee_stoc_initial (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tip text not null check (tip in ('echipament','fractie')),
  den text not null,
  cod text not null default '',
  organizatie text not null,
  kg numeric not null check (kg <> 0),
  buc integer not null default 0,
  data date,
  motiv text not null default '',
  creat_de text
);

do $$
declare t text;
begin
  foreach t in array array['deee_dezmembrari','deee_dezm_echipamente','deee_dezm_fractii','deee_stoc_initial']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "acces_aplicatie" on public.%I', t);
    execute format('create policy "acces_aplicatie" on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;
