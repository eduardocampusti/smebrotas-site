export interface Profile {
  id: string
  nome: string
  email: string
  role: 'admin' | 'super_admin'
  created_at: string
}

export interface HeaderActionButton {
  id: string
  texto: string
  link: string
  ativo: boolean
  target_blank: boolean
  cor?: 'primary' | 'slate' // Para manter o visual atual (azul vs escuro)
  ordem: number
}

export interface TopBarItem {
  id: string
  texto: string
  icone: string
  link: string
  target_blank: boolean
  ativo: boolean
  ordem: number
}

export interface NavLinkItem {
  id: string
  label: string
  to: string
  ativo: boolean
  ordem: number
}

export interface SiteConfig {
  id: string
  titulo_principal: string
  subtitulo: string
  aviso_banner: string
  aviso_ativo: boolean
  hero_imagem_url: string
  hero_botao_primario: { texto: string; link: string } | null
  hero_botao_secundario: { texto: string; link: string } | null
  hero_overlay_opacidade: number
  
  acesso_rapido_titulo: string
  acessos_rapidos?: DraggableItem[] // Legado: agora usando tabela acessos_rapidos
  
  noticias_secao_titulo: string
  noticias_secao_link_texto: string

  estatisticas_titulo: string
  estatisticas: NumericIndicatorItem[] | { escolas: number; alunos: number; professores: number } // Legacy fallback
  
  acesso_perfil_titulo: string
  acessos_perfil: DraggableItem[]

  rodape_texto: string
  rodape_endereco: string
  rodape_telefone: string
  rodape_email: string
  rodape_links_uteis: DraggableItem[]
  rodape_redes_sociais: DraggableItem[]
  rodape_links_estaticos: DraggableItem[] // Links estáticos do footer (privacidade, termos, mapa)

  transparencia_config?: {
    titulo_pagina: string
    descricao_pagina: string
    indicadores_titulo: string
    documentos_titulo: string
    atos_oficiais_titulo: string
    atos_oficiais_limite: number
    atos_oficiais_categoria_slug: string
    dados_abertos_url?: string
  }

  header_action_buttons?: HeaderActionButton[]
  nav_links?: NavLinkItem[] // Menu de navegação editável

  updated_at: string
  updated_by: string | null
}

export interface CategoriaTransparencia {
  id: string
  nome: string
  slug: string
  descricao: string | null
  icone: string
  ordem: number
  ativo: boolean
  created_at?: string
  updated_at?: string
}


export interface DraggableItem {
  id: string
  nome: string
  icone?: string
  link?: string
  ordem: number
  ativo: boolean
}

export interface AcessoRapido extends DraggableItem {
  created_at?: string
  updated_at?: string
}

export interface NumericIndicatorItem extends DraggableItem {
  valor: number
}

export interface ContatoInfo {
  id: string
  titulo_pagina: string
  subtitulo_pagina: string
  telefone_geral: string
  telefone_secundario: string | null
  whatsapp: string | null
  email_institucional: string
  email_contato: string | null
  endereco: string
  cep: string
  horario_funcionamento: string
  sede_titulo: string
  endereco_label: string
  telefone_label: string
  whatsapp_label: string
  email_label: string
  setores: Setor[]
  redes_sociais: Record<string, string>
  links_uteis: ContatoLink[]
  mapa_url: string
  mapa_imagem_url: string
  mapa_botao_texto: string
  formulario_titulo: string
  formulario_assuntos: string[]
  formulario_placeholder_mensagem: string
  formulario_botao_texto: string
  formulario_mensagem_sucesso: string
  faq_titulo: string
  faq_subtitulo: string
  updated_at: string
  updated_by: string | null
}

export interface Setor {
  nome: string
  telefone: string
  email: string
  icone: string
  ativo: boolean
}

export interface ContatoLink {
  titulo: string
  url: string
  ativo: boolean
}

export interface Noticia {
  id: string
  titulo: string
  slug: string
  resumo: string
  conteudo: string
  categoria: string
  imagem_url: string | null
  status: 'rascunho' | 'publicado' | 'arquivado'
  destaque: boolean
  data_publicacao: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Faq {
  id: string
  pergunta: string
  resposta: string
  ordem: number
  ativo: boolean
  created_at: string
}

export const MODALIDADES_ENSINO = [
  'Educação Infantil',
  'Ensino Fundamental I',
  'Ensino Fundamental II',
  'EJA',
  'Educação Especial',
  'Ensino Médio'
]

export interface EscolasPageConfig {
  id: string
  titulo: string
  subtitulo: string
  placeholder_busca: string
  filtros_visiveis: string[]
  ordenacao_padrao: 'ordem' | 'nome_asc' | 'nome_desc' | 'recentes'
  cards_por_pagina: number
  contador_texto: string
  updated_at: string
  updated_by: string | null
}

export interface Escola {
  id: string
  nome: string
  slug: string
  modalidade: string // Legado: será preenchido com a primeira opção de tipos_ensino para compatibilidade
  tipos_ensino: string[]
  imagem_url: string | null
  endereco: string // Legado: será preenchido com o endereço completo formatado
  
  // Endereço Estruturado
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string

  telefone: string
  email: string
  descricao_curta: string
  descricao_completa?: string
  infos_institucionais?: string
  observacoes?: string
  contato_complementar?: string
  
  // Gestão e Detalhes
  gestor_responsavel?: string
  horarios?: {
    manha?: string | { inicio: string; fim: string }
    tarde?: string | { inicio: string; fim: string }
    noite?: string | { inicio: string; fim: string }
  }
  coordenadas?: {
    lat: number | null
    lng: number | null
  }
  galeria?: string[]
  links_uteis?: Array<{ titulo: string; url: string }>
  
  status: boolean
  ordem: number
  destaque: boolean
  nota_ideb?: number
  tipo: 'real' | 'demo' | 'exemplo'
  
  instagram_url?: string | null
  facebook_url?: string | null
  
  created_at?: string
  updated_at?: string
  created_by?: string | null
}

export interface SobreConfig {
  id: string
  hero_title: string
  hero_subtitle: string
  hero_banner_url: string
  hero_banner_text: string
  intro_title: string
  intro_text: string
  mission: string
  vision: string
  values: string[]
  management_team: Array<{
    id: string
    name: string
    role: string
    photo_url: string
    order: number
  }>
  updated_at?: string
}

export interface Servico {
  id: string
  titulo: string
  slug: string
  resumo: string
  descricao: string | null
  publico_alvo: string | null
  como_solicitar: string | null
  documentos: string | null
  prazo: string | null
  canal_atendimento: string | null
  link_externo: string | null
  texto_link: string | null
  icone: string
  ordem: number
  ativo: boolean
  destaque: boolean
  created_at?: string
  updated_at?: string
  created_by?: string | null
}

export interface Programa {
  id: string
  titulo: string
  slug: string
  resumo: string
  descricao: string | null
  publico_alvo: string | null
  objetivos: string | null
  imagem_url: string | null
  texto_botao: string
  link_botao: string | null
  categoria: string | null
  ordem: number
  ativo: boolean
  destaque: boolean
  created_at?: string
  updated_at?: string
  created_by?: string | null
  desativado_em?: string | null
}

export interface DadoGrafico {
  label: string
  valor: number | string
}

export interface IndicadorTransparencia {
  id: string
  titulo: string
  valor: string
  unidade: string | null
  meta: string | null
  variacao: string | null
  icone: string | null
  tipo_grafico: 'linha' | 'barra' | 'pizza'
  dados_grafico: DadoGrafico[] | null
  arquivos?: { titulo: string, url: string }[] | null
  ordem: number
  ativo: boolean
  ano_referencia: number
  created_at?: string
  updated_at?: string
  desativado_em?: string | null
}

export interface ArquivoTransparencia {
  id: string
  titulo: string
  descricao: string | null
  categoria: string // Agora é dinâmico, referenciando o slug da categoria
  arquivo_url: string
  data_publicacao: string
  numero: string | null
  ordem: number
  ativo: boolean
  created_at?: string
  updated_at?: string
  desativado_em?: string | null
}
