-- ============================================================================
-- Rollback explicito - Transparencia Matriculas
-- Ordem segura: policies/functions/triggers -> indices -> tabelas
-- ============================================================================

-- 1) Policies
DROP POLICY IF EXISTS "tm_linhas_delete_admin" ON public.transparencia_matriculas_linhas;
DROP POLICY IF EXISTS "tm_linhas_update_admin" ON public.transparencia_matriculas_linhas;
DROP POLICY IF EXISTS "tm_linhas_insert_admin" ON public.transparencia_matriculas_linhas;
DROP POLICY IF EXISTS "tm_linhas_select_admin_all" ON public.transparencia_matriculas_linhas;
DROP POLICY IF EXISTS "tm_linhas_select_publicado" ON public.transparencia_matriculas_linhas;

DROP POLICY IF EXISTS "tm_importacoes_delete_admin" ON public.transparencia_matriculas_importacoes;
DROP POLICY IF EXISTS "tm_importacoes_update_admin" ON public.transparencia_matriculas_importacoes;
DROP POLICY IF EXISTS "tm_importacoes_insert_admin" ON public.transparencia_matriculas_importacoes;
DROP POLICY IF EXISTS "tm_importacoes_select_admin_all" ON public.transparencia_matriculas_importacoes;
DROP POLICY IF EXISTS "tm_importacoes_select_publicado" ON public.transparencia_matriculas_importacoes;

-- 2) Functions / RPCs
DROP FUNCTION IF EXISTS public.salvar_transparencia_matriculas_importacao(JSONB, JSONB);
DROP FUNCTION IF EXISTS public.publicar_transparencia_matriculas_importacao(UUID);
DROP FUNCTION IF EXISTS public.update_transparencia_matriculas_importacoes_updated_at();

-- 3) Trigger
DROP TRIGGER IF EXISTS trg_update_transparencia_matriculas_importacoes_updated_at
  ON public.transparencia_matriculas_importacoes;

-- 4) Indices (opcional, tabelas abaixo ja removem automaticamente)
DROP INDEX IF EXISTS public.idx_tm_linhas_importacao_ano;
DROP INDEX IF EXISTS public.idx_tm_linhas_importacao_tipo;
DROP INDEX IF EXISTS public.idx_tm_linhas_importacao_ordem;
DROP INDEX IF EXISTS public.ux_tm_importacao_publicada_unica;
DROP INDEX IF EXISTS public.idx_tm_importacoes_status_created;
DROP INDEX IF EXISTS public.idx_tm_importacoes_ano;

-- 5) Tabelas (dependente -> pai)
DROP TABLE IF EXISTS public.transparencia_matriculas_linhas;
DROP TABLE IF EXISTS public.transparencia_matriculas_importacoes;
