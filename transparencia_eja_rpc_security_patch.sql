begin;

create or replace function public.salvar_transparencia_eja_importacao(
  p_importacao jsonb,
  p_linhas jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_importacao_id uuid;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'Usuário não autenticado';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_uid
      and p.role in ('admin', 'super_admin')
  ) then
    raise exception 'Sem permissão para salvar importação EJA';
  end if;

  insert into public.transparencia_eja_importacoes (
    created_by,
    status_publicacao,
    ano_referencia,
    total_eja,
    total_urbana,
    total_rural,
    fonte_resumo,
    data_atualizacao,
    observacoes
  ) values (
    v_uid,
    'rascunho',
    coalesce((p_importacao->>'ano_referencia')::int, extract(year from now())::int),
    coalesce((p_importacao->>'total_eja')::int, 0),
    coalesce((p_importacao->>'total_urbana')::int, 0),
    coalesce((p_importacao->>'total_rural')::int, 0),
    coalesce(p_importacao->>'fonte_resumo', 'Não informado'),
    nullif(p_importacao->>'data_atualizacao', '')::date,
    nullif(p_importacao->>'observacoes', '')
  )
  returning id into v_importacao_id;

  insert into public.transparencia_eja_linhas (
    importacao_id,
    ano,
    localizacao,
    quantidade,
    fonte,
    data_atualizacao,
    ordem
  )
  select
    v_importacao_id,
    (l->>'ano')::int,
    coalesce(l->>'localizacao', 'Urbana'),
    greatest(coalesce((l->>'quantidade')::int, 0), 0),
    nullif(l->>'fonte', ''),
    nullif(l->>'data_atualizacao', '')::date,
    coalesce((l->>'ordem')::int, row_number() over ())
  from jsonb_array_elements(coalesce(p_linhas, '[]'::jsonb)) as l;

  update public.transparencia_eja_importacoes
  set updated_at = now()
  where id = v_importacao_id;

  return v_importacao_id;
end;
$$;

create or replace function public.publicar_transparencia_eja_importacao(
  p_importacao_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_updated_count int;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'Usuário não autenticado';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_uid
      and p.role in ('admin', 'super_admin')
  ) then
    raise exception 'Sem permissão para publicar importação EJA';
  end if;

  if not exists (
    select 1
    from public.transparencia_eja_importacoes i
    where i.id = p_importacao_id
  ) then
    raise exception 'Importação EJA não encontrada.';
  end if;

  update public.transparencia_eja_importacoes
  set status_publicacao = 'rascunho', updated_at = now()
  where status_publicacao = 'publicado';

  update public.transparencia_eja_importacoes
  set status_publicacao = 'publicado', updated_at = now()
  where id = p_importacao_id;

  get diagnostics v_updated_count = row_count;
  if v_updated_count <> 1 then
    raise exception 'Falha ao publicar importação EJA.';
  end if;
end;
$$;

commit;
