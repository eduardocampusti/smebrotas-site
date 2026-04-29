import type { MatriculasLinhaRecord } from '@/services/transparencia/matriculasImportacaoService'

/** Linha normalizada para agregação pública (mesma semântica que MatriculasCsvRow no autofill). */
export type MatriculasAggregationRow = {
  ano: string
  tipo_registro: string
  etapa: string
  modalidade: string
  escola: string
  dependencia: string
  localizacao: string
  quantidade: number
}

export function matriculaLinhaToAggregationRow(linha: MatriculasLinhaRecord): MatriculasAggregationRow {
  return {
    ano: String(linha.ano),
    tipo_registro: linha.tipo_registro ?? '',
    etapa: linha.etapa ?? '',
    modalidade: linha.modalidade ?? '',
    escola: linha.escola ?? '',
    dependencia: linha.dependencia ?? '',
    localizacao: linha.localizacao ?? '',
    quantidade: linha.quantidade,
  }
}

export function normalizeMatriculasText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function matriculasRowIsEja(row: Pick<MatriculasAggregationRow, 'etapa' | 'modalidade'>): boolean {
  const haystack = normalizeMatriculasText(`${row.etapa} ${row.modalidade}`)
  return (
    haystack.includes(' eja') ||
    haystack.startsWith('eja') ||
    haystack.includes('educacao de jovens e adultos')
  )
}

export function matriculasRowIsEspecial(row: Pick<MatriculasAggregationRow, 'etapa' | 'modalidade'>): boolean {
  const haystack = normalizeMatriculasText(`${row.etapa} ${row.modalidade}`)
  return (
    haystack.includes('educacao especial') ||
    haystack.includes('especial') ||
    haystack.includes(' aee') ||
    haystack.startsWith('aee') ||
    haystack.includes('atendimento educacional especializado')
  )
}

function sumQuantidade(rows: MatriculasAggregationRow[], matcher: (row: MatriculasAggregationRow) => boolean): number {
  return rows.filter(matcher).reduce((acc, row) => acc + row.quantidade, 0)
}

export function sumByEtapaLabels(rows: MatriculasAggregationRow[], expected: string[]): number {
  return sumQuantidade(rows, (row) => {
    const etapa = normalizeMatriculasText(row.etapa)
    return expected.some((value) => etapa === normalizeMatriculasText(value))
  })
}

export function aggregateLocationFromRows(rows: MatriculasAggregationRow[]): {
  urbana: number
  rural: number
  hasQuantitativeLocation: boolean
} {
  const inicial = { urbana: 0, rural: 0, hasQuantitativeLocation: false as boolean }
  return rows.reduce((acc, row) => {
    const location = normalizeMatriculasText(row.localizacao)
    if (!location) return acc
    const q = row.quantidade
    if (location.includes('urbana') || location.includes('urbano')) {
      acc.urbana += q
      acc.hasQuantitativeLocation = true
    } else if (location.includes('rural') || location.includes('campo')) {
      acc.rural += q
      acc.hasQuantitativeLocation = true
    }
    return acc
  }, inicial)
}

const ETAPAS_ORDEM: Array<{ chave: string; label: string; sum: (rows: MatriculasAggregationRow[]) => number }> = [
  { chave: 'creche', label: 'Creche', sum: (rows) => sumByEtapaLabels(rows, ['Creche']) },
  { chave: 'pre', label: 'Pré-escola', sum: (rows) => sumByEtapaLabels(rows, ['Pré-escola', 'Pre-escola']) },
  { chave: 'iniciais', label: 'Anos Iniciais', sum: (rows) => sumByEtapaLabels(rows, ['Anos Iniciais']) },
  { chave: 'finais', label: 'Anos Finais', sum: (rows) => sumByEtapaLabels(rows, ['Anos Finais']) },
  { chave: 'eja', label: 'EJA', sum: (rows) => sumQuantidade(rows, matriculasRowIsEja) },
  { chave: 'aee', label: 'AEE / Educação Especial', sum: (rows) => sumQuantidade(rows, matriculasRowIsEspecial) },
]

export function buildPorEtapaOrdenado(
  rows: MatriculasAggregationRow[],
): Array<{ etapa: string; quantidade: number }> {
  return ETAPAS_ORDEM.map(({ label, sum }) => ({ etapa: label, quantidade: sum(rows) }))
}
