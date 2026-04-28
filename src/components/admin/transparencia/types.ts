export interface AdminDashboardIndicator {
  id: string
  titulo: string
  descricao: string
  badge: string
  icone: string
  ordem: number
  ativo: boolean
}

export interface IndicatorKpiItem {
  id: string
  label: string
  valor: string
}

export interface IndicatorChartPoint {
  id: string
  eixo: string
  valor: string
}

export interface IndicatorTableRow {
  id: string
  colunaA: string
  colunaB: string
  observacao?: string
}

export interface IndicatorDataBlock {
  kpis: IndicatorKpiItem[]
  graficos: IndicatorChartPoint[]
  tabelasTextos: IndicatorTableRow[]
  textoApoio: string
}
