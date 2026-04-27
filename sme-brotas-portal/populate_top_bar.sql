-- === SCRIPT PARA GARANTIR QUE A BARRA SUPERIOR (TOP BAR) TENHA DADOS ===
-- Este script verifica e popula os dados da barra superior azul no banco

-- 1. Verificar se o campo top_bar_items existe na tabela site_config
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_config' 
    AND table_schema = 'public' 
    AND column_name = 'top_bar_items'
  ) THEN
    RAISE NOTICE 'Adicionando campo top_bar_items à tabela site_config...';
    
    ALTER TABLE public.site_config 
    ADD COLUMN top_bar_items JSONB DEFAULT '[
      {
        "id": "1",
        "texto": "Ouvidoria",
        "icone": "hearing",
        "link": "https://ouvidoria.sp.gov.br",
        "target_blank": true,
        "ativo": true,
        "ordem": 1
      },
      {
        "id": "2",
        "texto": "Diário Oficial",
        "icone": "description",
        "link": "https://diariooficial.imprensaoficial.com.br",
        "target_blank": true,
        "ativo": true,
        "ordem": 2
      },
      {
        "id": "3",
        "texto": "Acesso à Informação",
        "icone": "info",
        "link": "/acesso-a-informacao",
        "target_blank": false,
        "ativo": true,
        "ordem": 3
      },
      {
        "id": "4",
        "texto": "LGPD",
        "icone": "shield",
        "link": "/lgpd",
        "target_blank": false,
        "ativo": true,
        "ordem": 4
      },
      {
        "id": "5",
        "texto": "Governo Digital",
        "icone": "computer",
        "link": "https://www.sp.gov.br/governo-digital",
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
      }
    ]'::jsonb;
    
    RAISE NOTICE 'Campo top_bar_items adicionado com sucesso!';
  ELSE
    RAISE NOTICE 'Campo top_bar_items já existe.';
  END IF;
END $$;

-- 2. Verificar se existe registro na tabela site_config
-- Se não existir, criar um registro inicial
DO $$
DECLARE
  config_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO config_count FROM public.site_config;
  
  IF config_count = 0 THEN
    RAISE NOTICE 'Criando registro inicial de site_config com barra superior...';
    
    INSERT INTO public.site_config (
      titulo_principal,
      subtitulo,
      aviso_banner,
      aviso_ativo,
      hero_imagem_url,
      hero_botao_primario,
      hero_botao_secundario,
      hero_overlay_opacidade,
      acesso_rapido_titulo,
      acessos_rapidos,
      noticias_secao_titulo,
      noticias_secao_link_texto,
      estatisticas_titulo,
      estatisticas,
      acesso_perfil_titulo,
      acessos_perfil,
      rodape_texto,
      rodape_endereco,
      rodape_telefone,
      rodape_email,
      rodape_links_uteis,
      rodape_redes_sociais,
      header_action_buttons,
      top_bar_items,
      transparencia_config
    ) VALUES (
      'Educação Pública de Qualidade para Todos',
      'Construindo o futuro da nossa cidade através do ensino integral.',
      '',
      false,
      '',
      NULL,
      NULL,
      0.3,
      'Acesso Rápido',
      '[]'::jsonb,
      'Últimas Notícias',
      'Ver todas',
      'Números da Educação em Brotas',
      '{"escolas": 12, "alunos": 4500, "professores": 280}'::jsonb,
      'Serviços por Perfil',
      '[]'::jsonb,
      '',
      'Av. da Educação, 123 - Centro, Brotas - SP, CEP 00.000-000',
      '(14) 3333-0000',
      'contato@smebrotas.sp.gov.br',
      '[]'::jsonb,
      '{}',
      '[]'::jsonb,
      '[
        {
          "id": "1",
          "texto": "Ouvidoria",
          "icone": "hearing",
          "link": "https://ouvidoria.sp.gov.br",
          "target_blank": true,
          "ativo": true,
          "ordem": 1
        },
        {
          "id": "2",
          "texto": "Diário Oficial",
          "icone": "description",
          "link": "https://diariooficial.imprensaoficial.com.br",
          "target_blank": true,
          "ativo": true,
          "ordem": 2
        },
        {
          "id": "3",
          "texto": "Acesso à Informação",
          "icone": "info",
          "link": "/acesso-a-informacao",
          "target_blank": false,
          "ativo": true,
          "ordem": 3
        },
        {
          "id": "4",
          "texto": "LGPD",
          "icone": "shield",
          "link": "/lgpd",
          "target_blank": false,
          "ativo": true,
          "ordem": 4
        },
        {
          "id": "5",
          "texto": "Governo Digital",
          "icone": "computer",
          "link": "https://www.sp.gov.br/governo-digital",
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
        }
      ]'::jsonb,
      NULL
    );
    
    RAISE NOTICE 'Registro inicial criado com barra superior!';
  END IF;
END $$;

-- 3. Atualizar registros existentes para garantir que tenham top_bar_items
UPDATE public.site_config 
SET top_bar_items = '[
  {
    "id": "1",
    "texto": "Ouvidoria",
    "icone": "hearing",
    "link": "https://ouvidoria.sp.gov.br",
    "target_blank": true,
    "ativo": true,
    "ordem": 1
  },
  {
    "id": "2",
    "texto": "Diário Oficial",
    "icone": "description",
    "link": "https://diariooficial.imprensaoficial.com.br",
    "target_blank": true,
    "ativo": true,
    "ordem": 2
  },
  {
    "id": "3",
    "texto": "Acesso à Informação",
    "icone": "info",
    "link": "/acesso-a-informacao",
    "target_blank": false,
    "ativo": true,
    "ordem": 3
  },
  {
    "id": "4",
    "texto": "LGPD",
    "icone": "shield",
    "link": "/lgpd",
    "target_blank": false,
    "ativo": true,
    "ordem": 4
  },
  {
    "id": "5",
    "texto": "Governo Digital",
    "icone": "computer",
    "link": "https://www.sp.gov.br/governo-digital",
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
  }
]'::jsonb
WHERE top_bar_items IS NULL OR top_bar_items = '[]'::jsonb OR top_bar_items = 'null'::jsonb;

-- 4. Verificar o resultado
DO $$
DECLARE
  config_count INTEGER;
  top_bar_count INTEGER;
  first_item TEXT;
BEGIN
  SELECT COUNT(*) INTO config_count FROM public.site_config;
  
  SELECT jsonb_array_length(top_bar_items) INTO top_bar_count
  FROM public.site_config
  WHERE top_bar_items IS NOT NULL
  LIMIT 1;
  
  SELECT top_bar_items->0->'texto' INTO first_item
  FROM public.site_config
  WHERE top_bar_items IS NOT NULL
  LIMIT 1;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
  RAISE NOTICE 'Total de registros em site_config: %', config_count;
  RAISE NOTICE 'Itens na barra superior: %', COALESCE(top_bar_count, 0);
  RAISE NOTICE 'Primeiro item: %', COALESCE(first_item, 'N/A');
  RAISE NOTICE '';
  RAISE NOTICE 'A barra superior está configurada!';
END $$;