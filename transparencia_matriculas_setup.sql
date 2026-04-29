-- ============================================================================
-- Transparencia - Matriculas (Importacoes + Linhas)
-- Script idempotente para criar estrutura, indices, trigger, RLS e RPC
-- ============================================================================

-- 1) Tabela de importacoes
CREATE TABLE IF NOT EXISTS public.transparencia_matriculas_importacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ano_referencia INTEGER NOT NULL CHECK (ano_referencia BETWEEN 2000 AND 2100),
    fonte_resumo TEXT NOT NULL,
    fontes_detectadas TEXT[] NOT NULL DEFAULT '{}',
    data_atualizacao DATE,
    total_geral_importado INTEGER NOT NULL DEFAULT 0 CHECK (total_geral_importado >= 0),
    total_infantil_fundamental INTEGER NOT NULL DEFAULT 0 CHECK (total_infantil_fundamental >= 0),
    total_eja INTEGER NOT NULL DEFAULT 0 CHECK (total_eja >= 0),
    total_aee_educacao_especial INTEGER NOT NULL DEFAULT 0 CHECK (total_aee_educacao_especial >= 0),
    vagas_disponiveis INTEGER CHECK (vagas_disponiveis IS NULL OR vagas_disponiveis >= 0),
    taxa_ocupacao NUMERIC(5,2) CHECK (taxa_ocupacao IS NULL OR taxa_ocupacao BETWEEN 0 AND 100),
    possui_localizacao BOOLEAN NOT NULL DEFAULT false,
    observacoes TEXT,
    status_publicacao TEXT NOT NULL DEFAULT 'rascunho' CHECK (status_publicacao IN ('rascunho', 'publicado')),
    publicado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT ck_tm_importacoes_publicacao
      CHECK (
        (status_publicacao = 'rascunho' AND publicado_em IS NULL)
        OR
        (status_publicacao = 'publicado' AND publicado_em IS NOT NULL)
      )
);

-- 2) Tabela de linhas importadas
CREATE TABLE IF NOT EXISTS public.transparencia_matriculas_linhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    importacao_id UUID NOT NULL REFERENCES public.transparencia_matriculas_importacoes(id) ON DELETE CASCADE,
    ano INTEGER NOT NULL CHECK (ano BETWEEN 2000 AND 2100),
    tipo_registro TEXT NOT NULL,
    etapa TEXT,
    modalidade TEXT,
    escola TEXT,
    localizacao TEXT,
    dependencia TEXT,
    quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
    fonte TEXT NOT NULL,
    data_atualizacao DATE NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT ck_tm_linhas_dimensao
      CHECK (
        COALESCE(NULLIF(trim(etapa), ''), NULLIF(trim(modalidade), ''), NULLIF(trim(escola), '')) IS NOT NULL
      )
);

-- 3) Indices
CREATE INDEX IF NOT EXISTS idx_tm_importacoes_ano
    ON public.transparencia_matriculas_importacoes (ano_referencia DESC);

CREATE INDEX IF NOT EXISTS idx_tm_importacoes_status_created
    ON public.transparencia_matriculas_importacoes (status_publicacao, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS ux_tm_importacao_publicada_unica
    ON public.transparencia_matriculas_importacoes ((status_publicacao))
    WHERE status_publicacao = 'publicado';

CREATE INDEX IF NOT EXISTS idx_tm_linhas_importacao_ordem
    ON public.transparencia_matriculas_linhas (importacao_id, ordem);

CREATE INDEX IF NOT EXISTS idx_tm_linhas_importacao_tipo
    ON public.transparencia_matriculas_linhas (importacao_id, tipo_registro);

CREATE INDEX IF NOT EXISTS idx_tm_linhas_importacao_ano
    ON public.transparencia_matriculas_linhas (importacao_id, ano);

-- 4) Trigger de updated_at (importacoes)
CREATE OR REPLACE FUNCTION public.update_transparencia_matriculas_importacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_transparencia_matriculas_importacoes_updated_at
    ON public.transparencia_matriculas_importacoes;

CREATE TRIGGER trg_update_transparencia_matriculas_importacoes_updated_at
    BEFORE UPDATE ON public.transparencia_matriculas_importacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_transparencia_matriculas_importacoes_updated_at();

-- 5) RPC para publicar importacao com troca atomica
CREATE OR REPLACE FUNCTION public.salvar_transparencia_matriculas_importacao(
    p_importacao JSONB,
    p_linhas JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_importacao_id UUID;
    v_user_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    v_user_id := auth.uid();

    SELECT EXISTS (
        SELECT 1
          FROM public.profiles
         WHERE profiles.id = v_user_id
           AND profiles.role IN ('admin', 'super_admin')
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Apenas admin/super_admin pode salvar importacao de matriculas.';
    END IF;

    IF jsonb_typeof(p_importacao) IS DISTINCT FROM 'object' THEN
        RAISE EXCEPTION 'p_importacao deve ser um objeto JSON.';
    END IF;

    IF jsonb_typeof(p_linhas) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'p_linhas deve ser um array JSON.';
    END IF;

    INSERT INTO public.transparencia_matriculas_importacoes (
        ano_referencia,
        fonte_resumo,
        fontes_detectadas,
        data_atualizacao,
        total_geral_importado,
        total_infantil_fundamental,
        total_eja,
        total_aee_educacao_especial,
        vagas_disponiveis,
        taxa_ocupacao,
        possui_localizacao,
        observacoes,
        status_publicacao,
        publicado_em,
        created_by
    )
    VALUES (
        (p_importacao->>'ano_referencia')::INTEGER,
        p_importacao->>'fonte_resumo',
        CASE
            WHEN jsonb_typeof(p_importacao->'fontes_detectadas') = 'array'
                THEN ARRAY(SELECT jsonb_array_elements_text(p_importacao->'fontes_detectadas'))
            ELSE '{}'
        END,
        NULLIF(p_importacao->>'data_atualizacao', '')::DATE,
        COALESCE((p_importacao->>'total_geral_importado')::INTEGER, 0),
        COALESCE((p_importacao->>'total_infantil_fundamental')::INTEGER, 0),
        COALESCE((p_importacao->>'total_eja')::INTEGER, 0),
        COALESCE((p_importacao->>'total_aee_educacao_especial')::INTEGER, 0),
        NULLIF(p_importacao->>'vagas_disponiveis', '')::INTEGER,
        NULLIF(p_importacao->>'taxa_ocupacao', '')::NUMERIC(5,2),
        COALESCE((p_importacao->>'possui_localizacao')::BOOLEAN, false),
        NULLIF(p_importacao->>'observacoes', ''),
        'rascunho',
        NULL,
        v_user_id
    )
    RETURNING id INTO v_importacao_id;

    INSERT INTO public.transparencia_matriculas_linhas (
        importacao_id,
        ano,
        tipo_registro,
        etapa,
        modalidade,
        escola,
        localizacao,
        dependencia,
        quantidade,
        fonte,
        data_atualizacao,
        ordem
    )
    SELECT
        v_importacao_id,
        (linha->>'ano')::INTEGER,
        linha->>'tipo_registro',
        NULLIF(linha->>'etapa', ''),
        NULLIF(linha->>'modalidade', ''),
        NULLIF(linha->>'escola', ''),
        NULLIF(linha->>'localizacao', ''),
        NULLIF(linha->>'dependencia', ''),
        (linha->>'quantidade')::INTEGER,
        linha->>'fonte',
        (linha->>'data_atualizacao')::DATE,
        COALESCE((linha->>'ordem')::INTEGER, 0)
    FROM jsonb_array_elements(p_linhas) AS linha;

    RETURN v_importacao_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.publicar_transparencia_matriculas_importacao(p_importacao_id UUID)
RETURNS public.transparencia_matriculas_importacoes
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_result public.transparencia_matriculas_importacoes;
BEGIN
    -- Despublica qualquer importacao publicada atualmente
    UPDATE public.transparencia_matriculas_importacoes
       SET status_publicacao = 'rascunho',
           publicado_em = NULL
     WHERE status_publicacao = 'publicado';

    -- Publica a importacao alvo
    UPDATE public.transparencia_matriculas_importacoes
       SET status_publicacao = 'publicado',
           publicado_em = timezone('utc'::text, now())
     WHERE id = p_importacao_id
     RETURNING * INTO v_result;

    IF v_result.id IS NULL THEN
        RAISE EXCEPTION 'Importacao % nao encontrada.', p_importacao_id;
    END IF;

    RETURN v_result;
END;
$$;

-- 6) RLS
ALTER TABLE public.transparencia_matriculas_importacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparencia_matriculas_linhas ENABLE ROW LEVEL SECURITY;

-- Limpeza de policies antigas (idempotencia)
DROP POLICY IF EXISTS "tm_importacoes_select_publicado" ON public.transparencia_matriculas_importacoes;
DROP POLICY IF EXISTS "tm_importacoes_insert_admin" ON public.transparencia_matriculas_importacoes;
DROP POLICY IF EXISTS "tm_importacoes_update_admin" ON public.transparencia_matriculas_importacoes;
DROP POLICY IF EXISTS "tm_importacoes_delete_admin" ON public.transparencia_matriculas_importacoes;

DROP POLICY IF EXISTS "tm_linhas_select_publicado" ON public.transparencia_matriculas_linhas;
DROP POLICY IF EXISTS "tm_linhas_insert_admin" ON public.transparencia_matriculas_linhas;
DROP POLICY IF EXISTS "tm_linhas_update_admin" ON public.transparencia_matriculas_linhas;
DROP POLICY IF EXISTS "tm_linhas_delete_admin" ON public.transparencia_matriculas_linhas;

-- SELECT publico apenas publicado
CREATE POLICY "tm_importacoes_select_publicado"
    ON public.transparencia_matriculas_importacoes
    FOR SELECT
    USING (status_publicacao = 'publicado');

CREATE POLICY "tm_linhas_select_publicado"
    ON public.transparencia_matriculas_linhas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
              FROM public.transparencia_matriculas_importacoes i
             WHERE i.id = transparencia_matriculas_linhas.importacao_id
               AND i.status_publicacao = 'publicado'
        )
    );

-- Escrita restrita a admin/super_admin
CREATE POLICY "tm_importacoes_insert_admin"
    ON public.transparencia_matriculas_importacoes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.profiles
             WHERE profiles.id = auth.uid()
               AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "tm_importacoes_update_admin"
    ON public.transparencia_matriculas_importacoes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
              FROM public.profiles
             WHERE profiles.id = auth.uid()
               AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.profiles
             WHERE profiles.id = auth.uid()
               AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "tm_importacoes_delete_admin"
    ON public.transparencia_matriculas_importacoes
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
              FROM public.profiles
             WHERE profiles.id = auth.uid()
               AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "tm_linhas_insert_admin"
    ON public.transparencia_matriculas_linhas
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.profiles
             WHERE profiles.id = auth.uid()
               AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "tm_linhas_update_admin"
    ON public.transparencia_matriculas_linhas
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
              FROM public.profiles
             WHERE profiles.id = auth.uid()
               AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.profiles
             WHERE profiles.id = auth.uid()
               AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "tm_linhas_delete_admin"
    ON public.transparencia_matriculas_linhas
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
              FROM public.profiles
             WHERE profiles.id = auth.uid()
               AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 7) Grants
GRANT SELECT ON public.transparencia_matriculas_importacoes TO anon, authenticated;
GRANT SELECT ON public.transparencia_matriculas_linhas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.transparencia_matriculas_importacoes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.transparencia_matriculas_linhas TO authenticated;
GRANT EXECUTE ON FUNCTION public.salvar_transparencia_matriculas_importacao(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publicar_transparencia_matriculas_importacao(UUID) TO authenticated;

-- 8) Comentarios uteis
COMMENT ON TABLE public.transparencia_matriculas_importacoes IS
'Lotes de importacao CSV de matriculas para a aba Transparencia > Matriculas.';

COMMENT ON TABLE public.transparencia_matriculas_linhas IS
'Linhas brutas validadas do CSV de matriculas, vinculadas a um lote/importacao.';
