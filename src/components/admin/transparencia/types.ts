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
  matriculas?: MatriculasDataBlock
  eja?: EjaDataBlock
}

export interface MatriculasSimpleItem {
  id: string
  label: string
  valor: string
}

export interface MatriculasDataSource {
  fonte: string
  anoReferencia: string
  dataAtualizacao: string
  link: string
}

export interface MatriculasEvolucaoManualItem {
  id: string
  ano: string
  urbana: string
  rural: string
  educacaoEspecial: string
}

export interface MatriculasDataBlock {
  resumo: MatriculasSimpleItem[]
  etapas: MatriculasSimpleItem[]
  evolucao: MatriculasSimpleItem[]
  evolucaoManual?: MatriculasEvolucaoManualItem[]
  localizacao: MatriculasSimpleItem[]
  fonte: MatriculasDataSource
}

export interface EjaEvolucaoManualItem {
  id: string
  ano: string
  urbana: string
  rural: string
}

export interface EjaDataBlock {
  evolucaoManual: EjaEvolucaoManualItem[]
  fonte: MatriculasDataSource
}
