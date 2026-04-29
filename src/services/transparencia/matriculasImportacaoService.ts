import { supabase } from '@/config/supabase'
import type { MatriculasCsvRow } from '@/components/admin/transparencia/matriculasCsv'

export type StatusPublicacaoMatriculas = 'rascunho' | 'publicado'

export interface MatriculasImportacaoListItem {
  id: string
  ano_referencia: number
  status_publicacao: StatusPublicacaoMatriculas
  total_geral_importado: number
  fonte_resumo: string
  updated_at: string
  publicado_em: string | null
  created_at: string
}

export interface MatriculasImportacaoRecord {
  id: string
  ano_referencia: number
  fonte_resumo: string
  fontes_detectadas: string[]
  data_atualizacao: string | null
  total_geral_importado: number
  total_infantil_fundamental: number
  total_eja: number
  total_aee_educacao_especial: number
  vagas_disponiveis: number | null
  taxa_ocupacao: number | null
  possui_localizacao: boolean
  observacoes: string | null
  status_publicacao: StatusPublicacaoMatriculas
  publicado_em: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface MatriculasLinhaRecord {
  id: string
  importacao_id: string
  ano: number
  tipo_registro: string
  etapa: string | null
  modalidade: string | null
  escola: string | null
  localizacao: string | null
  dependencia: string | null
  quantidade: number
  fonte: string
  data_atualizacao: string
  ordem: number
  created_at: string
}

export interface SaveMatriculasImportacaoDraftPayload {
  ano_referencia: number
  fonte_resumo: string
  fontes_detectadas: string[]
  data_atualizacao: string | null
  total_geral_importado: number
  total_infantil_fundamental: number
  total_eja: number
  total_aee_educacao_especial: number
  vagas_disponiveis?: number | null
  taxa_ocupacao?: number | null
  possui_localizacao: boolean
  observacoes?: string | null
}

export interface MatriculasPublicadaComLinhas {
  importacao: MatriculasImportacaoRecord
  linhas: MatriculasLinhaRecord[]
}

export interface MatriculasEvolucaoManualRowInput {
  ano: number
  urbana: number
  rural: number
  educacaoEspecial: number
}

function parseInteger(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return Math.trunc(parsed)
}

export async function saveMatriculasImportacaoDraft(
  payload: SaveMatriculasImportacaoDraftPayload,
  rows: MatriculasCsvRow[],
) {
  const linhasPayload = rows.map((row, index) => ({
    ano: parseInteger(row.ano),
    tipo_registro: row.tipo_registro,
    etapa: row.etapa || null,
    modalidade: row.modalidade || null,
    escola: row.escola || null,
    localizacao: row.localizacao || null,
    dependencia: row.dependencia || null,
    quantidade: parseInteger(row.quantidade),
    fonte: row.fonte,
    data_atualizacao: row.data_atualizacao,
    ordem: index + 1,
  }))

  const { data: importacaoId, error: saveError } = await supabase
    .rpc('salvar_transparencia_matriculas_importacao', {
      p_importacao: payload,
      p_linhas: linhasPayload,
    })

  if (saveError) throw saveError
  if (!importacaoId) {
    throw new Error('Falha ao salvar importacao de matriculas.')
  }

  const { data: importacao, error: importacaoError } = await supabase
    .from('transparencia_matriculas_importacoes')
    .select('*')
    .eq('id', importacaoId)
    .single<MatriculasImportacaoRecord>()

  if (importacaoError) throw importacaoError

  return importacao
}

export async function publishMatriculasImportacao(importacaoId: string) {
  const { data, error } = await supabase
    .rpc('publicar_transparencia_matriculas_importacao', { p_importacao_id: importacaoId })
    .single<MatriculasImportacaoRecord>()

  if (error) throw error
  return data
}

/** Converte linhas persistidas no formato esperado por `buildMatriculasAutoFillResult`. */
export function matriculaLinhasToCsvRows(linhas: MatriculasLinhaRecord[]): MatriculasCsvRow[] {
  return linhas.map((linha) => ({
    ano: String(linha.ano),
    tipo_registro: linha.tipo_registro ?? '',
    etapa: linha.etapa ?? '',
    modalidade: linha.modalidade ?? '',
    escola: linha.escola ?? '',
    localizacao: linha.localizacao ?? '',
    dependencia: linha.dependencia ?? '',
    quantidade: String(linha.quantidade),
    fonte: linha.fonte ?? '',
    data_atualizacao: linha.data_atualizacao ?? '',
  }))
}

export async function getMatriculasImportacaoById(importacaoId: string): Promise<MatriculasPublicadaComLinhas | null> {
  const { data: importacao, error: importacaoError } = await supabase
    .from('transparencia_matriculas_importacoes')
    .select('*')
    .eq('id', importacaoId)
    .maybeSingle<MatriculasImportacaoRecord>()

  if (importacaoError) throw importacaoError
  if (!importacao) return null

  const { data: linhas, error: linhasError } = await supabase
    .from('transparencia_matriculas_linhas')
    .select('*')
    .eq('importacao_id', importacao.id)
    .order('ordem', { ascending: true })
    .returns<MatriculasLinhaRecord[]>()

  if (linhasError) throw linhasError

  return {
    importacao,
    linhas: linhas ?? [],
  }
}

/** Lista importações visíveis ao admin (rascunho e publicado), da mais recente à mais antiga. */
export async function listMatriculasImportacoes(): Promise<MatriculasImportacaoListItem[]> {
  const { data, error } = await supabase
    .from('transparencia_matriculas_importacoes')
    .select('id, ano_referencia, status_publicacao, total_geral_importado, fonte_resumo, updated_at, publicado_em, created_at')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as MatriculasImportacaoListItem[]
}

/**
 * Importação mais recente para o painel admin: prioriza publicada mais recente;
 * se não houver, usa o rascunho mais recente.
 */
export async function getUltimaImportacaoMatriculasAdmin(): Promise<MatriculasPublicadaComLinhas | null> {
  const { data: latestRow, error } = await supabase
    .from('transparencia_matriculas_importacoes')
    .select('id')
    .in('status_publicacao', ['rascunho', 'publicado'])
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>()

  if (error) throw error
  if (!latestRow?.id) return null
  return getMatriculasImportacaoById(latestRow.id)
}

export async function getPublicadaMaisRecenteMatriculas(): Promise<MatriculasPublicadaComLinhas | null> {
  const { data: row, error } = await supabase
    .from('transparencia_matriculas_importacoes')
    .select('id')
    .eq('status_publicacao', 'publicado')
    .order('publicado_em', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>()

  if (error) throw error
  if (!row?.id) return null
  return getMatriculasImportacaoById(row.id)
}

export async function saveMatriculasEvolucaoManual(importacaoId: string, evolucaoRows: MatriculasEvolucaoManualRowInput[]) {
  const { data: importacao, error: importacaoError } = await supabase
    .from('transparencia_matriculas_importacoes')
    .select('id, fonte_resumo, data_atualizacao')
    .eq('id', importacaoId)
    .single<{ id: string; fonte_resumo: string; data_atualizacao: string | null }>()

  if (importacaoError) throw importacaoError

  const { data: linhasExistentes, error: linhasExistentesError } = await supabase
    .from('transparencia_matriculas_linhas')
    .select('ordem')
    .eq('importacao_id', importacaoId)
    .not('tipo_registro', 'in', '("evolucao_localizacao","evolucao_educacao_especial")')
    .returns<Array<{ ordem: number }>>()

  if (linhasExistentesError) throw linhasExistentesError

  const baseOrdem = (linhasExistentes ?? []).reduce((max, row) => Math.max(max, row.ordem ?? 0), 0)
  const fonte = importacao.fonte_resumo?.trim() || 'Não informado'
  const dataAtualizacao = importacao.data_atualizacao?.trim() || new Date().toISOString().slice(0, 10)

  const linhasManuais = evolucaoRows.flatMap((row, index) => {
    const ordemBase = baseOrdem + index * 3 + 1
    return [
      {
        importacao_id: importacaoId,
        ano: row.ano,
        tipo_registro: 'evolucao_localizacao',
        etapa: 'Evolução por localização',
        modalidade: null,
        escola: null,
        localizacao: 'Urbana',
        dependencia: null,
        quantidade: row.urbana,
        fonte,
        data_atualizacao: dataAtualizacao,
        ordem: ordemBase,
      },
      {
        importacao_id: importacaoId,
        ano: row.ano,
        tipo_registro: 'evolucao_localizacao',
        etapa: 'Evolução por localização',
        modalidade: null,
        escola: null,
        localizacao: 'Rural',
        dependencia: null,
        quantidade: row.rural,
        fonte,
        data_atualizacao: dataAtualizacao,
        ordem: ordemBase + 1,
      },
      {
        importacao_id: importacaoId,
        ano: row.ano,
        tipo_registro: 'evolucao_educacao_especial',
        etapa: 'Educação Especial',
        modalidade: 'Educação Especial',
        escola: null,
        localizacao: null,
        dependencia: null,
        quantidade: row.educacaoEspecial,
        fonte,
        data_atualizacao: dataAtualizacao,
        ordem: ordemBase + 2,
      },
    ]
  })

  const { error: deleteError } = await supabase
    .from('transparencia_matriculas_linhas')
    .delete()
    .eq('importacao_id', importacaoId)
    .in('tipo_registro', ['evolucao_localizacao', 'evolucao_educacao_especial'])

  if (deleteError) throw deleteError

  if (linhasManuais.length > 0) {
    const { error: insertError } = await supabase.from('transparencia_matriculas_linhas').insert(linhasManuais)
    if (insertError) throw insertError
  }

  return { ok: true as const }
}
