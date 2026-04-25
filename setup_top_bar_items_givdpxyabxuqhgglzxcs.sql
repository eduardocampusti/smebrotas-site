-- ============================================================================
-- SCRIPT IDEMPOTENTE: Criar tabela top_bar_items no projeto givdpxyabxuqhgglzxcs
-- ============================================================================
-- EXECUTE ESTE SQL NO SQL EDITOR DO PAINEL SUPABASE DO PROJETO:
--   https://supabase.com/dashboard/project/givdpxyabxuqhgglzxcs/sql
--
-- NAO execute no projeto pqjaouakuwwiwnrtkvyy (onde ja existe).
-- ============================================================================

-- PASSO 1: Criar funcao especifica para trigger de updated_at
CREATE OR REPLACE FUNCTION public.update_top_bar_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 2: Criar a tabela se nao existir
CREATE TABLE IF NOT EXISTS public.top_bar_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    texto TEXT NOT NULL,
    icone TEXT DEFAULT 'link',
    link TEXT DEFAULT '#',
    target_blank BOOLEAN NOT NULL DEFAULT false,
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PASSO 3: Criar indice para ordenacao
CREATE INDEX IF NOT EXISTS idx_top_bar_items_ordem ON public.top_bar_items (ordem);

-- PASSO 4: Trigger para auto-update do updated_at
DROP TRIGGER IF EXISTS update_top_bar_items_updated_at ON public.top_bar_items;
CREATE TRIGGER update_top_bar_items_updated_at
    BEFORE UPDATE ON public.top_bar_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_top_bar_items_updated_at();

-- PASSO 5: Habilitar RLS
ALTER TABLE public.top_bar_items ENABLE ROW LEVEL SECURITY;

-- PASSO 6: Criar policies (escrita restrita a admins via profiles.role)
-- Leitura publica (todos podem ler)
DROP POLICY IF EXISTS "top_bar_items_select_public" ON public.top_bar_items;
CREATE POLICY "top_bar_items_select_public" ON public.top_bar_items
    FOR SELECT USING (true);

-- Escrita: apenas usuarios com profiles.role IN ('admin', 'super_admin')
DROP POLICY IF EXISTS "top_bar_items_insert_admin" ON public.top_bar_items;
CREATE POLICY "top_bar_items_insert_admin" ON public.top_bar_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "top_bar_items_update_admin" ON public.top_bar_items;
CREATE POLICY "top_bar_items_update_admin" ON public.top_bar_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "top_bar_items_delete_admin" ON public.top_bar_items;
CREATE POLICY "top_bar_items_delete_admin" ON public.top_bar_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- PASSO 7: GRANTs
GRANT SELECT ON public.top_bar_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.top_bar_items TO authenticated;

-- PASSO 8: Inserir os 8 itens apenas se a tabela estiver vazia (idempotente)
INSERT INTO public.top_bar_items (texto, icone, link, target_blank, ativo, ordem)
SELECT * FROM ( VALUES
    ('Ouvidoria', 'hearing', '#', true, true, 1),
    ('Diário Oficial', 'description', '#', true, true, 2),
    ('Acesso à Informação', 'info', '#', true, true, 3),
    ('Proteção de Dados', 'shield', '#', true, true, 4),
    ('Governo Digital', 'computer', '#', true, true, 5),
    ('Mapa do Site', 'map', '/mapa-do-site', false, true, 6),
    ('Webmail', 'mail', '#', true, true, 7),
    ('Instagram', 'photo_camera', '#', true, true, 8)
) AS v(texto, icone, link, target_blank, ativo, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.top_bar_items LIMIT 1);

-- PASSO 9: Recarregar schema cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- PASSO 10: Verificacao
SELECT 'top_bar_items criada com sucesso' AS status,
       COUNT(*) AS total_itens
FROM public.top_bar_items;
