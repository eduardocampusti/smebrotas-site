import { supabase } from '@/config/supabase'
import { parseLocaleNumber } from './fundebFormatters'

export type FundebAnnualData = {
  year: number
  receita_contribuicao_estados_municipios: number
  complementacao_vaaf: number
  complementacao_vaat: number
  complementacao_vaar: number
  complementacao_uniao_total: number
  total_fundeb_previsto: number
}

export type FundebGrowthData = {
  fromYear: number
  toYear: number
  crescimento_valor: number
  crescimento_percentual: number
}

export type FundebVaatIndicator = {
  year: number
  vaat_antes_complementacao: number
  vaat_com_complementacao: number
  complementacao_vaat: number
  iei_percentual: number
}

export type FundebVaatScheduleRow = {
  year: number
  month_order: number
  month_label: string
  value: number
  is_next_year_month: boolean
}

export type FundebSettings = {
  title: string
  subtitle: string
  source_text: string
  observation_text: string
  footer_text: string
  is_published: boolean
}

export type FundebDataset = {
  annual: FundebAnnualData[]
  growth: FundebGrowthData[]
  vaatIndicators: FundebVaatIndicator[]
  vaatSchedule: FundebVaatScheduleRow[]
  settings: FundebSettings
}

export type FundebAdminLoadResult = {
  dataset: FundebDataset
  source: 'database' | 'fallback'
  errorMessage: string | null
}

export type FundebCsvPreviewRow = {
  lineNumber: number
  ano: string
  totalPrevisto: string
  status: 'ok' | 'erro' | 'alerta'
  errors: string[]
  warnings: string[]
  parsed?: FundebAnnualData
}

export const FUNDEB_SOURCE_FOOTER =
  'Fonte: FNDE/MEC - Portarias MEC/MF do Fundeb. Valores referentes às receitas previstas/estimadas oficiais para o município de Brotas de Macaúbas/BA, código IBGE 2904506.'

export const FUNDEB_DEFAULT_DATASET: FundebDataset = {
  annual: [
    {
      year: 2023,
      receita_contribuicao_estados_municipios: 9820987.93,
      complementacao_vaaf: 3211702.54,
      complementacao_vaat: 2566863.73,
      complementacao_vaar: 139506.6,
      complementacao_uniao_total: 5918072.87,
      total_fundeb_previsto: 15739060.8,
    },
    {
      year: 2024,
      receita_contribuicao_estados_municipios: 10999937.31,
      complementacao_vaaf: 3671021.35,
      complementacao_vaat: 3808274.42,
      complementacao_vaar: 194687.4,
      complementacao_uniao_total: 7673983.17,
      total_fundeb_previsto: 18673920.48,
    },
    {
      year: 2025,
      receita_contribuicao_estados_municipios: 12266265.86,
      complementacao_vaaf: 3959770.99,
      complementacao_vaat: 4607511.26,
      complementacao_vaar: 0,
      complementacao_uniao_total: 8567282.25,
      total_fundeb_previsto: 20833548.11,
    },
  ],
  growth: [
    { fromYear: 2023, toYear: 2024, crescimento_valor: 2934859.68, crescimento_percentual: 18.65 },
    { fromYear: 2024, toYear: 2025, crescimento_valor: 2159627.63, crescimento_percentual: 11.56 },
    { fromYear: 2023, toYear: 2025, crescimento_valor: 5094487.31, crescimento_percentual: 32.37 },
  ],
  vaatIndicators: [
    {
      year: 2023,
      vaat_antes_complementacao: 7250.32,
      vaat_com_complementacao: 8196.52,
      complementacao_vaat: 2566863.73,
      iei_percentual: 54.13,
    },
    {
      year: 2024,
      vaat_antes_complementacao: 7132.75,
      vaat_com_complementacao: 8510.81,
      complementacao_vaat: 3808274.42,
      iei_percentual: 54.54,
    },
    {
      year: 2025,
      vaat_antes_complementacao: 6476.24,
      vaat_com_complementacao: 8020.77,
      complementacao_vaat: 4607511.26,
      iei_percentual: 47.89,
    },
  ],
  vaatSchedule: [
    { year: 2023, month_order: 1, month_label: 'Jan', value: 126134.98, is_next_year_month: false },
    { year: 2023, month_order: 2, month_label: 'Fev', value: 138748.48, is_next_year_month: false },
    { year: 2023, month_order: 3, month_label: 'Mar', value: 151361.97, is_next_year_month: false },
    { year: 2023, month_order: 4, month_label: 'Abr', value: 163975.47, is_next_year_month: false },
    { year: 2023, month_order: 5, month_label: 'Mai', value: 177126.93, is_next_year_month: false },
    { year: 2023, month_order: 6, month_label: 'Jun', value: 189748, is_next_year_month: false },
    { year: 2023, month_order: 7, month_label: 'Jul', value: 189748, is_next_year_month: false },
    { year: 2023, month_order: 8, month_label: 'Ago', value: 201937.07, is_next_year_month: false },
    { year: 2023, month_order: 9, month_label: 'Set', value: 201001.34, is_next_year_month: false },
    { year: 2023, month_order: 10, month_label: 'Out', value: 201000.13, is_next_year_month: false },
    { year: 2023, month_order: 11, month_label: 'Nov', value: 201000.13, is_next_year_month: false },
    { year: 2023, month_order: 12, month_label: 'Dez', value: 201000.13, is_next_year_month: false },
    { year: 2023, month_order: 13, month_label: 'Jan seg.', value: 424081.1, is_next_year_month: true },
    { year: 2024, month_order: 1, month_label: 'Jan', value: 178158.89, is_next_year_month: false },
    { year: 2024, month_order: 2, month_label: 'Fev', value: 195974.78, is_next_year_month: false },
    { year: 2024, month_order: 3, month_label: 'Mar', value: 213575.19, is_next_year_month: false },
    { year: 2024, month_order: 4, month_label: 'Abr', value: 231373.12, is_next_year_month: false },
    { year: 2024, month_order: 5, month_label: 'Mai', value: 251704.57, is_next_year_month: false },
    { year: 2024, month_order: 6, month_label: 'Jun', value: 269561.42, is_next_year_month: false },
    { year: 2024, month_order: 7, month_label: 'Jul', value: 269561.42, is_next_year_month: false },
    { year: 2024, month_order: 8, month_label: 'Ago', value: 288656.48, is_next_year_month: false },
    { year: 2024, month_order: 9, month_label: 'Set', value: 316528.8, is_next_year_month: false },
    { year: 2024, month_order: 10, month_label: 'Out', value: 316528.8, is_next_year_month: false },
    { year: 2024, month_order: 11, month_label: 'Nov', value: 316528.8, is_next_year_month: false },
    { year: 2024, month_order: 12, month_label: 'Dez', value: 315692.11, is_next_year_month: false },
    { year: 2024, month_order: 13, month_label: 'Jan seg.', value: 644430.04, is_next_year_month: true },
    { year: 2025, month_order: 1, month_label: 'Jan', value: 228181.19, is_next_year_month: false },
    { year: 2025, month_order: 2, month_label: 'Fev', value: 250999.31, is_next_year_month: false },
    { year: 2025, month_order: 3, month_label: 'Mar', value: 273817.43, is_next_year_month: false },
    { year: 2025, month_order: 4, month_label: 'Abr', value: 296635.55, is_next_year_month: false },
    { year: 2025, month_order: 5, month_label: 'Mai', value: 347770.18, is_next_year_month: false },
    { year: 2025, month_order: 6, month_label: 'Jun', value: 371575.13, is_next_year_month: false },
    { year: 2025, month_order: 7, month_label: 'Jul', value: 371575.13, is_next_year_month: false },
    { year: 2025, month_order: 8, month_label: 'Ago', value: 380879.11, is_next_year_month: false },
    { year: 2025, month_order: 9, month_label: 'Set', value: 355641.66, is_next_year_month: false },
    { year: 2025, month_order: 10, month_label: 'Out', value: 355367.29, is_next_year_month: false },
    { year: 2025, month_order: 11, month_label: 'Nov', value: 355367.29, is_next_year_month: false },
    { year: 2025, month_order: 12, month_label: 'Dez', value: 355016.43, is_next_year_month: false },
    { year: 2025, month_order: 13, month_label: 'Jan seg.', value: 664685.56, is_next_year_month: true },
  ],
  settings: {
    title: 'FUNDEB',
    subtitle: 'Dados oficiais do Fundo de Manutenção e Desenvolvimento da Educação Básica de Brotas de Macaúbas/BA',
    source_text: 'Fonte: FNDE/MEC',
    observation_text:
      'Os valores apresentados referem-se à receita total prevista/estimada do Fundeb, conforme publicações oficiais do FNDE/MEC. Para valores efetivamente creditados ou repassados em conta, consulte também STN, Banco do Brasil e Tesouro Transparente.',
    footer_text: FUNDEB_SOURCE_FOOTER,
    is_published: true,
  },
}

export async function getFundebPublicData(): Promise<FundebDataset> {
  try {
    const [annualRes, indicatorsRes, scheduleRes, settingsRes] = await Promise.all([
      supabase
        .from('fundeb_annual_data')
        .select('*')
        .eq('is_published', true)
        .order('year', { ascending: true }),
      supabase.from('fundeb_vaat_indicators').select('*').order('year', { ascending: true }),
      supabase
        .from('fundeb_vaat_schedule')
        .select('*')
        .order('year', { ascending: true })
        .order('month_order', { ascending: true }),
      supabase.from('fundeb_settings').select('*').eq('is_published', true).limit(1).maybeSingle(),
    ])

    if (annualRes.error || indicatorsRes.error || scheduleRes.error) {
      return FUNDEB_DEFAULT_DATASET
    }
    if (!annualRes.data || annualRes.data.length === 0) return FUNDEB_DEFAULT_DATASET

    const annual = annualRes.data as FundebAnnualData[]
    const growth: FundebGrowthData[] = []
    for (let i = 1; i < annual.length; i += 1) {
      const prev = annual[i - 1]
      const curr = annual[i]
      const growthValue = curr.total_fundeb_previsto - prev.total_fundeb_previsto
      const growthPercent = prev.total_fundeb_previsto > 0 ? (growthValue / prev.total_fundeb_previsto) * 100 : 0
      growth.push({
        fromYear: prev.year,
        toYear: curr.year,
        crescimento_valor: Number(growthValue.toFixed(2)),
        crescimento_percentual: Number(growthPercent.toFixed(2)),
      })
    }
    if (annual.length >= 2) {
      const first = annual[0]
      const last = annual[annual.length - 1]
      const growthValue = last.total_fundeb_previsto - first.total_fundeb_previsto
      const growthPercent = first.total_fundeb_previsto > 0 ? (growthValue / first.total_fundeb_previsto) * 100 : 0
      growth.push({
        fromYear: first.year,
        toYear: last.year,
        crescimento_valor: Number(growthValue.toFixed(2)),
        crescimento_percentual: Number(growthPercent.toFixed(2)),
      })
    }

    return {
      annual,
      growth,
      vaatIndicators: (indicatorsRes.data as FundebVaatIndicator[]) ?? [],
      vaatSchedule: (scheduleRes.data as FundebVaatScheduleRow[]) ?? [],
      settings: (settingsRes.data as FundebSettings | null) ?? FUNDEB_DEFAULT_DATASET.settings,
    }
  } catch {
    return FUNDEB_DEFAULT_DATASET
  }
}

export type SaveFundebPayload = {
  annual: FundebAnnualData[]
  vaatIndicators: FundebVaatIndicator[]
  vaatSchedule: FundebVaatScheduleRow[]
  settings: FundebSettings
}

export async function getFundebAdminData(): Promise<FundebAdminLoadResult> {
  try {
    const [annualRes, indicatorsRes, scheduleRes, settingsRes] = await Promise.all([
      supabase.from('fundeb_annual_data').select('*').order('year', { ascending: true }),
      supabase.from('fundeb_vaat_indicators').select('*').order('year', { ascending: true }),
      supabase.from('fundeb_vaat_schedule').select('*').order('year', { ascending: true }).order('month_order', { ascending: true }),
      supabase.from('fundeb_settings').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    if (annualRes.error || indicatorsRes.error || scheduleRes.error) {
      return {
        dataset: FUNDEB_DEFAULT_DATASET,
        source: 'fallback',
        errorMessage: 'Falha ao carregar dados do Supabase. Exibindo dados oficiais de exemplo.',
      }
    }
    const hasDbData = (annualRes.data?.length ?? 0) > 0
    return {
      dataset: hasDbData
        ? {
            annual: (annualRes.data as FundebAnnualData[]) ?? FUNDEB_DEFAULT_DATASET.annual,
            growth: FUNDEB_DEFAULT_DATASET.growth,
            vaatIndicators: (indicatorsRes.data as FundebVaatIndicator[]) ?? FUNDEB_DEFAULT_DATASET.vaatIndicators,
            vaatSchedule: (scheduleRes.data as FundebVaatScheduleRow[]) ?? FUNDEB_DEFAULT_DATASET.vaatSchedule,
            settings: (settingsRes.data as FundebSettings | null) ?? FUNDEB_DEFAULT_DATASET.settings,
          }
        : FUNDEB_DEFAULT_DATASET,
      source: hasDbData ? 'database' : 'fallback',
      errorMessage: hasDbData ? null : 'Nenhum dado encontrado no Supabase. Exibindo dados oficiais de exemplo.',
    }
  } catch {
    return {
      dataset: FUNDEB_DEFAULT_DATASET,
      source: 'fallback',
      errorMessage: 'Falha ao carregar dados do Supabase. Exibindo dados oficiais de exemplo.',
    }
  }
}

export async function saveFundebDraft(payload: SaveFundebPayload) {
  const annualRows = payload.annual.map((x) => ({ ...x, is_published: false }))
  const { error: annualUpsertError } = await supabase
    .from('fundeb_annual_data')
    .upsert(annualRows, { onConflict: 'year' })
  if (annualUpsertError) throw annualUpsertError

  const { error: indicatorsUpsertError } = await supabase
    .from('fundeb_vaat_indicators')
    .upsert(payload.vaatIndicators, { onConflict: 'year' })
  if (indicatorsUpsertError) throw indicatorsUpsertError

  const { error: scheduleUpsertError } = await supabase
    .from('fundeb_vaat_schedule')
    .upsert(payload.vaatSchedule, { onConflict: 'year,month_order' })
  if (scheduleUpsertError) throw scheduleUpsertError

  const { data: existingSettings, error: settingsSelectError } = await supabase
    .from('fundeb_settings')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>()
  if (settingsSelectError) throw settingsSelectError
  const settingsPayload = { ...payload.settings, is_published: false }
  const { error: settingsUpsertError } = existingSettings?.id
    ? await supabase.from('fundeb_settings').update(settingsPayload).eq('id', existingSettings.id)
    : await supabase.from('fundeb_settings').insert(settingsPayload)
  if (settingsUpsertError) throw settingsUpsertError
}

export async function publishFundebData() {
  const { error: annualError } = await supabase
    .from('fundeb_annual_data')
    .update({ is_published: true })
    .gte('year', 0)
  if (annualError) throw annualError
  const { error: settingsError } = await supabase
    .from('fundeb_settings')
    .update({ is_published: true })
    .neq('id', '')
  if (settingsError) throw settingsError
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_\s]+/g, '')
    .replace(/[^a-z0-9]/g, '')
}

const HEADER_ALIASES: Record<string, keyof FundebAnnualData | 'ano'> = {
  ano: 'ano',
  year: 'ano',
  receitacontribuicaoestadosmunicipios: 'receita_contribuicao_estados_municipios',
  complementacaovaaf: 'complementacao_vaaf',
  complementacaovaat: 'complementacao_vaat',
  complementacaovaar: 'complementacao_vaar',
  complementacaouniaototal: 'complementacao_uniao_total',
  totalfundebprevisto: 'total_fundeb_previsto',
}

export function parseFundebCsv(
  csvText: string,
  existingYears: number[],
): { preview: FundebCsvPreviewRow[]; validRows: FundebAnnualData[]; globalErrors: string[] } {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) {
    return {
      preview: [],
      validRows: [],
      globalErrors: ['Arquivo CSV inválido. Use o modelo oficial com separador ponto e vírgula.'],
    }
  }
  const headerColumns = lines[0].split(';').map((x) => x.trim())
  const mappedIndexes: Partial<Record<keyof FundebAnnualData | 'ano', number>> = {}
  for (let i = 0; i < headerColumns.length; i += 1) {
    const normalized = normalizeHeader(headerColumns[i])
    const mappedKey = HEADER_ALIASES[normalized]
    if (mappedKey) mappedIndexes[mappedKey] = i
  }
  const requiredColumns: Array<keyof typeof mappedIndexes> = [
    'ano',
    'receita_contribuicao_estados_municipios',
    'complementacao_vaaf',
    'complementacao_vaat',
    'complementacao_vaar',
    'complementacao_uniao_total',
    'total_fundeb_previsto',
  ]
  const missing = requiredColumns.filter((column) => mappedIndexes[column] === undefined)
  if (missing.length > 0) {
    return {
      preview: [],
      validRows: [],
      globalErrors: ['coluna obrigatória ausente'],
    }
  }

  const preview: FundebCsvPreviewRow[] = []
  const validRows: FundebAnnualData[] = []
  for (let idx = 1; idx < lines.length; idx += 1) {
    const rawColumns = lines[idx].split(';')
    const anoRaw = rawColumns[mappedIndexes.ano ?? -1]?.trim() ?? ''
    const totalRaw = rawColumns[mappedIndexes.total_fundeb_previsto ?? -1]?.trim() ?? ''
    const errors: string[] = []
    const warnings: string[] = []

    if (!anoRaw) errors.push('ano ausente')
    const ano = Number.parseInt(anoRaw, 10)
    if (!Number.isFinite(ano) || ano <= 0) errors.push('ano inválido')

    const parseField = (field: keyof FundebAnnualData) => {
      const columnIndex = mappedIndexes[field]
      const raw = columnIndex === undefined ? '' : rawColumns[columnIndex] ?? ''
      const parsed = parseLocaleNumber(raw)
      const hasDigit = /\d/.test(raw)
      if (raw.trim() && !hasDigit) errors.push('valor monetário inválido')
      return Number.isFinite(parsed) ? parsed : 0
    }

    const parsedRow: FundebAnnualData = {
      year: Number.isFinite(ano) ? ano : 0,
      receita_contribuicao_estados_municipios: parseField('receita_contribuicao_estados_municipios'),
      complementacao_vaaf: parseField('complementacao_vaaf'),
      complementacao_vaat: parseField('complementacao_vaat'),
      complementacao_vaar: parseField('complementacao_vaar'),
      complementacao_uniao_total: parseField('complementacao_uniao_total'),
      total_fundeb_previsto: parseField('total_fundeb_previsto'),
    }

    if (parsedRow.total_fundeb_previsto <= 0) {
      errors.push('total_fundeb_previsto menor ou igual a zero')
    }

    const somaComplementacoes =
      parsedRow.complementacao_vaaf + parsedRow.complementacao_vaat + parsedRow.complementacao_vaar
    if (Math.abs(somaComplementacoes - parsedRow.complementacao_uniao_total) > 0.05) {
      warnings.push('A soma das complementações não confere com o total da Complementação da União.')
    }
    if (existingYears.includes(parsedRow.year)) {
      warnings.push('ano já existente no banco, será atualizado')
    }

    const status: FundebCsvPreviewRow['status'] =
      errors.length > 0 ? 'erro' : warnings.length > 0 ? 'alerta' : 'ok'
    preview.push({
      lineNumber: idx + 1,
      ano: anoRaw,
      totalPrevisto: totalRaw,
      status,
      errors,
      warnings,
      parsed: errors.length === 0 ? parsedRow : undefined,
    })
    if (errors.length === 0) validRows.push(parsedRow)
  }

  return { preview, validRows, globalErrors: [] }
}
