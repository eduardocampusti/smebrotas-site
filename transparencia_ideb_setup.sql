begin;

create table if not exists public.transparencia_ideb_municipal (
  id uuid primary key default gen_random_uuid(),
  ano integer not null,
  municipio text default 'Brotas de Macaúbas',
  uf text default 'BA',
  etapa text not null,
  ideb numeric,
  meta_projetada numeric,
  matematica numeric,
  portugues numeric,
  proficiencia_media numeric,
  taxa_aprovacao numeric,
  fluxo numeric,
  fonte text,
  observacao text,
  publicado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.transparencia_ideb_escolas (
  id uuid primary key default gen_random_uuid(),
  ano integer not null,
  escola text not null,
  etapa text not null,
  posicao integer,
  aprendizado numeric,
  fluxo numeric,
  ideb numeric,
  leitura_tecnica text,
  fonte text,
  publicado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.transparencia_ideb_indicadores (
  id uuid primary key default gen_random_uuid(),
  ano integer,
  grupo text not null,
  indicador text not null,
  etapa text,
  valor numeric,
  unidade text,
  fonte text,
  publicado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.transparencia_ideb_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_transparencia_ideb_municipal_updated_at on public.transparencia_ideb_municipal;
create trigger trg_transparencia_ideb_municipal_updated_at
before update on public.transparencia_ideb_municipal
for each row execute function public.transparencia_ideb_touch_updated_at();

drop trigger if exists trg_transparencia_ideb_escolas_updated_at on public.transparencia_ideb_escolas;
create trigger trg_transparencia_ideb_escolas_updated_at
before update on public.transparencia_ideb_escolas
for each row execute function public.transparencia_ideb_touch_updated_at();

drop trigger if exists trg_transparencia_ideb_indicadores_updated_at on public.transparencia_ideb_indicadores;
create trigger trg_transparencia_ideb_indicadores_updated_at
before update on public.transparencia_ideb_indicadores
for each row execute function public.transparencia_ideb_touch_updated_at();

alter table public.transparencia_ideb_municipal enable row level security;
alter table public.transparencia_ideb_escolas enable row level security;
alter table public.transparencia_ideb_indicadores enable row level security;

drop policy if exists "transparencia_ideb_municipal_anon_select_published" on public.transparencia_ideb_municipal;
create policy "transparencia_ideb_municipal_anon_select_published"
on public.transparencia_ideb_municipal
for select
to anon
using (publicado = true);

drop policy if exists "transparencia_ideb_escolas_anon_select_published" on public.transparencia_ideb_escolas;
create policy "transparencia_ideb_escolas_anon_select_published"
on public.transparencia_ideb_escolas
for select
to anon
using (publicado = true);

drop policy if exists "transparencia_ideb_indicadores_anon_select_published" on public.transparencia_ideb_indicadores;
create policy "transparencia_ideb_indicadores_anon_select_published"
on public.transparencia_ideb_indicadores
for select
to anon
using (publicado = true);

drop policy if exists "transparencia_ideb_municipal_admin_select" on public.transparencia_ideb_municipal;
create policy "transparencia_ideb_municipal_admin_select"
on public.transparencia_ideb_municipal
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "transparencia_ideb_escolas_admin_select" on public.transparencia_ideb_escolas;
create policy "transparencia_ideb_escolas_admin_select"
on public.transparencia_ideb_escolas
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "transparencia_ideb_indicadores_admin_select" on public.transparencia_ideb_indicadores;
create policy "transparencia_ideb_indicadores_admin_select"
on public.transparencia_ideb_indicadores
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "transparencia_ideb_municipal_admin_insert" on public.transparencia_ideb_municipal;
create policy "transparencia_ideb_municipal_admin_insert"
on public.transparencia_ideb_municipal
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "transparencia_ideb_escolas_admin_insert" on public.transparencia_ideb_escolas;
create policy "transparencia_ideb_escolas_admin_insert"
on public.transparencia_ideb_escolas
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "transparencia_ideb_indicadores_admin_insert" on public.transparencia_ideb_indicadores;
create policy "transparencia_ideb_indicadores_admin_insert"
on public.transparencia_ideb_indicadores
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "transparencia_ideb_municipal_admin_update" on public.transparencia_ideb_municipal;
create policy "transparencia_ideb_municipal_admin_update"
on public.transparencia_ideb_municipal
for update
to authenticated
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

drop policy if exists "transparencia_ideb_escolas_admin_update" on public.transparencia_ideb_escolas;
create policy "transparencia_ideb_escolas_admin_update"
on public.transparencia_ideb_escolas
for update
to authenticated
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

drop policy if exists "transparencia_ideb_indicadores_admin_update" on public.transparencia_ideb_indicadores;
create policy "transparencia_ideb_indicadores_admin_update"
on public.transparencia_ideb_indicadores
for update
to authenticated
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

drop policy if exists "transparencia_ideb_municipal_admin_delete" on public.transparencia_ideb_municipal;
create policy "transparencia_ideb_municipal_admin_delete"
on public.transparencia_ideb_municipal
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "transparencia_ideb_escolas_admin_delete" on public.transparencia_ideb_escolas;
create policy "transparencia_ideb_escolas_admin_delete"
on public.transparencia_ideb_escolas
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "transparencia_ideb_indicadores_admin_delete" on public.transparencia_ideb_indicadores;
create policy "transparencia_ideb_indicadores_admin_delete"
on public.transparencia_ideb_indicadores
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

insert into public.transparencia_ideb_municipal (
  ano, municipio, uf, etapa, ideb, meta_projetada, matematica, portugues, proficiencia_media, taxa_aprovacao, fluxo, fonte, observacao, publicado
)
values
  (2023, 'Brotas de Macaúbas', 'BA', 'Anos Iniciais', 5.1, null, 5.09, 5.15, null, null, 1.00, 'Relatório técnico municipal / QEdu / INEP', 'dados_oficiais_relatorio_2023', true),
  (2023, 'Brotas de Macaúbas', 'BA', 'Anos Finais', 4.8, null, 5.12, 5.29, null, null, 0.92, 'Relatório técnico municipal / QEdu / INEP', 'dados_oficiais_relatorio_2023', true),
  (2023, 'Brotas de Macaúbas', 'BA', 'Ensino Médio', 3.8, null, 3.99, 4.26, null, null, 0.92, 'Relatório técnico municipal / QEdu / INEP', 'dados_oficiais_relatorio_2023', true),
  (2019, 'Brotas de Macaúbas', 'BA', 'Anos Iniciais', 5.4, 4.7, null, null, 5.68, 95, null, 'QEdu/INEP', 'dados_complementares_historicos', true),
  (2021, 'Brotas de Macaúbas', 'BA', 'Anos Iniciais', 5.2, 5.0, null, null, 5.30, 98, null, 'QEdu/INEP', 'dados_complementares_historicos', true),
  (2023, 'Brotas de Macaúbas', 'BA', 'Anos Iniciais', 5.3, 5.2, null, null, 5.42, 96, null, 'QEdu/INEP', 'dados_complementares_historicos', true),
  (2019, 'Brotas de Macaúbas', 'BA', 'Anos Finais', 4.1, 4.0, null, null, 4.75, 86, null, 'QEdu/INEP', 'dados_complementares_historicos', true),
  (2021, 'Brotas de Macaúbas', 'BA', 'Anos Finais', 3.9, 4.3, null, null, 4.40, 89, null, 'QEdu/INEP', 'dados_complementares_historicos', true),
  (2023, 'Brotas de Macaúbas', 'BA', 'Anos Finais', 4.0, 4.6, null, null, 4.55, 88, null, 'QEdu/INEP', 'dados_complementares_historicos', true);

insert into public.transparencia_ideb_escolas (
  ano, escola, etapa, posicao, aprendizado, fluxo, ideb, leitura_tecnica, fonte, publicado
)
values
  (2023, 'Escola Municipal Dr. Antonio Carlos Magalhães', 'Anos Iniciais', 1, 5.66, 1.00, 5.7, 'Melhor resultado entre as escolas listadas; combina maior aprendizado com aprovação máxima.', 'Relatório técnico municipal / QEdu / INEP', true),
  (2023, 'Escola Municipal Agostinho Ribeiro', 'Anos Iniciais', 2, 5.17, 0.99, 5.1, 'Resultado positivo, com pequena redução por fluxo inferior a 1,00.', 'Relatório técnico municipal / QEdu / INEP', true),
  (2023, 'Escola Municipal Maria de Meira Lima Costa', 'Anos Iniciais', 2, 5.12, 1.00, 5.1, 'Aprovação plena; ganho futuro depende mais do aprendizado medido pelo Saeb.', 'Relatório técnico municipal / QEdu / INEP', true);

insert into public.transparencia_ideb_indicadores (
  ano, grupo, indicador, etapa, valor, unidade, fonte, publicado
)
values
  (2021, 'Comparativo 2021', 'Brotas de Macaúbas', 'Anos Iniciais', 5.2, 'indice', 'QEdu/INEP', true),
  (2021, 'Comparativo 2021', 'Brotas de Macaúbas', 'Anos Finais', 3.9, 'indice', 'QEdu/INEP', true),
  (2021, 'Comparativo 2021', 'Bahia', 'Anos Iniciais', 4.9, 'indice', 'QEdu/INEP', true),
  (2021, 'Comparativo 2021', 'Bahia', 'Anos Finais', 3.8, 'indice', 'QEdu/INEP', true),
  (2021, 'Comparativo 2021', 'Brasil', 'Anos Iniciais', 5.8, 'indice', 'QEdu/INEP', true),
  (2021, 'Comparativo 2021', 'Brasil', 'Anos Finais', 5.1, 'indice', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Aprovação', 'Anos Iniciais', 96.2, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Reprovação', 'Anos Iniciais', 3.1, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Abandono', 'Anos Iniciais', 0.7, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Distorção idade-série', 'Anos Iniciais', 12.5, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Aprovação', 'Anos Finais', 87.5, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Reprovação', 'Anos Finais', 9.8, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Abandono', 'Anos Finais', 2.7, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Distorção idade-série', 'Anos Finais', 28.4, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Aprovação', 'Ensino Médio', 84.1, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Reprovação', 'Ensino Médio', 11.5, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Abandono', 'Ensino Médio', 4.4, 'percentual', 'QEdu/INEP', true),
  (2023, 'Rendimento e fluxo escolar', 'Distorção idade-série', 'Ensino Médio', 35.2, 'percentual', 'QEdu/INEP', true),
  (2023, 'SAEB por disciplina', 'Língua Portuguesa', '5º ano', 198.5, 'pontos', 'INEP', true),
  (2023, 'SAEB por disciplina', 'Língua Portuguesa', '9º ano', 242.0, 'pontos', 'INEP', true),
  (2023, 'SAEB por disciplina', 'Matemática', '5º ano', 205.2, 'pontos', 'INEP', true),
  (2023, 'SAEB por disciplina', 'Matemática', '9º ano', 248.6, 'pontos', 'INEP', true),
  (2023, 'Infraestrutura', 'Internet Banda Larga', null, 75, 'percentual', 'Censo Escolar', true),
  (2023, 'Infraestrutura', 'Biblioteca / Sala de Leitura', null, 60, 'percentual', 'Censo Escolar', true),
  (2023, 'Infraestrutura', 'Quadra Esportiva Coberta', null, 40, 'percentual', 'Censo Escolar', true),
  (2023, 'Infraestrutura', 'Acessibilidade Completa', null, 30, 'percentual', 'Censo Escolar', true),
  (2023, 'Infraestrutura', 'Laboratório de Ciências', null, 15, 'percentual', 'Censo Escolar', true);

commit;
