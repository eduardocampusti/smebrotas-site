-- === SCRIPT COMPLETO PARA CONFIGURAR A TOPBAR ===
-- Este script garante que a tabela top_bar_items existe, tem a função updated_at e dados

-- 1. Criar a função update_updated_at_column se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
    ) THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = timezone('utc'::text, now());
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        RAISE NOTICE 'Função update_updated_at_column criada!';
    ELSE
        RAISE NOTICE 'Função update_updated_at_column já existe!';
    END IF;
END $$;

-- 2. Criar a tabela top_bar_items se não existir
CREATE TABLE IF NOT EXISTS public.top_bar_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    texto TEXT NOT NULL,
    icone TEXT,
    link TEXT,
    target_blank BOOLEAN NOT NULL DEFAULT false,
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Configura RLS
ALTER TABLE public.top_bar_items ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acesso (leitura pública, escrita authorised)
DROP POLICY IF EXISTS "Top Bar visível por todos" ON public.top_bar_items;
CREATE POLICY "Top Bar visível por todos" ON public.top_bar_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem inserir itens da barra superior" ON public.top_bar_items;
CREATE POLICY "Admins podem inserir itens da barra superior" ON public.top_bar_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins podem atualizar itens da barra superior" ON public.top_bar_items;
CREATE POLICY "Admins podem atualizar itens da barra superior" ON public.top_bar_items
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins podem deletar itens da barra superior" ON public.top_bar_items;
CREATE POLICY "Admins podem deletar itens da barra superior" ON public.top_bar_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Trigger para auto-update do updated_at
DROP TRIGGER IF EXISTS update_top_bar_items_updated_at ON public.top_bar_items;
CREATE TRIGGER update_top_bar_items_updated_at
    BEFORE UPDATE ON public.top_bar_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Limpar itens existentes (opcional - se quiser resetar)
TRUNCATE TABLE public.top_bar_items;

-- 7. Inserir itens da barra superior
INSERT INTO public.top_bar_items (texto, icone, link, target_blank, ativo, ordem) VALUES
    ('Ouvidoria', 'hearing', '#', true, true, 1),
    ('Diário Oficial', 'description', '#', true, true, 2),
    ('Acesso à Informação', 'info', '#', true, true, 3),
    ('Proteção de Dados', 'shield', '#', true, true, 4),
    ('Governo Digital', 'computer', '#', true, true, 5),
    ('Mapa do Site', 'map', '/mapa-do-site', false, true, 6),
    ('Webmail', 'mail', '#', true, true, 7),
    ('Instagram', 'photo_camera', '#', true, true, 8);

-- 8. Verificação
DO $$
DECLARE
    item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO item_count FROM public.top_bar_items WHERE ativo = true;
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    RAISE NOTICE 'Total de itens ativos na TopBar: %', item_count;
    RAISE NOTICE '';
    RAISE NOTICE 'TopBar configurada com sucesso!";
END $$;