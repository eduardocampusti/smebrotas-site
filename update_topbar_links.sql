-- ============================================================
-- ATUALIZAÇÃO DOS LINKS DA BARRA SUPERIOR - SME Brotas
-- Execute este script no Supabase Dashboard > SQL Editor
-- ============================================================

-- Ouvidoria → Portal da Prefeitura (página de ouvidoria)
UPDATE top_bar_items
SET link = 'https://brotasdemacaubas.ba.gov.br/'
WHERE texto ILIKE '%ouvidoria%';

-- Diário Oficial → DOEM (Diário Oficial Eletrônico dos Municípios)
UPDATE top_bar_items
SET link = 'https://doem.org.br/ba/brotasdemacaubas'
WHERE texto ILIKE '%diário oficial%' OR texto ILIKE '%diario oficial%';

-- Acesso à Informação → Portal e-SIC do município
UPDATE top_bar_items
SET link = 'https://acessoinformacao.brotasdemacaubas.ba.gov.br/'
WHERE texto ILIKE '%acesso%informa%';

-- Proteção de Dados → Portal LGPD do município
UPDATE top_bar_items
SET link = 'https://acessoinformacao.brotasdemacaubas.ba.gov.br/'
WHERE texto ILIKE '%prote%dados%' OR texto ILIKE '%lgpd%';

-- Governo Digital → Portal Federal de Governo Digital
UPDATE top_bar_items
SET link = 'https://www.gov.br/governodigital/pt-br'
WHERE texto ILIKE '%governo digital%';

-- Mapa do Site → Rota interna (já correto)
UPDATE top_bar_items
SET link = '/mapa-do-site', target_blank = false
WHERE texto ILIKE '%mapa do site%';

-- Instagram → @smebrotas
UPDATE top_bar_items
SET link = 'https://www.instagram.com/smebrotas/'
WHERE texto ILIKE '%instagram%';

-- Webmail → Deixar em branco até definir (mantém '#')
-- UPDATE top_bar_items SET link = 'SEU_LINK_AQUI' WHERE texto ILIKE '%webmail%';

-- Verificar resultado após as atualizações:
SELECT id, ordem, texto, link, ativo, target_blank
FROM top_bar_items
ORDER BY ordem;
