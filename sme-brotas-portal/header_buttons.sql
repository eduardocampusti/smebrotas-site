-- Adicionar campo header_action_buttons à tabela site_config
-- Isso permite configurar os botões do cabeçalho do site (Portal Educacional, Portal do Servidor, etc.)

-- 1. Adicionar a coluna header_action_buttons
ALTER TABLE public.site_config 
ADD COLUMN IF NOT EXISTS header_action_buttons JSONB DEFAULT '[
  {
    "id": "1",
    "texto": "Portal Educacional",
    "link": "/portal",
    "ativo": true,
    "target_blank": false,
    "cor": "primary",
    "ordem": 1
  },
  {
    "id": "2",
    "texto": "Portal do Servidor",
    "link": "https://www.keepinformatica.com.br/contracheque/web/user-management/auth/login",
    "ativo": true,
    "target_blank": true,
    "cor": "slate",
    "ordem": 2
  }
]'::jsonb;

-- 2. Garantir que o campo tenha um valor padrão para registros existentes
UPDATE public.site_config 
SET header_action_buttons = '[
  {
    "id": "1",
    "texto": "Portal Educacional",
    "link": "/portal",
    "ativo": true,
    "target_blank": false,
    "cor": "primary",
    "ordem": 1
  },
  {
    "id": "2",
    "texto": "Portal do Servidor",
    "link": "https://www.keepinformatica.com.br/contracheque/web/user-management/auth/login",
    "ativo": true,
    "target_blank": true,
    "cor": "slate",
    "ordem": 2
  }
]'::jsonb
WHERE header_action_buttons IS NULL;

-- 3. Adicionar comentário explicando o campo
COMMENT ON COLUMN public.site_config.header_action_buttons IS 'Array JSON com os botões de ação do cabeçalho do site (Portal Educacional, Portal do Servidor, etc.). Estrutura: [{id, texto, link, ativo, target_blank, cor, ordem}]';

-- 4. Verificar se a tabela site_config tem um registro
-- Se não tiver, criar um registro inicial
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.site_config LIMIT 1) THEN
    INSERT INTO public.site_config (
      titulo_principal,
      subtitulo,
      aviso_banner,
      aviso_ativo,
      hero_imagem_url,
      header_action_buttons
    ) VALUES (
      'Educação Pública de Qualidade para Todos',
      'Construindo o futuro da nossa cidade através do ensino integral.',
      '',
      false,
      '',
      '[
        {
          "id": "1",
          "texto": "Portal Educacional",
          "link": "/portal",
          "ativo": true,
          "target_blank": false,
          "cor": "primary",
          "ordem": 1
        },
        {
          "id": "2",
          "texto": "Portal do Servidor",
          "link": "https://www.keepinformatica.com.br/contracheque/web/user-management/auth/login",
          "ativo": true,
          "target_blank": true,
          "cor": "slate",
          "ordem": 2
        }
      ]'::jsonb
    );
    
    RAISE NOTICE 'Registro inicial de site_config criado com botões do cabeçalho.';
  ELSE
    RAISE NOTICE 'Tabela site_config já possui um registro. Campo header_action_buttons foi adicionado/atualizado.';
  END IF;
END $$;