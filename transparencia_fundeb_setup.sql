begin;

create table if not exists public.fundeb_annual_data (
  id uuid primary key default gen_random_uuid(),
  year integer unique not null,
  receita_contribuicao_estados_municipios numeric(14,2) not null default 0,
  complementacao_vaaf numeric(14,2) not null default 0,
  complementacao_vaat numeric(14,2) not null default 0,
  complementacao_vaar numeric(14,2) not null default 0,
  complementacao_uniao_total numeric(14,2) not null default 0,
  total_fundeb_previsto numeric(14,2) not null default 0,
  is_published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.fundeb_vaat_indicators (
  id uuid primary key default gen_random_uuid(),
  year integer unique not null,
  vaat_antes_complementacao numeric(14,2) not null default 0,
  vaat_com_complementacao numeric(14,2) not null default 0,
  complementacao_vaat numeric(14,2) not null default 0,
  iei_percentual numeric(6,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.fundeb_vaat_schedule (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  month_order integer not null,
  month_label text not null,
  value numeric(14,2) not null default 0,
  is_next_year_month boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(year, month_order),
  check (month_order between 1 and 13)
);

create table if not exists public.fundeb_settings (
  id uuid primary key default gen_random_uuid(),
  title text default 'FUNDEB',
  subtitle text,
  source_text text,
  observation_text text,
  footer_text text,
  last_updated date,
  is_published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists ux_fundeb_settings_singleton on public.fundeb_settings ((true));

create or replace function public.fundeb_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fundeb_annual_updated_at on public.fundeb_annual_data;
create trigger trg_fundeb_annual_updated_at before update on public.fundeb_annual_data
for each row execute function public.fundeb_touch_updated_at();

drop trigger if exists trg_fundeb_vaat_indicators_updated_at on public.fundeb_vaat_indicators;
create trigger trg_fundeb_vaat_indicators_updated_at before update on public.fundeb_vaat_indicators
for each row execute function public.fundeb_touch_updated_at();

drop trigger if exists trg_fundeb_vaat_schedule_updated_at on public.fundeb_vaat_schedule;
create trigger trg_fundeb_vaat_schedule_updated_at before update on public.fundeb_vaat_schedule
for each row execute function public.fundeb_touch_updated_at();

drop trigger if exists trg_fundeb_settings_updated_at on public.fundeb_settings;
create trigger trg_fundeb_settings_updated_at before update on public.fundeb_settings
for each row execute function public.fundeb_touch_updated_at();

insert into public.fundeb_annual_data (
  year, receita_contribuicao_estados_municipios, complementacao_vaaf, complementacao_vaat, complementacao_vaar, complementacao_uniao_total, total_fundeb_previsto, is_published
)
values
  (2023, 9820987.93, 3211702.54, 2566863.73, 139506.60, 5918072.87, 15739060.80, true),
  (2024, 10999937.31, 3671021.35, 3808274.42, 194687.40, 7673983.17, 18673920.48, true),
  (2025, 12266265.86, 3959770.99, 4607511.26, 0.00, 8567282.25, 20833548.11, true)
on conflict (year) do update
set receita_contribuicao_estados_municipios = excluded.receita_contribuicao_estados_municipios,
    complementacao_vaaf = excluded.complementacao_vaaf,
    complementacao_vaat = excluded.complementacao_vaat,
    complementacao_vaar = excluded.complementacao_vaar,
    complementacao_uniao_total = excluded.complementacao_uniao_total,
    total_fundeb_previsto = excluded.total_fundeb_previsto,
    is_published = excluded.is_published;

insert into public.fundeb_vaat_indicators (
  year, vaat_antes_complementacao, vaat_com_complementacao, complementacao_vaat, iei_percentual
)
values
  (2023, 7250.32, 8196.52, 2566863.73, 54.13),
  (2024, 7132.75, 8510.81, 3808274.42, 54.54),
  (2025, 6476.24, 8020.77, 4607511.26, 47.89)
on conflict (year) do update
set vaat_antes_complementacao = excluded.vaat_antes_complementacao,
    vaat_com_complementacao = excluded.vaat_com_complementacao,
    complementacao_vaat = excluded.complementacao_vaat,
    iei_percentual = excluded.iei_percentual;

insert into public.fundeb_settings (
  id, title, subtitle, source_text, observation_text, footer_text, last_updated, is_published
)
values (
  '00000000-0000-0000-0000-000000000001',
  'FUNDEB',
  'Dados oficiais do Fundo de Manutenção e Desenvolvimento da Educação Básica de Brotas de Macaúbas/BA',
  'Fonte: FNDE/MEC',
  'Os valores apresentados referem-se à receita total prevista/estimada do Fundeb, conforme publicações oficiais do FNDE/MEC. Para valores efetivamente creditados ou repassados em conta, consulte também STN, Banco do Brasil e Tesouro Transparente.',
  'Fonte: FNDE/MEC - Portarias MEC/MF do Fundeb. Valores referentes às receitas previstas/estimadas oficiais para o município de Brotas de Macaúbas/BA, código IBGE 2904506.',
  current_date,
  true
)
on conflict (id) do update
set title = excluded.title,
    subtitle = excluded.subtitle,
    source_text = excluded.source_text,
    observation_text = excluded.observation_text,
    footer_text = excluded.footer_text,
    last_updated = excluded.last_updated,
    is_published = excluded.is_published;

insert into public.fundeb_vaat_schedule (year, month_order, month_label, value, is_next_year_month) values
(2023,1,'Jan',126134.98,false),(2023,2,'Fev',138748.48,false),(2023,3,'Mar',151361.97,false),(2023,4,'Abr',163975.47,false),(2023,5,'Mai',177126.93,false),(2023,6,'Jun',189748.00,false),(2023,7,'Jul',189748.00,false),(2023,8,'Ago',201937.07,false),(2023,9,'Set',201001.34,false),(2023,10,'Out',201000.13,false),(2023,11,'Nov',201000.13,false),(2023,12,'Dez',201000.13,false),(2023,13,'Jan seg.',424081.10,true),
(2024,1,'Jan',178158.89,false),(2024,2,'Fev',195974.78,false),(2024,3,'Mar',213575.19,false),(2024,4,'Abr',231373.12,false),(2024,5,'Mai',251704.57,false),(2024,6,'Jun',269561.42,false),(2024,7,'Jul',269561.42,false),(2024,8,'Ago',288656.48,false),(2024,9,'Set',316528.80,false),(2024,10,'Out',316528.80,false),(2024,11,'Nov',316528.80,false),(2024,12,'Dez',315692.11,false),(2024,13,'Jan seg.',644430.04,true),
(2025,1,'Jan',228181.19,false),(2025,2,'Fev',250999.31,false),(2025,3,'Mar',273817.43,false),(2025,4,'Abr',296635.55,false),(2025,5,'Mai',347770.18,false),(2025,6,'Jun',371575.13,false),(2025,7,'Jul',371575.13,false),(2025,8,'Ago',380879.11,false),(2025,9,'Set',355641.66,false),(2025,10,'Out',355367.29,false),(2025,11,'Nov',355367.29,false),(2025,12,'Dez',355016.43,false),(2025,13,'Jan seg.',664685.56,true)
on conflict (year, month_order) do update
set month_label = excluded.month_label,
    value = excluded.value,
    is_next_year_month = excluded.is_next_year_month;

commit;
