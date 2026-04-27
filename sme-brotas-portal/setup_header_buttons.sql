-- === SCRIPT PARA CONFIGURAR BOTÕES DO CABEÇALHO ===
-- Este script adiciona a funcionalidade de gerenciar os botões do topo do site (Portal Educacional, Portal do Servidor)

-- 1. Verificar se a tabela site_config existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_config' AND table_schema = 'public') THEN
    RAISE NOTICE 'Criando tabela site_config porque ela não existe...';
    
    CREATE TABLE public.site_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        titulo_principal TEXT NOT NULL DEFAULT 'Educação Pública de Qualidade para Todos',
        subtitulo TEXT DEFAULT 'Construindo o futuro da nossa cidade através do ensino integral.',
        aviso_banner TEXT DEFAULT '',
        aviso_ativo BOOLEAN DEFAULT FALSE,
        hero_imagem_url TEXT DEFAULT '',
        hero_botao_primario JSONB DEFAULT NULL,
        hero_botao_secundario JSONB DEFAULT NULL,
        hero_overlay_opacidade NUMERIC DEFAULT 0.3,
        acesso_rapido_titulo TEXT DEFAULT 'Acesso Rápido',
        acessos_rapidos JSONB DEFAULT '[]'::jsonb,
        noticias_secao_titulo TEXT DEFAULT 'Últimas Notícias',
        noticias_secao_link_texto TEXT DEFAULT 'Ver todas',
        estatisticas_titulo TEXT DEFAULT 'Números da Educação em Brotas',
        estatisticas JSONB DEFAULT '{"escolas": 12, "alunos": 4500, "professores": 280}'::jsonb,
        acesso_perfil_titulo TEXT DEFAULT 'Serviços por Perfil',
        acessos_perfil JSONB DEFAULT '[]'::jsonb,
        rodape_texto TEXT DEFAULT '',
        rodape_endereco TEXT DEFAULT '',
        rodape_telefone TEXT DEFAULT '',
        rodape_email TEXT DEFAULT '',
        rodape_links_uteis JSONB DEFAULT '[]'::jsonb,
        rodape_redes_sociais JSONB DEFAULT '{}'::jsonb,
        header_action_buttons JSONB DEFAULT '[]'::jsonb,
        transparencia_config JSONB DEFAULT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        updated_by UUID
    );
    
    RAISE NOTICE 'Tabela site_config criada com sucesso.';
  ELSE
    RAISE NOTICE 'Tabela site_config já existe.';
  END IF;
END $$;

-- 2. Adicionar campo header_action_buttons à tabela site_config (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_config' 
    AND table_schema = 'public' 
    AND column_name = 'header_action_buttons'
  ) THEN
    RAISE NOTICE 'Adicionando campo header_action_buttons à tabela site_config...';
    
    ALTER TABLE public.site_config 
    ADD COLUMN header_action_buttons JSONB DEFAULT '[]'::jsonb;
    
    RAISE NOTICE 'Campo header_action_buttons adicionado com sucesso.';
  ELSE
    RAISE NOTICE 'Campo header_action_buttons já existe na tabela site_config.';
  END IF;
END $$;

-- 3. Adicionar campos necessários para o restante do site_config (campos que podem estar faltando)
DO $$
BEGIN
  -- Verificar e adicionar hero_botao_primario
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_config' 
    AND table_schema = 'public' 
    AND column_name = 'hero_botao_primario'
  ) THEN
    ALTER TABLE public.site_config 
    ADD COLUMN hero_botao_primario JSONB DEFAULT NULL;
    RAISE NOTICE 'Campo hero_botao_primario adicionado.';
  END IF;
  
  -- Verificar e adicionar hero_botao_secundario
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_config' 
    AND table_schema = 'public' 
    AND column_name = 'hero_botao_secundario'
  ) THEN
    ALTER TABLE public.site_config 
    ADD COLUMN hero_botao_secundario JSONB DEFAULT NULL;
    RAISE NOTICE 'Campo hero_botao_secundario adicionado.';
  END IF;
  
  -- Verificar e adicionar hero_overlay_opacidade
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_config' 
    AND table_schema = 'public' 
    AND column_name = 'hero_overlay_opacidade'
  ) THEN
    ALTER TABLE public.site_config 
    ADD COLUMN hero_overlay_opacidade NUMERIC DEFAULT 0.3;
    RAISE NOTICE 'Campo hero_overlay_opacidade adicionado.';
  END IF;
  
  -- Verificar e adicionar acesso_rapido_titulo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_config' 
    AND table_schema = 'public' 
    AND column_name = 'acesso_rapido_titulo'
  ) THEN
    ALTER TABLE public.site_config 
    ADD COLUMN acesso_rapido_titulo TEXT DEFAULT 'Acesso Rápido';
    RAISE NOTICE 'Campo acesso_rapido_titulo adicionado.';
  END IF;
  
  -- Verificar e adicionar acessos_perfil
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_config' 
    AND table_schema = 'public' 
    AND column_name = 'acessos_perfil'
  ) THEN
    ALTER TABLE public.site_config 
    ADD COLUMN acessos_perfil JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Campo acessos_perfil adicionado.';
  END IF;
  
  -- Verificar e adicionar acesso_perfil_titulo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_config' 
    AND table_schema = 'public' 
    AND column_name = 'acesso_perfil_titulo'
  ) THEN
    ALTER TABLE public.site_config 
    ADD COLUMN acesso_perfil_titulo TEXT DEFAULT 'Serviços por Perfil';
    RAISE NOTICE 'Campo acesso_perfil_titulo adicionado.';
  END IF;
  
  -- Verificar e adicionar transparencia_config
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_config' 
    AND table_schema = 'public' 
    AND column_name = 'transparencia_config'
  ) THEN
    ALTER TABLE public.site_config 
    ADD COLUMN transparencia_config JSONB DEFAULT NULL;
    RAISE NOTICE 'Campo transparencia_config adicionado.';
  END IF;
END $$;

-- 4. Garantir que há um registro inicial de site_config com os botões do cabeçalho
DO $$
DECLARE
  config_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO config_count FROM public.site_config;
  
  IF config_count = 0 THEN
    RAISE NOTICE 'Criando registro inicial de site_config com botões do cabeçalho...';
    
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
      '{"instagram": "", "facebook": "", "youtube": "", "whatsapp": ""}'::jsonb,
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
      ]'::jsonb,
      NULL
    );
    
    RAISE NOTICE 'Registro inicial criado com sucesso!';
  ELSE
    RAISE NOTICE 'Tabela site_config já tem % registros. Atualizando header_action_buttons se necessário...', config_count;
    
    -- Atualizar registros que não têm header_action_buttons definidos
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
    WHERE header_action_buttons IS NULL OR header_action_buttons = '[]'::jsonb;
    
    RAISE NOTICE 'Botões do cabeçalho atualizados onde necessário.';
  END IF;
END $$;

-- 5. Habilitar RLS na tabela site_config e configurar políticas
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 6. remover políticas antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "site_config_select" ON public.site_config;
DROP POLICY IF EXISTS "site_config_update" ON public.site_config;
DROP POLICY IF EXISTS "site_config_insert" ON public.site_config;
DROP POLICY IF EXISTS "site_config_delete" ON public.site_config;

-- 7. Criar novas políticas de segurança
-- Políticas de leitura (público)
CREATE POLICY "site_config_select_public" ON public.site_config
    FOR SELECT USING (true);

-- Políticas de escrita (apenas admins autenticados)
CREATE POLICY "site_config_insert" ON public.site_config
    FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "site_config_update" ON public.site_config
    FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 8. Adicionar comentário explicativo
COMMENT ON COLUMN public.site_config.header_action_buttons IS 'Array JSON com os botões de ação do cabeçalho do site (Portal Educacional, Portal do Servidor, etc.). Estrutura: [{id, texto, link, ativo, target_blank, cor, ordem}]';

-- 9. Verificação final
DO $$
DECLARE
  config_count INTEGER;
  header_buttons_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO config_count FROM public.site_config;
  
  SELECT jsonb_array_length(header_action_buttons) INTO header_buttons_count
  FROM public.site_config
  WHERE header_action_buttons IS NOT NULL
  LIMIT 1;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== CONFIGURAÇÃO CONCLUÍDA ===';
  RAISE NOTICE 'Registros de site_config: %', config_count;
  RAISE NOTICE 'Botões do cabeçalho configurados: %', COALESCE(header_buttons_count, 0);
  RAISE NOTICE '';
  RAISE NOTICE 'Agora você pode:';
  RAISE NOTICE '1. Acessar /admin/config para gerenciar os botões';
  RAISE NOTICE '2. Editar título, link, cor e ativação de cada botão';
  RAISE NOTICE '3. Ocultar/exibir botões via toggle';
  RAISE NOTICE '4. Reordenar os botões via setas';
END $$;