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
        { id: `${indicator.id}-kpi-1`, label: `Resumo de ${indicator.titulo}`, valor: 'Não informado' },
        { id: `${indicator.id}-kpi-2`, label: 'Meta ou referência', valor: 'Não informado' },
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
        { id: `${ideb.id}-kpi-2`, label: 'Meta ou referência', valor: '6,4' },
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

  const matriculas = indicators.find((item) => item.titulo === 'Matrículas')
  if (matriculas) {
    result[matriculas.id] = {
      ...result[matriculas.id],
      matriculas: {
        resumo: [
          { id: `${matriculas.id}-resumo-1`, label: 'Total de matrículas', valor: 'Não informado' },
          { id: `${matriculas.id}-resumo-2`, label: 'Vagas disponíveis', valor: 'Não informado' },
          { id: `${matriculas.id}-resumo-3`, label: 'Taxa de ocupação', valor: 'Não informado' },
          { id: `${matriculas.id}-resumo-4`, label: 'Matrículas em Educação Especial', valor: 'Não informado' },
          { id: `${matriculas.id}-resumo-5`, label: 'Ano de referência', valor: 'Não informado' },
          { id: `${matriculas.id}-resumo-6`, label: 'Fonte dos dados', valor: 'Não informado' },
          { id: `${matriculas.id}-resumo-7`, label: 'Data de atualização', valor: 'Não informado' },
        ],
        etapas: [
          { id: `${matriculas.id}-etapa-1`, label: 'Creche', valor: 'Não informado' },
          { id: `${matriculas.id}-etapa-2`, label: 'Pré-escola', valor: 'Não informado' },
          { id: `${matriculas.id}-etapa-3`, label: 'Anos Iniciais', valor: 'Não informado' },
          { id: `${matriculas.id}-etapa-4`, label: 'Anos Finais', valor: 'Não informado' },
          { id: `${matriculas.id}-etapa-5`, label: 'EJA', valor: 'Não informado' },
          { id: `${matriculas.id}-etapa-6`, label: 'Educação Especial', valor: 'Não informado' },
        ],
        evolucao: [{ id: `${matriculas.id}-evolucao-1`, label: '2025', valor: 'Não informado' }],
        localizacao: [
          { id: `${matriculas.id}-loc-1`, label: 'Urbana', valor: 'Não informado' },
          { id: `${matriculas.id}-loc-2`, label: 'Rural', valor: 'Não informado' },
        ],
        fonte: {
          fonte: 'Não informado',
          anoReferencia: 'Não informado',
          dataAtualizacao: 'Não informado',
          link: '',
        },
      },
    }
  }

  const eja = indicators.find((item) => item.titulo === 'EJA')
  if (eja) {
    result[eja.id] = {
      ...result[eja.id],
      eja: {
        evolucaoManual: [
          { id: `${eja.id}-eja-2010`, ano: '2010', urbana: '104', rural: '39' },
          { id: `${eja.id}-eja-2020`, ano: '2020', urbana: '103', rural: '0' },
          { id: `${eja.id}-eja-2023`, ano: '2023', urbana: '128', rural: '0' },
          { id: `${eja.id}-eja-2024`, ano: '2024', urbana: '116', rural: '0' },
          { id: `${eja.id}-eja-2025`, ano: '2025', urbana: '86', rural: '59' },
        ],
        fonte: {
          fonte: 'QEdu/Censo Escolar Inep — Escolas públicas de Brotas de Macaúbas',
          anoReferencia: '2025',
          dataAtualizacao: '2025-01-01',
          link: '',
        },
      },
      textoApoio: 'Preenchimento manual da EJA. Salve as alterações e publique no site.',
    }
  }

  return result
}
