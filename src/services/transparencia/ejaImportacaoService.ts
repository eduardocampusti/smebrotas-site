import { supabase } from '@/config/supabase'

export type StatusPublicacaoEja = 'rascunho' | 'publicado'

export interface EjaImportacaoRecord {
  id: string
  created_at: string
  updated_at: string
  created_by: string | null
  status_publicacao: StatusPublicacaoEja
  ano_referencia: number
  total_eja: number
  total_urbana: number
  total_rural: number
  fonte_resumo: string
  data_atualizacao: string | null
  observacoes: string | null
}

export interface EjaLinhaRecord {
  id: string
  importacao_id: string
  ano: number
  localizacao: string
  quantidade: number
  fonte: string | null
  data_atualizacao: string | null
  ordem: number
}

export interface EjaPublicadaComLinhas {
  importacao: EjaImportacaoRecord
  linhas: EjaLinhaRecord[]
}

export interface SaveEjaImportacaoDraftPayload {
  ano_referencia: number
  total_eja: number
  total_urbana: number
  total_rural: number
  fonte_resumo: string
  data_atualizacao: string | null
  observacoes?: string | null
}

export interface EjaEvolucaoManualRowInput {
  ano: number
  urbana: number
  rural: number
}

function parseInteger(value: string | number) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return Math.trunc(parsed)
}

export async function saveEjaImportacaoDraft(payload: SaveEjaImportacaoDraftPayload, rows: EjaEvolucaoManualRowInput[]) {
  const linhasPayload = rows.flatMap((row, index) => {
    const ordemBase = index * 2 + 1
    return [
      {
        ano: parseInteger(row.ano),
        localizacao: 'Urbana',
        quantidade: parseInteger(row.urbana),
        fonte: payload.fonte_resumo,
        data_atualizacao: payload.data_atualizacao,
        ordem: ordemBase,
      },
      {
        ano: parseInteger(row.ano),
        localizacao: 'Rural',
        quantidade: parseInteger(row.rural),
        fonte: payload.fonte_resumo,
        data_atualizacao: payload.data_atualizacao,
        ordem: ordemBase + 1,
      },
    ]
  })

  const { data: importacaoId, error } = await supabase.rpc('salvar_transparencia_eja_importacao', {
    p_importacao: payload,
    p_linhas: linhasPayload,
  })

  if (error) throw error
  if (!importacaoId) throw new Error('Falha ao salvar importacao EJA.')

  const { data: importacao, error: importacaoError } = await supabase
    .from('transparencia_eja_importacoes')
    .select('*')
    .eq('id', importacaoId)
    .single<EjaImportacaoRecord>()

  if (importacaoError) throw importacaoError
  return importacao
}

export async function publishEjaImportacao(importacaoId: string) {
  const { error } = await supabase.rpc('publicar_transparencia_eja_importacao', { p_importacao_id: importacaoId })
  if (error) throw error

  const { data, error: importacaoError } = await supabase
    .from('transparencia_eja_importacoes')
    .select('*')
    .eq('id', importacaoId)
    .single<EjaImportacaoRecord>()
  if (importacaoError) throw importacaoError
  return data
}

export async function getEjaImportacaoById(importacaoId: string): Promise<EjaPublicadaComLinhas | null> {
  const { data: importacao, error: importacaoError } = await supabase
    .from('transparencia_eja_importacoes')
    .select('*')
    .eq('id', importacaoId)
    .maybeSingle<EjaImportacaoRecord>()
  if (importacaoError) throw importacaoError
  if (!importacao) return null

  const { data: linhas, error: linhasError } = await supabase
    .from('transparencia_eja_linhas')
    .select('*')
    .eq('importacao_id', importacao.id)
    .order('ordem', { ascending: true })
    .returns<EjaLinhaRecord[]>()
  if (linhasError) throw linhasError

  return { importacao, linhas: linhas ?? [] }
}

export async function getPublicadaMaisRecenteEja(): Promise<EjaPublicadaComLinhas | null> {
  const { data: row, error } = await supabase
    .from('transparencia_eja_importacoes')
    .select('id')
    .eq('status_publicacao', 'publicado')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>()
  if (error) throw error
  if (!row?.id) return null
  return getEjaImportacaoById(row.id)
}

export async function getUltimaImportacaoEjaAdmin(): Promise<EjaPublicadaComLinhas | null> {
  const { data: row, error } = await supabase
    .from('transparencia_eja_importacoes')
    .select('id')
    .in('status_publicacao', ['rascunho', 'publicado'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>()
  if (error) throw error
  if (!row?.id) return null
  return getEjaImportacaoById(row.id)
}

export async function listEjaImportacoes(): Promise<EjaImportacaoRecord[]> {
  const { data, error } = await supabase
    .from('transparencia_eja_importacoes')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as EjaImportacaoRecord[]
}

export async function saveEjaEvolucaoManual(importacaoId: string, rows: EjaEvolucaoManualRowInput[]) {
  const { data: importacao, error: importacaoError } = await supabase
    .from('transparencia_eja_importacoes')
    .select('id, fonte_resumo, data_atualizacao')
    .eq('id', importacaoId)
    .single<{ id: string; fonte_resumo: string; data_atualizacao: string | null }>()
  if (importacaoError) throw importacaoError

  const { error: deleteError } = await supabase.from('transparencia_eja_linhas').delete().eq('importacao_id', importacaoId)
  if (deleteError) throw deleteError

  if (rows.length > 0) {
    const fonte = importacao.fonte_resumo?.trim() || 'Não informado'
    const dataAtualizacao = importacao.data_atualizacao?.trim() || new Date().toISOString().slice(0, 10)
    const linhas = rows.flatMap((row, index) => {
      const ordemBase = index * 2 + 1
      return [
        {
          importacao_id: importacaoId,
          ano: row.ano,
          localizacao: 'Urbana',
          quantidade: row.urbana,
          fonte,
          data_atualizacao: dataAtualizacao,
          ordem: ordemBase,
        },
        {
          importacao_id: importacaoId,
          ano: row.ano,
          localizacao: 'Rural',
          quantidade: row.rural,
          fonte,
          data_atualizacao: dataAtualizacao,
          ordem: ordemBase + 1,
        },
      ]
    })

    const { error: insertError } = await supabase.from('transparencia_eja_linhas').insert(linhas)
    if (insertError) throw insertError
  }

  return { ok: true as const }
}
