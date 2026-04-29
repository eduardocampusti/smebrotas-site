# Checklist de validacao - Matrículas (Supabase)

## 1) Sanity check de estrutura
- Verificar existencia das tabelas:
  - `select to_regclass('public.transparencia_matriculas_importacoes');`
  - `select to_regclass('public.transparencia_matriculas_linhas');`
- Verificar trigger de `updated_at`:
  - `select tgname from pg_trigger where tgname = 'trg_update_transparencia_matriculas_importacoes_updated_at';`
- Verificar RPC de publicacao:
  - `select proname from pg_proc where proname = 'publicar_transparencia_matriculas_importacao';`

## 2) Sanity check de regras de publicacao
- Garantir unicidade de publicada:
  - tentar marcar duas importacoes como `status_publicacao='publicado'` e confirmar erro de indice unico.
- Garantir transicao atomica:
  - chamar `select public.publicar_transparencia_matriculas_importacao('<uuid>');`
  - confirmar apenas uma importacao publicada ao final.

## 3) Matriz minima de RLS
- `anon`:
  - `select` somente importacao publicada.
  - nao deve enxergar rascunho.
- `authenticated` sem role admin:
  - `select` publicado permitido.
  - nao deve enxergar rascunho nem linhas de rascunho.
  - `insert/update/delete` negado.
- `authenticated` com `profiles.role='admin'`:
  - `select` de todas as importacoes (incluindo rascunho) permitido.
  - `select` de todas as linhas (incluindo linhas de rascunho) permitido.
  - `insert/update/delete` permitido.
- `authenticated` com `profiles.role='super_admin'`:
  - `select` de todas as importacoes (incluindo rascunho) permitido.
  - `select` de todas as linhas (incluindo linhas de rascunho) permitido.
  - `insert/update/delete` permitido.

## 3.1) Teste adicional obrigatorio (fix RLS admin SELECT)
- Confirmar existencia das policies novas:
  - `select policyname, cmd from pg_policies where schemaname='public' and tablename='transparencia_matriculas_importacoes' and policyname='tm_importacoes_select_admin_all';`
  - `select policyname, cmd from pg_policies where schemaname='public' and tablename='transparencia_matriculas_linhas' and policyname='tm_linhas_select_admin_all';`
- Confirmar que policy publica continua:
  - `select policyname from pg_policies where schemaname='public' and tablename='transparencia_matriculas_importacoes' and policyname='tm_importacoes_select_publicado';`
  - `select policyname from pg_policies where schemaname='public' and tablename='transparencia_matriculas_linhas' and policyname='tm_linhas_select_publicado';`
- Validar comportamento:
  - admin/super_admin consegue `select` de importacoes rascunho e linhas de rascunho.
  - usuario comum (`authenticated` sem role admin/super_admin) nao consegue `select` de rascunho.

## 4) Consistencia de totais antes da publicacao
- Recalcular soma de linhas:
  - `select importacao_id, sum(quantidade) from public.transparencia_matriculas_linhas group by importacao_id;`
- Comparar com `total_geral_importado` na tabela de importacoes.
- Bloquear fluxo de publicacao no frontend se houver divergencia.

## 5) Riscos operacionais observados
- Role em `user_metadata` sem sincronia para `public.profiles`.
- Publicacao acidental por falta de confirmacao explicita.
- Duplicidade de lote em caso de reenvio de mesmo CSV.

## 6) Rollback rapido
- Rollback completo e explicito em:
  - `transparencia_matriculas_rollback.sql`
- Ordem usada no rollback:
  - policies das tabelas de Matrículas;
  - RPCs/funções e trigger;
  - índices;
  - tabelas (`transparencia_matriculas_linhas` -> `transparencia_matriculas_importacoes`).
