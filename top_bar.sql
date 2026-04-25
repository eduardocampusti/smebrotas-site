-- Tabela para Barra Superior (Top Bar) - Atalhos Rápidos
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

-- Configura RLS
ALTER TABLE public.top_bar_items ENABLE ROW LEVEL SECURITY;

-- Política de leitura (público)
CREATE POLICY "Top Bar visível por todos" ON public.top_bar_items
    FOR SELECT USING (true);

-- Política de escrita (apenas admins logados)
CREATE POLICY "Admins podem inserir itens da barra superior" ON public.top_bar_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins podem atualizar itens da barra superior" ON public.top_bar_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem deletar itens da barra superior" ON public.top_bar_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger para auto-update do updated_at
CREATE TRIGGER update_top_bar_items_updated_at
    BEFORE UPDATE ON public.top_bar_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir itens padrão da barra superior
INSERT INTO public.top_bar_items (texto, icone, link, target_blank, ativo, ordem) VALUES
    ('Ouvidoria', 'hearing', '#', true, true, 1),
    ('Diário Oficial', 'description', '#', true, true, 2),
    ('Acesso à Informação', 'info', '#', true, true, 3),
    ('Proteção de Dados', 'shield', '#', true, true, 4),
    ('Governo Digital', 'computer', '#', true, true, 5),
    ('Mapa do Site', 'map', '/mapa-do-site', false, true, 6),
    ('Webmail', 'mail', '#', true, true, 7),
    ('Instagram', 'photo_camera', '#', true, true, 8)
ON CONFLICT DO NOTHING;