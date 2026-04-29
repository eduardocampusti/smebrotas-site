import {
  BookOpen,
  Bus,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  Leaf,
  type LucideIcon,
  TrendingUp,
  UserPlus,
  UtensilsCrossed,
} from 'lucide-react'

import type { KpiItem, TransparenciaTabConfig } from '@/components/transparencia/types'
import { transparenciaTabs } from '@/components/transparencia/mockData'
import {
  aggregateLocationFromRows,
  buildPorEtapaOrdenado,
  matriculaLinhaToAggregationRow,
} from '@/services/transparencia/matriculasDataHelpers'
import type {
  MatriculasImportacaoRecord,
  MatriculasLinhaRecord,
} from '@/services/transparencia/matriculasImportacaoService'
import type { EjaImportacaoRecord, EjaLinhaRecord } from '@/services/transparencia/ejaImportacaoService'
import type {
  TransparenciaChartPoint,
  TransparenciaChartSeries,
  TransparenciaIndicadorCard,
  TransparenciaIndicadorData,
  TransparenciaIndicadorSlug,
  TransparenciaKpiItem,
  TransparenciaTableBlock,
} from '@/types/transparencia'

const iconMap: Record<string, LucideIcon> = {
  leaf: Leaf,
  utensils: UtensilsCrossed,
  clipboard: ClipboardList,
  graduation: GraduationCap,
  book: BookOpen,
  dollar: DollarSign,
  trending: TrendingUp,
  file: FileText,
  userplus: UserPlus,
  bus: Bus,
}

const defaultIconBySlug: Record<TransparenciaIndicadorSlug, string> = {
  agricultura: 'leaf',
  alimentacao: 'utensils',
  cardapio: 'clipboard',
  eja: 'graduation',
  ensino: 'book',
  fundeb: 'dollar',
  ideb: 'trending',
  licitacoes: 'file',
  matriculas: 'userplus',
  transporte: 'bus',
}

const fallbackBadgeBySlug: Record<TransparenciaIndicadorSlug, string> = {
  agricultura: 'PNAE',
  alimentacao: 'Refeicoes',
  cardapio: 'Semanal',
  eja: 'Modalidade',
  ensino: 'Fluxo',
  fundeb: 'Financas',
  ideb: 'Metas',
  licitacoes: 'Processos',
  matriculas: 'Totais',
  transporte: 'Rotas',
}

export function mapIndicadorCardToPublic(card: TransparenciaIndicadorCard): TransparenciaTabConfig {
  const icon = iconMap[card.icone] ?? TrendingUp
  return {
    id: card.slug,
    label: card.titulo,
    icon,
    colorClass: 'text-blue-600',
    description: card.descricao,
    supportText: card.badge || 'Indicador',
  }
}

export function mapKpisToPublic(kpis: TransparenciaKpiItem[]): KpiItem[] {
  return kpis
    .filter((item) => item.ativo)
    .sort((a, b) => a.ordem - b.ordem)
    .map((item) => ({
      label: item.label,
      value: item.value,
      hint: item.hint,
    }))
}

export function mapSeriesToChartData(
  series: TransparenciaChartSeries,
  points: TransparenciaChartPoint[],
): Array<{ label: string; value: number | string }> {
  return points
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((point) => ({
      label: point.x_label,
      value:
        series.chart_type === 'pie'
          ? (point.y_value_num ?? point.y_value_text ?? 0)
          : (point.y_value_num ?? point.y_value_text ?? 0),
    }))
}

export function mapTableToPublic(table: TransparenciaTableBlock) {
  return {
    title: table.titulo,
    description: table.descricao,
    columns: table.colunas,
    rows: table.linhas
      .filter((row) => row.ativo)
      .sort((a, b) => a.ordem - b.ordem),
  }
}

export function buildIndicadorDataFallback(slug: TransparenciaIndicadorSlug): TransparenciaIndicadorData {
  const source = transparenciaTabs.find((item) => item.id === slug)
  const now = new Date().toISOString()
  const card: TransparenciaIndicadorCard = {
    id: `fallback-${slug}`,
    slug,
    titulo: source?.label ?? slug.toUpperCase(),
    descricao: source?.description ?? 'Indicador educacional',
    icone: defaultIconBySlug[slug],
    badge: fallbackBadgeBySlug[slug],
    ativo: true,
    ordem: transparenciaTabs.findIndex((item) => item.id === slug) + 1,
    updated_at: now,
  }

  return {
    card,
    kpis: [],
    series: [],
    tabelas: [],
  }
}

export interface MatriculasTabPublicData {
  kpisPrincipais: KpiItem[]
  porEtapaOrdenado: Array<{ etapa: string; quantidade: number }>
  composicaoImportacao: Array<{ name: string; value: number }>
  evolucaoAnual: Array<{ ano: string; totalGeral: number; urbana: number; rural: number; educacaoEspecial: number }>
  podeExibirEvolucaoAnual: boolean
  localizacao: {
    visivel: boolean
    serie?: Array<{ name: string; value: number }>
  }
  rodape: {
    fonte: string
    anoReferencia: string
    dataAtualizacao: string
    statusLabel: string
  }
  mostrarAvisoDemonstrativo: boolean
}

function formatNumberPtBr(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function formatDataAtualizacaoRodape(value: string | null): string {
  if (!value?.trim()) return '—'
  const parsed = Date.parse(value)
  if (!Number.isNaN(parsed)) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(parsed))
  }
  return value.trim()
}

export function mapMatriculasImportacaoToPublicTab(
  importacao: MatriculasImportacaoRecord,
  linhas: MatriculasLinhaRecord[],
): MatriculasTabPublicData {
  const rows = linhas.map(matriculaLinhaToAggregationRow)
  const porEtapaOrdenado = buildPorEtapaOrdenado(rows)

  const composicaoImportacao = [
    { name: 'Infantil + Fundamental', value: importacao.total_infantil_fundamental },
    { name: 'EJA', value: importacao.total_eja },
    { name: 'AEE / Educação Especial', value: importacao.total_aee_educacao_especial },
  ]

  const evolucaoLocalizacao = linhas.filter((linha) => linha.tipo_registro === 'evolucao_localizacao')
  const evolucaoEspecial = linhas.filter((linha) => linha.tipo_registro === 'evolucao_educacao_especial')
  const hasEvolucaoManual = evolucaoLocalizacao.length > 0 || evolucaoEspecial.length > 0

  const evolucaoAnualMap = new Map<string, { urbana: number; rural: number; educacaoEspecial: number; totalGeral: number }>()
  if (hasEvolucaoManual) {
    for (const linha of evolucaoLocalizacao) {
      const ano = String(linha.ano)
      const bucket = evolucaoAnualMap.get(ano) ?? { urbana: 0, rural: 0, educacaoEspecial: 0, totalGeral: 0 }
      if ((linha.localizacao ?? '').toLowerCase() === 'urbana') bucket.urbana += linha.quantidade
      if ((linha.localizacao ?? '').toLowerCase() === 'rural') bucket.rural += linha.quantidade
      bucket.totalGeral = bucket.urbana + bucket.rural
      evolucaoAnualMap.set(ano, bucket)
    }
    for (const linha of evolucaoEspecial) {
      const ano = String(linha.ano)
      const bucket = evolucaoAnualMap.get(ano) ?? { urbana: 0, rural: 0, educacaoEspecial: 0, totalGeral: 0 }
      bucket.educacaoEspecial += linha.quantidade
      bucket.totalGeral = bucket.urbana + bucket.rural
      evolucaoAnualMap.set(ano, bucket)
    }
  } else {
    for (const linha of linhas) {
      const ano = String(linha.ano)
      const bucket = evolucaoAnualMap.get(ano) ?? { urbana: 0, rural: 0, educacaoEspecial: 0, totalGeral: 0 }
      bucket.totalGeral += linha.quantidade
      evolucaoAnualMap.set(ano, bucket)
    }
  }

  const evolucaoAnual = [...evolucaoAnualMap.entries()]
    .map(([ano, values]) => ({ ano, ...values }))
    .sort((a, b) => Number(a.ano) - Number(b.ano))

  const anosDistintos = new Set(evolucaoAnual.map((item) => item.ano))
  const podeExibirEvolucaoAnual = anosDistintos.size > 1

  const { urbana, rural, hasQuantitativeLocation } = aggregateLocationFromRows(rows)
  const localizacaoVisivel =
    importacao.possui_localizacao === true &&
    hasQuantitativeLocation &&
    (urbana > 0 || rural > 0)

  const kpisPrincipais: KpiItem[] = [
    { label: 'Total geral importado', value: formatNumberPtBr(importacao.total_geral_importado) },
    { label: 'Infantil + Fundamental', value: formatNumberPtBr(importacao.total_infantil_fundamental) },
    { label: 'EJA', value: formatNumberPtBr(importacao.total_eja) },
    { label: 'AEE / Educação Especial', value: formatNumberPtBr(importacao.total_aee_educacao_especial) },
    { label: 'Ano de referência', value: String(importacao.ano_referencia) },
  ]

  return {
    kpisPrincipais,
    porEtapaOrdenado,
    composicaoImportacao,
    evolucaoAnual,
    podeExibirEvolucaoAnual,
    localizacao: localizacaoVisivel
      ? {
          visivel: true,
          serie: [
            { name: 'Urbana', value: urbana },
            { name: 'Rural', value: rural },
          ],
        }
      : { visivel: false },
    rodape: {
      fonte: importacao.fonte_resumo?.trim() || '—',
      anoReferencia: String(importacao.ano_referencia),
      dataAtualizacao: formatDataAtualizacaoRodape(importacao.data_atualizacao),
      statusLabel: 'Publicado',
    },
    mostrarAvisoDemonstrativo: false,
  }
}

export interface EjaTabPublicData {
  cardsPrincipais: KpiItem[]
  localizacao: Array<{ name: string; value: number }>
  evolucaoAnual: Array<{ ano: string; urbana: number; rural: number; total: number }>
  rodape: {
    fonte: string
    anoReferencia: string
    dataAtualizacao: string
    statusLabel: string
  }
  mostrarAvisoDemonstrativo: boolean
}

export function mapEjaImportacaoToPublicTab(importacao: EjaImportacaoRecord, linhas: EjaLinhaRecord[]): EjaTabPublicData {
  const evolucaoMap = new Map<string, { urbana: number; rural: number }>()
  for (const linha of linhas) {
    const ano = String(linha.ano)
    const item = evolucaoMap.get(ano) ?? { urbana: 0, rural: 0 }
    if ((linha.localizacao ?? '').toLowerCase() === 'urbana') item.urbana += linha.quantidade
    if ((linha.localizacao ?? '').toLowerCase() === 'rural') item.rural += linha.quantidade
    evolucaoMap.set(ano, item)
  }

  const evolucaoAnual = [...evolucaoMap.entries()]
    .map(([ano, item]) => ({ ano, urbana: item.urbana, rural: item.rural, total: item.urbana + item.rural }))
    .sort((a, b) => Number(a.ano) - Number(b.ano))

  const ultimoAno = evolucaoAnual[evolucaoAnual.length - 1]
  const urbanaAtual = ultimoAno?.urbana ?? importacao.total_urbana ?? 0
  const ruralAtual = ultimoAno?.rural ?? importacao.total_rural ?? 0
  const totalAtual = ultimoAno?.total ?? importacao.total_eja ?? urbanaAtual + ruralAtual

  return {
    cardsPrincipais: [
      { label: 'Total EJA', value: formatNumberPtBr(totalAtual) },
      { label: 'Urbana', value: formatNumberPtBr(urbanaAtual) },
      { label: 'Rural', value: formatNumberPtBr(ruralAtual) },
      { label: 'Ano de referência', value: String(importacao.ano_referencia) },
    ],
    localizacao: [
      { name: 'Urbana', value: urbanaAtual },
      { name: 'Rural', value: ruralAtual },
    ],
    evolucaoAnual,
    rodape: {
      fonte: importacao.fonte_resumo?.trim() || '—',
      anoReferencia: String(importacao.ano_referencia),
      dataAtualizacao: formatDataAtualizacaoRodape(importacao.data_atualizacao),
      statusLabel: importacao.status_publicacao === 'publicado' ? 'Publicado' : 'Rascunho',
    },
    mostrarAvisoDemonstrativo: false,
  }
}

