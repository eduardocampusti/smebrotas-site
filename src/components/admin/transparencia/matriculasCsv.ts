export interface MatriculasCsvRow {
  ano: string
  tipo_registro: string
  etapa: string
  modalidade: string
  escola: string
  localizacao: string
  dependencia: string
  quantidade: string
  fonte: string
  data_atualizacao: string
}

export interface MatriculasCsvRowError {
  line: number
  messages: string[]
}

export interface MatriculasCsvValidationResult {
  rows: MatriculasCsvRow[]
  validRows: MatriculasCsvRow[]
  errors: MatriculasCsvRowError[]
  totalRows: number
  totalMatriculas: number
  anoIdentificado: string
  fonteIdentificada: string
}

export interface MatriculasAutoFillResult {
  resumo: {
    totalGeralImportado: string
    totalInfantilFundamental: string
    totalEja: string
    totalAeeEducacaoEspecial: string
    matriculasEducacaoEspecial: string
    anoReferencia: string
    fonteDados: string
    dataAtualizacao: string
  }
  etapas: {
    creche: string
    preEscola: string
    anosIniciais: string
    anosFinais: string
    eja: string
    educacaoEspecial: string
  }
  evolucao: Array<{ ano: string; total: string }>
  localizacao: {
    urbana: string
    rural: string
    hasLocationData: boolean
  }
  fonte: {
    fonte: string
    anoReferencia: string
    dataAtualizacao: string
    link: string
  }
  supportNotes: string[]
}

const EXPECTED_HEADERS: (keyof MatriculasCsvRow)[] = [
  'ano',
  'tipo_registro',
  'etapa',
  'modalidade',
  'escola',
  'localizacao',
  'dependencia',
  'quantidade',
  'fonte',
  'data_atualizacao',
]

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      const nextChar = line[i + 1]
      if (inQuotes && nextChar === '"') {
        current += '"'
        i += 1
        continue
      }
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function normalizeContent(csvContent: string): string[] {
  return csvContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
}

function isRowEmpty(values: string[]): boolean {
  return values.every((value) => value.trim() === '')
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function formatOptionalNumber(value: number) {
  return value > 0 ? String(value) : 'Não informado'
}

function pickMostRecentDate(dates: string[]) {
  const sortedDates = [...dates].sort((a, b) => {
    const aDate = Date.parse(a)
    const bDate = Date.parse(b)
    if (Number.isNaN(aDate) || Number.isNaN(bDate)) return a.localeCompare(b)
    return bDate - aDate
  })
  return sortedDates[0] || 'Não informado'
}

function sumByMatch(rows: MatriculasCsvRow[], matcher: (row: MatriculasCsvRow) => boolean) {
  return rows
    .filter(matcher)
    .reduce((acc, row) => acc + Number(row.quantidade), 0)
}

export function getMatriculasCsvTemplate(): string {
  return `${EXPECTED_HEADERS.join(',')}
2025,resumo_etapa,Creche,,,,,210,Censo Escolar/Inep via QEdu,2026-04-28
2025,resumo_etapa,Pré-escola,,,,,301,Censo Escolar/Inep via QEdu,2026-04-28
2025,resumo_etapa,Anos Iniciais,,,,,793,Censo Escolar/Inep via QEdu,2026-04-28`
}

export function validateMatriculasCsv(csvContent: string): MatriculasCsvValidationResult {
  const lines = normalizeContent(csvContent)
  const firstNonEmptyLineIndex = lines.findIndex((line) => line.trim() !== '')

  if (firstNonEmptyLineIndex === -1) {
    return {
      rows: [],
      validRows: [],
      errors: [{ line: 1, messages: ['Arquivo CSV vazio.'] }],
      totalRows: 0,
      totalMatriculas: 0,
      anoIdentificado: '-',
      fonteIdentificada: '-',
    }
  }

  const headerLine = lines[firstNonEmptyLineIndex]
  const headers = parseCsvLine(headerLine).map((header) => header.trim())

  const missingHeaders = EXPECTED_HEADERS.filter((header) => !headers.includes(header))
  if (missingHeaders.length > 0) {
    return {
      rows: [],
      validRows: [],
      errors: [
        {
          line: firstNonEmptyLineIndex + 1,
          messages: [`Cabeçalho inválido. Colunas ausentes: ${missingHeaders.join(', ')}`],
        },
      ],
      totalRows: 0,
      totalMatriculas: 0,
      anoIdentificado: '-',
      fonteIdentificada: '-',
    }
  }

  const headerIndexes = EXPECTED_HEADERS.reduce<Record<keyof MatriculasCsvRow, number>>(
    (acc, key) => {
      acc[key] = headers.indexOf(key)
      return acc
    },
    {} as Record<keyof MatriculasCsvRow, number>,
  )

  const rows: MatriculasCsvRow[] = []
  const validRows: MatriculasCsvRow[] = []
  const errors: MatriculasCsvRowError[] = []

  for (let i = firstNonEmptyLineIndex + 1; i < lines.length; i += 1) {
    const rawLine = lines[i]
    if (rawLine.trim() === '') {
      continue
    }

    const values = parseCsvLine(rawLine)
    if (isRowEmpty(values)) {
      continue
    }

    const row: MatriculasCsvRow = {
      ano: values[headerIndexes.ano] ?? '',
      tipo_registro: values[headerIndexes.tipo_registro] ?? '',
      etapa: values[headerIndexes.etapa] ?? '',
      modalidade: values[headerIndexes.modalidade] ?? '',
      escola: values[headerIndexes.escola] ?? '',
      localizacao: values[headerIndexes.localizacao] ?? '',
      dependencia: values[headerIndexes.dependencia] ?? '',
      quantidade: values[headerIndexes.quantidade] ?? '',
      fonte: values[headerIndexes.fonte] ?? '',
      data_atualizacao: values[headerIndexes.data_atualizacao] ?? '',
    }

    rows.push(row)

    const rowErrors: string[] = []
    if (!row.ano.trim()) rowErrors.push('ano obrigatório')
    if (!row.tipo_registro.trim()) rowErrors.push('tipo_registro obrigatório')
    if (!row.quantidade.trim()) {
      rowErrors.push('quantidade obrigatória')
    } else if (Number.isNaN(Number(row.quantidade))) {
      rowErrors.push('quantidade deve ser numérica')
    }
    if (!row.fonte.trim()) rowErrors.push('fonte obrigatória')
    if (!row.data_atualizacao.trim()) rowErrors.push('data_atualizacao obrigatória')

    const hasEtapaOrModalidadeOrEscola = Boolean(row.etapa.trim() || row.modalidade.trim() || row.escola.trim())
    if (!hasEtapaOrModalidadeOrEscola) {
      rowErrors.push('preencha ao menos etapa, modalidade ou escola')
    }

    if (rowErrors.length > 0) {
      errors.push({ line: i + 1, messages: rowErrors })
      continue
    }

    validRows.push(row)
  }

  const anos = [...new Set(validRows.map((row) => row.ano.trim()).filter(Boolean))]
  const fontes = [...new Set(validRows.map((row) => row.fonte.trim()).filter(Boolean))]

  return {
    rows,
    validRows,
    errors,
    totalRows: rows.length,
    totalMatriculas: validRows.reduce((acc, row) => acc + Number(row.quantidade), 0),
    anoIdentificado: anos.length === 1 ? anos[0] : anos.length > 1 ? 'Múltiplos anos' : '-',
    fonteIdentificada: fontes.length === 1 ? fontes[0] : fontes.length > 1 ? 'Múltiplos arquivos do Inep/Educacenso' : '-',
  }
}

export function buildMatriculasAutoFillResult(validRows: MatriculasCsvRow[]): MatriculasAutoFillResult {
  const totalMatriculas = validRows.reduce((acc, row) => acc + Number(row.quantidade), 0)
  const anos = [...new Set(validRows.map((row) => row.ano.trim()).filter(Boolean))]
  const fontes = [...new Set(validRows.map((row) => row.fonte.trim()).filter(Boolean))]
  const datas = [...new Set(validRows.map((row) => row.data_atualizacao.trim()).filter(Boolean))]

  const extractLinkFromRow = (row: MatriculasCsvRow) => {
    const candidateValues = [row.tipo_registro, row.escola, row.dependencia]
    const found = candidateValues.find((value) => /^https?:\/\//i.test(value.trim()))
    return found?.trim() || ''
  }
  const links = [...new Set(validRows.map(extractLinkFromRow).filter(Boolean))]

  const isEspecial = (row: MatriculasCsvRow) => {
    const haystack = normalizeText(`${row.etapa} ${row.modalidade}`)
    return (
      haystack.includes('educacao especial') ||
      haystack.includes('especial') ||
      haystack.includes(' aee') ||
      haystack.startsWith('aee') ||
      haystack.includes('atendimento educacional especializado')
    )
  }

  const isEja = (row: MatriculasCsvRow) => {
    const haystack = normalizeText(`${row.etapa} ${row.modalidade}`)
    return haystack.includes(' eja') || haystack.startsWith('eja') || haystack.includes('educacao de jovens e adultos')
  }

  const byEtapa = (expected: string[]) =>
    sumByMatch(validRows, (row) => {
      const etapa = normalizeText(row.etapa)
      return expected.some((value) => etapa === normalizeText(value))
    })
  const totalInfantilFundamental = sumByMatch(validRows, (row) => {
    const tipoRegistro = normalizeText(row.tipo_registro)
    const etapa = normalizeText(row.etapa)
    if (tipoRegistro !== 'resumo_etapa') return false
    return ['creche', 'pre-escola', 'pre escola', 'anos iniciais', 'anos finais'].includes(etapa)
  })

  const byAno = validRows.reduce<Record<string, number>>((acc, row) => {
    const ano = row.ano.trim()
    if (!ano) return acc
    acc[ano] = (acc[ano] || 0) + Number(row.quantidade)
    return acc
  }, {})

  const localizacaoInfo = validRows.reduce(
    (acc, row) => {
      const location = normalizeText(row.localizacao)
      if (!location) return acc
      const quantidade = Number(row.quantidade)
      if (location.includes('urbana') || location.includes('urbano')) {
        acc.urbana += quantidade
        acc.hasLocationData = true
      } else if (location.includes('rural') || location.includes('campo')) {
        acc.rural += quantidade
        acc.hasLocationData = true
      }
      return acc
    },
    { urbana: 0, rural: 0, hasLocationData: false },
  )

  const supportNotes: string[] = []
  if (fontes.length > 1) {
    supportNotes.push(`Fontes identificadas no CSV: ${fontes.join(', ')}.`)
  }
  if (!localizacaoInfo.hasLocationData) {
    supportNotes.push('O CSV importado não possui dados de localização urbana/rural.')
  }

  return {
    resumo: {
      totalGeralImportado: String(totalMatriculas),
      totalInfantilFundamental: formatOptionalNumber(totalInfantilFundamental),
      totalEja: formatOptionalNumber(sumByMatch(validRows, isEja)),
      totalAeeEducacaoEspecial: formatOptionalNumber(sumByMatch(validRows, isEspecial)),
      matriculasEducacaoEspecial: formatOptionalNumber(sumByMatch(validRows, isEspecial)),
      anoReferencia: anos.length === 1 ? anos[0] : anos.length > 1 ? 'Múltiplos anos' : 'Não informado',
      fonteDados:
        fontes.length === 1 ? fontes[0] : fontes.length > 1 ? 'Múltiplos arquivos do Inep/Educacenso' : 'Não informado',
      dataAtualizacao: datas.length === 1 ? datas[0] : pickMostRecentDate(datas),
    },
    etapas: {
      creche: formatOptionalNumber(byEtapa(['Creche'])),
      preEscola: formatOptionalNumber(byEtapa(['Pré-escola', 'Pre-escola'])),
      anosIniciais: formatOptionalNumber(byEtapa(['Anos Iniciais'])),
      anosFinais: formatOptionalNumber(byEtapa(['Anos Finais'])),
      eja: formatOptionalNumber(sumByMatch(validRows, isEja)),
      educacaoEspecial: formatOptionalNumber(sumByMatch(validRows, isEspecial)),
    },
    evolucao: Object.entries(byAno)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([ano, total]) => ({ ano, total: String(total) })),
    localizacao: {
      urbana: localizacaoInfo.hasLocationData ? formatOptionalNumber(localizacaoInfo.urbana) : 'Não informado',
      rural: localizacaoInfo.hasLocationData ? formatOptionalNumber(localizacaoInfo.rural) : 'Não informado',
      hasLocationData: localizacaoInfo.hasLocationData,
    },
    fonte: {
      fonte:
        fontes.length === 1 ? fontes[0] : fontes.length > 1 ? 'Múltiplos arquivos do Inep/Educacenso' : 'Não informado',
      anoReferencia: anos.length === 1 ? anos[0] : anos.length > 1 ? 'Múltiplos anos' : 'Não informado',
      dataAtualizacao: datas.length === 1 ? datas[0] : pickMostRecentDate(datas),
      link: links[0] || 'Link da fonte não informado',
    },
    supportNotes,
  }
}
