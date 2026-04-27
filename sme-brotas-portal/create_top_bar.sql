-- Adicionar campo top_bar_items à tabela site_config
-- Isso permite configurar a barra superior azul de atalhos rápidos do site

-- 1. Adicionar a coluna top_bar_items
ALTER TABLE public.site_config 
ADD COLUMN IF NOT EXISTS top_bar_items JSONB DEFAULT '[
  {
    "id": "1",
    "texto": "Ouvidoria",
    "icone": "hearing",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 1
  },
  {
    "id": "2",
    "texto": "Diário Oficial",
    "icone": "description",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 2
  },
  {
    "id": "3",
    "texto": "Acesso à Informação",
    "icone": "info",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 3
  },
  {
    "id": "4",
    "texto": "LGPD",
    "icone": "shield",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 4
  },
  {
    "id": "5",
    "texto": "Governo Digital",
    "icone": "computer",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 5
  },
  {
    "id": "6",
    "texto": "Mapa do Site",
    "icone": "map",
    "link": "/mapa-do-site",
    "target_blank": false,
    "ativo": true,
    "ordem": 6
  },
  {
    "id": "7",
    "texto": "Webmail",
    "icone": "mail",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 7
  },
  {
    "id": "8",
    "texto": "Instagram",
    "icone": "photo_camera",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 8
  }
]'::jsonb;

-- 2. Garantir que o campo tenha um valor padrão para registros existentes
UPDATE public.site_config 
SET top_bar_items = '[
  {
    "id": "1",
    "texto": "Ouvidoria",
    "icone": "hearing",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 1
  },
  {
    "id": "2",
    "texto": "Diário Oficial",
    "icone": "description",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 2
  },
  {
    "id": "3",
    "texto": "Acesso à Informação",
    "icone": "info",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 3
  },
  {
    "id": "4",
    "texto": "LGPD",
    "icone": "shield",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 4
  },
  {
    "id": "5",
    "texto": "Governo Digital",
    "icone": "computer",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 5
  },
  {
    "id": "6",
    "texto": "Mapa do Site",
    "icone": "map",
    "link": "/mapa-do-site",
    "target_blank": false,
    "ativo": true,
    "ordem": 6
  },
  {
    "id": "7",
    "texto": "Webmail",
    "icone": "mail",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 7
  },
  {
    "id": "8",
    "texto": "Instagram",
    "icone": "photo_camera",
    "link": "#",
    "target_blank": true,
    "ativo": true,
    "ordem": 8
  }
]'::jsonb
WHERE top_bar_items IS NULL;

-- 3. Adicionar comentário explicando o campo
COMMENT ON COLUMN public.site_config.top_bar_items IS 'Array JSON com os itens da barra superior azul de atalhos rápidos do site. Estrutura: [{id, texto, icone, link, target_blank, ativo, ordem}]';

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
      top_bar_items
    ) VALUES (
      'Educação Pública de Qualidade para Todos',
      'Construindo o futuro da nossa cidade através do ensino integral.',
      '',
      false,
      '',
      '[
        {
          "id": "1",
          "texto": "Ouvidoria",
          "icone": "hearing",
          "link": "#",
          "target_blank": true,
          "ativo": true,
          "ordem": 1
        },
        {
          "id": "2",
          "texto": "Diário Oficial",
          "icone": "description",
          "link": "#",
          "target_blank": true,
          "ativo": true,
          "ordem": 2
        },
        {
          "id": "3",
          "texto": "Acesso à Informação",
          "icone": "info",
          "link": "#",
          "target_blank": true,
          "ativo": true,
          "ordem": 3
        },
        {
          "id": "4",
          "texto": "LGPD",
          "icone": "shield",
          "link": "#",
          "target_blank": true,
          "ativo": true,
          "ordem": 4
        },
        {
          "id": "5",
          "texto": "Governo Digital",
          "icone": "computer",
          "link": "#",
          "target_blank": true,
          "ativo": true,
          "ordem": 5
        },
        {
          "id": "6",
          "texto": "Mapa do Site",
          "icone": "map",
          "link": "/mapa-do-site",
          "target_blank": false,
          "ativo": true,
          "ordem": 6
        },
        {
          "id": "7",
          "texto": "Webmail",
          "icone": "mail",
          "link": "#",
          "target_blank": true,
          "ativo": true,
          "ordem": 7
        },
        {
          "id": "8",
          "texto": "Instagram",
          "icone": "photo_camera",
          "link": "#",
          "target_blank": true,
          "ativo": true,
          "ordem": 8
        }
      ]'::jsonb
    );
    
    RAISE NOTICE 'Registro inicial de site_config criado com barra superior.';
  ELSE
    RAISE NOTICE 'Tabela site_config já possui um registro. Campo top_bar_items foi adicionado/atualizado.';
  END IF;
END $$;