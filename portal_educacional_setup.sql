-- Portal Educacional — tabelas, dados iniciais e RLS (Supabase)
-- Execute no SQL Editor do projeto ou via migração.

create table if not exists portal_sistemas (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  descricao text not null,
  link text not null,
  ativo boolean default true,
  ordem integer default 0,
  created_at timestamp default now()
);

create table if not exists portal_perfis (
  id uuid default gen_random_uuid() primary key,
  sistema_id uuid references portal_sistemas(id) on delete cascade,
  nome text not null,
  descricao text,
  link text not null,
  icone text not null,
  ordem integer default 0,
  ativo boolean default true
);

create table if not exists portal_config (
  id uuid default gen_random_uuid() primary key,
  chave text unique not null,
  valor text not null
);

insert into portal_config (chave, valor) values
  ('hero_titulo', 'Sistemas da Secretaria Municipal de Educação'),
  ('hero_subtitulo', 'Acesso unificado aos sistemas educacionais de Brotas de Macaúbas. Selecione o sistema ou seu perfil de acesso abaixo.'),
  ('suporte_telefone', '(75) 3643-0000')
on conflict (chave) do update set valor = excluded.valor;

insert into portal_sistemas (nome, descricao, link, ordem)
select 'NutriAssist', 'Gestão da alimentação escolar, cardápios e controle nutricional da rede.', 'https://www.nutriassist.smebrotas.com.br/login', 1
where not exists (select 1 from portal_sistemas where nome = 'NutriAssist');

insert into portal_sistemas (nome, descricao, link, ordem)
select 'Sistema Brotar', 'Gestão pedagógica, acompanhamento de alunos e coordenação da rede municipal.', 'https://brotar.smebrotas.com.br/login', 2
where not exists (select 1 from portal_sistemas where nome = 'Sistema Brotar');

insert into portal_sistemas (nome, descricao, link, ordem)
select 'Boletim Escolar', 'Notas, frequências, relatórios e acompanhamento completo por perfil de usuário.', 'https://boletim.smebrotas.com.br', 3
where not exists (select 1 from portal_sistemas where nome = 'Boletim Escolar');

alter table portal_config enable row level security;
alter table portal_sistemas enable row level security;
alter table portal_perfis enable row level security;

drop policy if exists "portal_config_select_public" on portal_config;
drop policy if exists "portal_config_insert_auth" on portal_config;
drop policy if exists "portal_config_update_auth" on portal_config;
drop policy if exists "portal_config_delete_auth" on portal_config;

create policy "portal_config_select_public" on portal_config for select using (true);
create policy "portal_config_insert_auth" on portal_config for insert to authenticated with check (true);
create policy "portal_config_update_auth" on portal_config for update to authenticated using (true) with check (true);
create policy "portal_config_delete_auth" on portal_config for delete to authenticated using (true);

drop policy if exists "portal_sistemas_select_public" on portal_sistemas;
drop policy if exists "portal_sistemas_insert_auth" on portal_sistemas;
drop policy if exists "portal_sistemas_update_auth" on portal_sistemas;
drop policy if exists "portal_sistemas_delete_auth" on portal_sistemas;

create policy "portal_sistemas_select_public" on portal_sistemas for select using (true);
create policy "portal_sistemas_insert_auth" on portal_sistemas for insert to authenticated with check (true);
create policy "portal_sistemas_update_auth" on portal_sistemas for update to authenticated using (true) with check (true);
create policy "portal_sistemas_delete_auth" on portal_sistemas for delete to authenticated using (true);

drop policy if exists "portal_perfis_select_public" on portal_perfis;
drop policy if exists "portal_perfis_insert_auth" on portal_perfis;
drop policy if exists "portal_perfis_update_auth" on portal_perfis;
drop policy if exists "portal_perfis_delete_auth" on portal_perfis;

create policy "portal_perfis_select_public" on portal_perfis for select using (true);
create policy "portal_perfis_insert_auth" on portal_perfis for insert to authenticated with check (true);
create policy "portal_perfis_update_auth" on portal_perfis for update to authenticated using (true) with check (true);
create policy "portal_perfis_delete_auth" on portal_perfis for delete to authenticated using (true);
