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

