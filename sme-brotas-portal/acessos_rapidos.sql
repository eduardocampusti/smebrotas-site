-- Tabela para Acessos Rápidos da Home
CREATE TABLE IF NOT EXISTS public.acessos_rapidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    icone TEXT,
    link TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configura RLS
ALTER TABLE public.acessos_rapidos ENABLE ROW LEVEL SECURITY;

-- Política de leitura (público)
CREATE POLICY "Acessos Rápidos visíveis por todos" ON public.acessos_rapidos
    FOR SELECT USING (true);

-- Política de escrita (apenas admins logados)
CREATE POLICY "Admins podem inserir acessos rápidos" ON public.acessos_rapidos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins podem atualizar acessos rápidos" ON public.acessos_rapidos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem deletar acessos rápidos" ON public.acessos_rapidos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger para auto-update do updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_acessos_rapidos_updated_at
    BEFORE UPDATE ON public.acessos_rapidos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- (Opcional) Script para migrar dados já existentes na tabela site_config.acessos_rapidos
-- Descomente a linha abaixo e execute se quiser migrar automaticamente:
/*
INSERT INTO public.acessos_rapidos (id, nome, icone, link, ativo, ordem)
SELECT 
  COALESCE((item->>'id')::uuid, gen_random_uuid()),
  item->>'nome',
  item->>'icone',
  item->>'link',
  COALESCE((item->>'ativo')::boolean, true),
  COALESCE((item->>'ordem')::integer, 0)
FROM public.site_config,
jsonb_array_elements(acessos_rapidos) AS item
WHERE acessos_rapidos IS NOT NULL AND jsonb_typeof(acessos_rapidos) = 'array';
*/
