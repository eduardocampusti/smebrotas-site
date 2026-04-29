begin;

drop function if exists public.publicar_transparencia_eja_importacao(uuid);
drop function if exists public.salvar_transparencia_eja_importacao(jsonb, jsonb);

drop policy if exists "EJA linhas admin all" on public.transparencia_eja_linhas;
drop policy if exists "EJA linhas select de publicado" on public.transparencia_eja_linhas;
drop policy if exists "EJA admin all importacoes" on public.transparencia_eja_importacoes;
drop policy if exists "EJA publicado select publico" on public.transparencia_eja_importacoes;

drop index if exists public.idx_eja_linhas_importacao_id;
drop index if exists public.idx_eja_importacoes_status_publicacao;

drop table if exists public.transparencia_eja_linhas;
drop table if exists public.transparencia_eja_importacoes;

commit;
