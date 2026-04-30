begin;

create table if not exists public.ideb_municipal_data (
  id uuid primary key default gen_random_uuid(),
  ano integer not null,
  municipio text not null default 'Brotas de Macaúbas',
  uf text not null default 'BA',
  etapa text not null check (etapa in ('Anos Iniciais', 'Anos Finais', 'Ensino Médio')),
  ideb numeric(4,2) not null default 0 check (ideb between 0 and 10),
  matematica numeric(4,2) not null default 0 check (matematica between 0 and 10),
  portugues numeric(4,2) not null default 0 check (portugues between 0 and 10),
  fluxo numeric(4,2) not null default 0 check (fluxo between 0 and 1),
  fonte text not null default 'QEdu/INEP',
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(ano, etapa)
);

create table if not exists public.ideb_school_data (
  id uuid primary key default gen_random_uuid(),
  ano integer not null,
  escola text not null,
  etapa text not null check (etapa in ('Anos Iniciais', 'Anos Finais', 'Ensino Médio')),
  aprendizado numeric(4,2) not null default 0 check (aprendizado between 0 and 10),
  fluxo numeric(4,2) not null default 0 check (fluxo between 0 and 1),
  ideb numeric(4,2) not null default 0 check (ideb between 0 and 10),
  posicao integer,
  leitura_tecnica text,
  fonte text not null default 'QEdu/INEP',
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(ano, escola, etapa)
);

create or replace function public.ideb_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ideb_municipal_updated_at on public.ideb_municipal_data;
create trigger trg_ideb_municipal_updated_at
before update on public.ideb_municipal_data
for each row execute function public.ideb_touch_updated_at();

drop trigger if exists trg_ideb_school_updated_at on public.ideb_school_data;
create trigger trg_ideb_school_updated_at
before update on public.ideb_school_data
for each row execute function public.ideb_touch_updated_at();

alter table public.ideb_municipal_data enable row level security;
alter table public.ideb_school_data enable row level security;

drop policy if exists "ideb municipal select published" on public.ideb_municipal_data;
create policy "ideb municipal select published"
on public.ideb_municipal_data
for select
using (publicado = true);

drop policy if exists "ideb school select published" on public.ideb_school_data;
create policy "ideb school select published"
on public.ideb_school_data
for select
using (publicado = true);

drop policy if exists "ideb municipal admin all" on public.ideb_municipal_data;
create policy "ideb municipal admin all"
on public.ideb_municipal_data
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "ideb school admin all" on public.ideb_school_data;
create policy "ideb school admin all"
on public.ideb_school_data
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

grant select on public.ideb_municipal_data to anon, authenticated;
grant select on public.ideb_school_data to anon, authenticated;
grant insert, update, delete on public.ideb_municipal_data to authenticated;
grant insert, update, delete on public.ideb_school_data to authenticated;

insert into public.ideb_municipal_data (
  ano, municipio, uf, etapa, ideb, matematica, portugues, fluxo, fonte, publicado
)
values
  (2023, 'Brotas de Macaúbas', 'BA', 'Anos Iniciais', 5.10, 5.09, 5.15, 1.00, 'QEdu/INEP', true),
  (2023, 'Brotas de Macaúbas', 'BA', 'Anos Finais', 4.80, 5.12, 5.29, 0.92, 'QEdu/INEP', true),
  (2023, 'Brotas de Macaúbas', 'BA', 'Ensino Médio', 3.80, 3.99, 4.26, 0.92, 'QEdu/INEP', true)
on conflict (ano, etapa) do update
set municipio = excluded.municipio,
    uf = excluded.uf,
    ideb = excluded.ideb,
    matematica = excluded.matematica,
    portugues = excluded.portugues,
    fluxo = excluded.fluxo,
    fonte = excluded.fonte,
    publicado = excluded.publicado;

insert into public.ideb_school_data (
  ano, escola, etapa, aprendizado, fluxo, ideb, posicao, leitura_tecnica, fonte, publicado
)
values
  (2023, 'Escola Municipal Dr. Antonio Carlos Magalhães', 'Anos Iniciais', 5.66, 1.00, 5.70, 1, 'Melhor escola com dado disponível em 2023.', 'QEdu/INEP', true),
  (2023, 'Escola Municipal Agostinho Ribeiro', 'Anos Iniciais', 5.17, 0.99, 5.10, 2, 'Desempenho consistente com espaço para reforço em aprendizagem.', 'QEdu/INEP', true),
  (2023, 'Escola Municipal Maria de Meira Lima Costa', 'Anos Iniciais', 5.12, 1.00, 5.10, 3, 'Fluxo elevado e oportunidade de avanço em português e matemática.', 'QEdu/INEP', true)
on conflict (ano, escola, etapa) do update
set aprendizado = excluded.aprendizado,
    fluxo = excluded.fluxo,
    ideb = excluded.ideb,
    posicao = excluded.posicao,
    leitura_tecnica = excluded.leitura_tecnica,
    fonte = excluded.fonte,
    publicado = excluded.publicado;

commit;
