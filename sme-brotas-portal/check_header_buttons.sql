-- Script para verificar se o campo header_action_buttons existe
EXECUTAR ISSO PRIMEIRO COMO DIAGNÓSTICO

-- 1. Verificar se a tabela site_config existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_config' AND table_schema = 'public') 
    THEN '✅ Tabela site_config existe'
    ELSE '❌ Tabela site_config NÃO existe'
  END as status_tabela;

-- 2. Verificar se o campo header_action_buttons existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'site_config' 
      AND table_schema = 'public' 
      AND column_name = 'header_action_buttons'
    ) 
    THEN '✅ Campo header_action_buttons existe'
    ELSE '❌ Campo header_action_buttons NÃO existe - PRECISA SER CRIADO'
  END as status_campo;

-- 3. Listar todos os campos da tabela site_config
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'site_config' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Contar registros na tabela site_config
SELECT COUNT(*) as total_registros FROM public.site_config;

-- 5. Se tiver registros, mostrar o header_action_buttons
SELECT header_action_buttons FROM public.site_config LIMIT 1;

-- 6. Verificar políticas RLS
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'site_config';