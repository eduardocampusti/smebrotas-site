import { supabase } from '@/config/supabase'

export interface LicitacaoRow {
  id: string
  numero: string
  objeto: string
  modalidade: string
  valor_estimado: number
  valor_homologado: number | null
  status: string
  data_abertura: string | null
  data_homologacao: string | null
  vencedor: string | null
  link_edital: string | null
  ativo: boolean
  publicado: boolean
  created_at: string
  updated_at: string
}

export const LICITACAO_STATUS = ['Aberta', 'Em andamento', 'Homologada', 'Deserta', 'Revogada', 'Anulada'] as const
export const LICITACAO_MODALIDADES = ['Pregão Eletrônico', 'Pregão Presencial', 'Concorrência Pública', 'Tomada de Preços', 'Convite', 'Dispensa de Licitação'] as const

export async function getLicitacoesPublic(): Promise<LicitacaoRow[]> {
  const { data, error } = await supabase
    .from('transp_licitacoes')
    .select('*')
    .eq('publicado', true)
    .eq('ativo', true)
    .order('data_abertura', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function getAllLicitacoesAdmin(): Promise<LicitacaoRow[]> {
  const { data, error } = await supabase
    .from('transp_licitacoes')
    .select('*')
    .order('data_abertura', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function upsertLicitacao(row: Partial<LicitacaoRow>): Promise<void> {
  const payload = { ...row, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('transp_licitacoes').upsert(payload)
  if (error) throw error
}

export async function deleteLicitacao(id: string): Promise<void> {
  const { error } = await supabase.from('transp_licitacoes').delete().eq('id', id)
  if (error) throw error
}

export async function toggleLicitacaoPublicado(id: string, publicado: boolean): Promise<void> {
  const { error } = await supabase.from('transp_licitacoes').update({ publicado }).eq('id', id)
  if (error) throw error
}
