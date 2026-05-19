import { supabase } from '@/config/supabase'

export interface AlimentacaoRow {
  id: string
  ano: number
  refeicoes_dia: number
  percentual_af: number
  investimento_mes: number
  total_alunos: number
  fonte: string
  publicado: boolean
  created_at: string
  updated_at: string
}

export interface AlimentacaoEscolaRow {
  id: string
  alimentacao_id: string
  escola: string
  refeicoes_mes: number
  ordem: number
}

export async function getAlimentacaoPublic(): Promise<{ alimentacao: AlimentacaoRow; escolas: AlimentacaoEscolaRow[] } | null> {
  const { data, error } = await supabase
    .from('transp_alimentacao')
    .select('*, escolas:transp_alimentacao_escolas(*)')
    .eq('publicado', true)
    .order('ano', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return { alimentacao: data as AlimentacaoRow, escolas: (data as any).escolas ?? [] }
}

export async function getAllAlimentacaoAdmin(): Promise<AlimentacaoRow[]> {
  const { data, error } = await supabase
    .from('transp_alimentacao')
    .select('*')
    .order('ano', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAlimentacaoEscolas(alimentacaoId: string): Promise<AlimentacaoEscolaRow[]> {
  const { data, error } = await supabase
    .from('transp_alimentacao_escolas')
    .select('*')
    .eq('alimentacao_id', alimentacaoId)
    .order('ordem', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function upsertAlimentacao(row: Partial<AlimentacaoRow>): Promise<string> {
  const payload = { ...row, updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('transp_alimentacao').upsert(payload).select('id').single()
  if (error) throw error
  return (data as any).id
}

export async function upsertAlimentacaoEscolas(alimentacaoId: string, escolas: Omit<AlimentacaoEscolaRow, 'id'>[]): Promise<void> {
  await supabase.from('transp_alimentacao_escolas').delete().eq('alimentacao_id', alimentacaoId)
  if (escolas.length === 0) return
  const { error } = await supabase.from('transp_alimentacao_escolas').insert(escolas.map((e, i) => ({ ...e, alimentacao_id: alimentacaoId, ordem: i + 1 })))
  if (error) throw error
}

export async function deleteAlimentacao(id: string): Promise<void> {
  const { error } = await supabase.from('transp_alimentacao').delete().eq('id', id)
  if (error) throw error
}
