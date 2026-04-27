# 📘 Guia para Configurar a TopBar no Banco de Dados

## 🎯 Situação Atual

✅ TopBar está **funcionando** no site público (usando dados temporários hardcoded)

⚠️ Banco de dados **não tem a estrutura criada** (tabela `top_bar_items` não existe)

## 📝 Como Fixar o Banco de Dados

### Opção 1: Executar SQL via Dashboard (Recomendado)

1. **Abra o Dashboard do Supabase**
   - Acesse: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Navegue até o SQL Editor**
   - No menu lateral, clique em "SQL Editor"

3. **Crie uma nova query**
   - Clique em "New Query"

4. **Copie e cole o código abaixo**
   ```sql
   -- === CRIAR ESTRUTURA COMPLETA DA TOPBAR ===
   
   -- 1. Criar função de atualização de timestamp
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.updated_at = timezone('utc'::text, now());
       RETURN NEW;
   END;
   $$ language 'plpgsql';
   
   -- 2. Criar tabela top_bar_items
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
   
   -- 3. Habilitar RLS (Row Level Security)
   ALTER TABLE public.top_bar_items ENABLE ROW LEVEL SECURITY;
   
   -- 4. Criar políticas de acesso
   CREATE POLICY "Top Bar visível por todos" ON public.top_bar_items
       FOR SELECT USING (true);
   
   CREATE POLICY "Admins podem inserir itens da barra superior" ON public.top_bar_items
       FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   CREATE POLICY "Admins podem atualizar itens da barra superior" ON public.top_bar_items
       FOR UPDATE USING (auth.role() = 'authenticated');
   
   CREATE POLICY "Admins podem deletar itens da barra superior" ON public.top_bar_items
       FOR DELETE USING (auth.role() = 'authenticated');
   
   -- 5. Criar trigger para auto-updated_at
   CREATE TRIGGER update_top_bar_items_updated_at
       BEFORE UPDATE ON public.top_bar_items
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();
   
   -- 6. Inserir dados iniciais
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
   ```

5. **Execute o SQL**
   - Clique em "Run" (ícone ▶️) no canto superior direito

6. **Verifique o resultado**
   - Na tabela "top_bar_items" (em Database > Tables), você deve ver 8 itens

### Opção 2: Via CLI Supabase (Requer Banco Local)

Execute no terminal:
```bash
cd sme-brotas-portal
npx supabase db query --file complete_topbar_setup.sql
```

## ✅ Após Executar o SQL

1. **Recarregue a página** (F5)
2. **Abra o console do navegador** (F12)
3. **Verifique o log**:
   - Se vir `✅ TopBar - Dados da tabela top_bar_items: 8 itens` → Banco configurado!
   - Se ainda vir erro → Verifique as políticas RLS

## 🔧 Configuração do Admin

A ConfigPage (painel `/admin`) usa atualmente o campo `site_config.top_bar_items`.

**Para usar a tabela:** A ConfigPage precisa ser atualizada (tarefa futura).

Por enquanto, você pode gerenciar os itens diretamente no Dashboard do Supabase.

## 📊 Estrutura da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `texto` | TEXT | Texto do link (ex: "Ouvidoria") |
| `icone` | TEXT | Nome do ícone (ex: "hearing") |
| `link` | TEXT | URL do link (ex: "#" ou "https://...") |
| `target_blank` | BOOLEAN | Abrir em nova aba |
| `ativo` | BOOLEAN | Mostrar/ocultar no site |
| `ordem` | INTEGER | Ordem de exibição |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de última atualização |

## 🎨 Ícones Disponíveis

Use nomes de ícones do [Material Symbols](https://fonts.google.com/icons):

- `hearing` - Ouvidoria
- `description` - Diário Oficial
- `info` - Acesso à Informação
- `shield` - Proteção de Dados
- `computer` - Governo Digital
- `map` - Mapa do Site
- `mail` - Webmail/Email
- `photo_camera` - Instagram/Camera

## ❓ Dúvidas

Se o SQL não funcionar:
1. Verifique se você tem permissões de admin no Supabase
2. Verifique se o projeto está conectado corretamente (VITE_SUPABASE_URL)
3. Verifique as políticas RLS na aba "Policies" da tabela