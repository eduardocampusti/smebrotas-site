-- ============================================================================
-- Transparencia - Matriculas
-- Fix incremental de RLS para SELECT administrativo (admin/super_admin)
-- Nao remove policy publica existente (publicado)
-- ============================================================================

-- Garantir RLS ativa (idempotente)
ALTER TABLE public.transparencia_matriculas_importacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparencia_matriculas_linhas ENABLE ROW LEVEL SECURITY;

-- Remover policy anterior com mesmo nome (idempotencia)
DROP POLICY IF EXISTS "tm_importacoes_select_admin_all" ON public.transparencia_matriculas_importacoes;
DROP POLICY IF EXISTS "tm_linhas_select_admin_all" ON public.transparencia_matriculas_linhas;

-- SELECT administrativo: importacoes (inclui rascunho)
CREATE POLICY "tm_importacoes_select_admin_all"
    ON public.transparencia_matriculas_importacoes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
              FROM public.profiles p
             WHERE p.id = auth.uid()
               AND p.role IN ('admin', 'super_admin')
        )
    );

-- SELECT administrativo: linhas (inclui linhas de rascunho)
CREATE POLICY "tm_linhas_select_admin_all"
    ON public.transparencia_matriculas_linhas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
              FROM public.profiles p
             WHERE p.id = auth.uid()
               AND p.role IN ('admin', 'super_admin')
        )
    );
