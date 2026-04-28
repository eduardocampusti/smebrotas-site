import { transparenciaTabs } from '@/components/transparencia/mockData'
import type {
  TransparenciaIndicadorCard,
  TransparenciaIndicadorData,
  TransparenciaIndicadorSlug,
  TransparenciaKpiItem,
  TransparenciaTableBlock,
} from '@/types/transparencia'

import { buildIndicadorDataFallback } from './transparenciaMapper'

type UpdateIndicadorCardPayload = Partial<
  Omit<TransparenciaIndicadorCard, 'id' | 'slug' | 'updated_at'>
>

const indicatorStore = new Map<TransparenciaIndicadorSlug, TransparenciaIndicadorData>()

function ensureSeededStore() {
  if (indicatorStore.size > 0) return

  transparenciaTabs.forEach((item, index) => {
    const fallback = buildIndicadorDataFallback(item.id)
    fallback.card.ordem = index + 1
    indicatorStore.set(item.id, fallback)
  })
}

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export async function getIndicadores(): Promise<TransparenciaIndicadorCard[]> {
  ensureSeededStore()
  const cards = Array.from(indicatorStore.values()).map((entry) => entry.card)
  return cards.sort((a, b) => a.ordem - b.ordem).map((card) => ({ ...card }))
}

export async function getIndicadorBySlug(
  slug: TransparenciaIndicadorSlug,
): Promise<TransparenciaIndicadorCard | null> {
  ensureSeededStore()
  const found = indicatorStore.get(slug)
  return found ? { ...found.card } : null
}

export async function getIndicadorData(
  slug: TransparenciaIndicadorSlug,
): Promise<TransparenciaIndicadorData> {
  ensureSeededStore()
  const found = indicatorStore.get(slug) ?? buildIndicadorDataFallback(slug)
  return cloneData(found)
}

export async function updateIndicadorCard(
  slug: TransparenciaIndicadorSlug,
  payload: UpdateIndicadorCardPayload,
): Promise<TransparenciaIndicadorCard> {
  ensureSeededStore()
  const current = indicatorStore.get(slug) ?? buildIndicadorDataFallback(slug)
  const next: TransparenciaIndicadorData = {
    ...current,
    card: {
      ...current.card,
      ...payload,
      updated_at: new Date().toISOString(),
    },
  }
  indicatorStore.set(slug, next)
  return { ...next.card }
}

export async function updateIndicadorKpis(
  slug: TransparenciaIndicadorSlug,
  kpis: TransparenciaKpiItem[],
): Promise<TransparenciaKpiItem[]> {
  ensureSeededStore()
  const current = indicatorStore.get(slug) ?? buildIndicadorDataFallback(slug)
  const normalized = kpis.map((item, index) => ({
    ...item,
    indicador_slug: slug,
    ordem: item.ordem ?? index + 1,
  }))

  indicatorStore.set(slug, {
    ...current,
    kpis: normalized,
  })

  return cloneData(normalized)
}

export async function updateIndicadorSeries(
  slug: TransparenciaIndicadorSlug,
  series: TransparenciaIndicadorData['series'],
): Promise<TransparenciaIndicadorData['series']> {
  ensureSeededStore()
  const current = indicatorStore.get(slug) ?? buildIndicadorDataFallback(slug)
  const normalized = series.map((entry, index) => ({
    meta: {
      ...entry.meta,
      indicador_slug: slug,
      ordem: entry.meta.ordem ?? index + 1,
    },
    pontos: entry.pontos.map((point, pointIndex) => ({
      ...point,
      ordem: point.ordem ?? pointIndex + 1,
    })),
  }))

  indicatorStore.set(slug, {
    ...current,
    series: normalized,
  })

  return cloneData(normalized)
}

export async function updateIndicadorTable(
  slug: TransparenciaIndicadorSlug,
  table: TransparenciaTableBlock[],
): Promise<TransparenciaTableBlock[]> {
  ensureSeededStore()
  const current = indicatorStore.get(slug) ?? buildIndicadorDataFallback(slug)
  const normalized = table.map((block, index) => ({
    ...block,
    indicador_slug: slug,
    ordem: block.ordem ?? index + 1,
  }))

  indicatorStore.set(slug, {
    ...current,
    tabelas: normalized,
  })

  return cloneData(normalized)
}

export async function toggleIndicadorAtivo(
  slug: TransparenciaIndicadorSlug,
  ativo: boolean,
): Promise<TransparenciaIndicadorCard> {
  return updateIndicadorCard(slug, { ativo })
}

