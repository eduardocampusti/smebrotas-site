import type { AdminDashboardIndicator, IndicatorDataBlock } from './types'

export const DASHBOARD_INDICATOR_NAMES = [
  'Agricultura Familiar',
  'Alimentação Escolar',
  'Cardápio',
  'EJA',
  'Ensino',
  'FUNDEB',
  'IDEB',
  'Licitações',
  'Matrículas',
  'Transporte Escolar',
] as const

const DEFAULT_ICONS = [
  'eco',
  'restaurant',
  'menu_book',
  'school',
  'cast_for_education',
  'account_balance_wallet',
  'query_stats',
  'gavel',
  'groups',
  'directions_bus',
]

export function createDefaultDashboardIndicators(): AdminDashboardIndicator[] {
  return [...DASHBOARD_INDICATOR_NAMES]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((titulo, index) => ({
      id: `indicator-${index + 1}`,
      titulo,
      descricao: `Dados institucionais de ${titulo.toLowerCase()} para transparência educacional.`,
      badge: 'Atualizado',
      icone: DEFAULT_ICONS[index] || 'analytics',
      ordem: index + 1,
      ativo: true,
    }))
}

export function createDefaultIndicatorDataMap(
  indicators: AdminDashboardIndicator[],
): Record<string, IndicatorDataBlock> {
  const result: Record<string, IndicatorDataBlock> = {}
  indicators.forEach((indicator) => {
    result[indicator.id] = {
      kpis: [
        { id: `${indicator.id}-kpi-1`, label: 'Indicador principal', valor: 'N/A' },
        { id: `${indicator.id}-kpi-2`, label: 'Meta', valor: 'N/A' },
      ],
      graficos: [
        { id: `${indicator.id}-graph-1`, eixo: '2024', valor: '0' },
        { id: `${indicator.id}-graph-2`, eixo: '2025', valor: '0' },
      ],
      tabelasTextos: [
        { id: `${indicator.id}-row-1`, colunaA: 'Item 1', colunaB: 'Valor 1', observacao: '' },
      ],
      textoApoio: `Área de texto de apoio para ${indicator.titulo}.`,
    }
  })

  const ideb = indicators.find((item) => item.titulo === 'IDEB')
  if (ideb) {
    result[ideb.id] = {
      kpis: [
        { id: `${ideb.id}-kpi-1`, label: 'Nota atual', valor: '6,1' },
        { id: `${ideb.id}-kpi-2`, label: 'Meta', valor: '6,4' },
        { id: `${ideb.id}-kpi-3`, label: 'Variação', valor: '+0,3' },
      ],
      graficos: [
        { id: `${ideb.id}-graph-1`, eixo: '2021', valor: '5,6' },
        { id: `${ideb.id}-graph-2`, eixo: '2023', valor: '6,1' },
      ],
      tabelasTextos: [
        { id: `${ideb.id}-row-1`, colunaA: 'Escola A', colunaB: '6,3', observacao: 'Comparativo por escola' },
      ],
      textoApoio: 'Evolução histórica e comparativo por escola.',
    }
  }

  return result
}
