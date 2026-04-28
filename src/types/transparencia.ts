export type TransparenciaIndicadorSlug =
  | 'agricultura'
  | 'alimentacao'
  | 'cardapio'
  | 'eja'
  | 'ensino'
  | 'fundeb'
  | 'ideb'
  | 'licitacoes'
  | 'matriculas'
  | 'transporte'

export interface TransparenciaIndicadorCard {
  id: string
  slug: TransparenciaIndicadorSlug
  titulo: string
  descricao: string
  icone: string
  badge: string
  ativo: boolean
  ordem: number
  updated_at: string
}

export interface TransparenciaKpiItem {
  id: string
  indicador_slug: TransparenciaIndicadorSlug
  label: string
  value: string
  hint?: string
  ordem: number
  ativo: boolean
}

export type TransparenciaChartType = 'line' | 'bar' | 'pie'

export interface TransparenciaChartSeries {
  id: string
  indicador_slug: TransparenciaIndicadorSlug
  chart_key: string
  chart_type: TransparenciaChartType
  titulo: string
  ordem: number
  ativo: boolean
}

export interface TransparenciaChartPoint {
  id: string
  series_id: string
  x_label: string
  y_value_num?: number | null
  y_value_text?: string | null
  ordem: number
}

export interface TransparenciaTableColumn {
  id: string
  key: string
  header: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface TransparenciaTableRow {
  id: string
  cells: Record<string, string | number | null>
  ordem: number
  ativo: boolean
}

export interface TransparenciaTableBlock {
  id: string
  indicador_slug: TransparenciaIndicadorSlug
  titulo: string
  descricao?: string
  colunas: TransparenciaTableColumn[]
  linhas: TransparenciaTableRow[]
  ordem: number
  ativo: boolean
}

export interface TransparenciaIndicadorData {
  card: TransparenciaIndicadorCard
  kpis: TransparenciaKpiItem[]
  series: Array<{
    meta: TransparenciaChartSeries
    pontos: TransparenciaChartPoint[]
  }>
  tabelas: TransparenciaTableBlock[]
}

export interface AdminTransparenciaState {
  indicadores: TransparenciaIndicadorCard[]
  indicadorSelecionado?: TransparenciaIndicadorSlug
  indicadorData?: TransparenciaIndicadorData
  loading: boolean
  saving: boolean
  erro?: string | null
}

