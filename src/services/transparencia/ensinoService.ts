import { supabase } from '@/config/supabase'

export interface EnsinoRow {
  id: string
  ano: number
  modalidade: string
  taxa_aprovacao: number
  taxa_reprovacao: number
  taxa_abandono: number
  frequencia_media: number
  total_alunos: number
  fonte: string
  publicado: boolean
  created_at: string
  updated_at: string
}

export interface EnsinoDisciplinaRow {
  id: string
  ensino_id: string
  disciplina: string
  media_nota: number
  ordem: number
}

export async function getEnsinoPublic(): Promise<{ ensino: EnsinoRow; disciplinas: EnsinoDisciplinaRow[] }[]> {
  const { data, error } = await supabase
    .from('transp_ensino')
    .select('*, disciplinas:transp_ensino_disciplinas(*)')
    .eq('publicado', true)
    .order('ano', { ascending: false })
  if (error) return []
  return (data ?? []).map((row: any) => ({
    ensino: row as EnsinoRow,
    disciplinas: (row.disciplinas ?? []).sort((a: EnsinoDisciplinaRow, b: EnsinoDisciplinaRow) => a.ordem - b.ordem),
  }))
}

export async function getAllEnsinoAdmin(): Promise<EnsinoRow[]> {
  const { data, error } = await supabase
    .from('transp_ensino')
    .select('*')
    .order('ano', { ascending: false })
    .order('modalidade', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getEnsinoDisciplinas(ensinoId: string): Promise<EnsinoDisciplinaRow[]> {
  const { data, error } = await supabase
    .from('transp_ensino_disciplinas')
    .select('*')
    .eq('ensino_id', ensinoId)
    .order('ordem', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function upsertEnsino(row: Partial<EnsinoRow>): Promise<string> {
  const payload = { ...row, updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('transp_ensino').upsert(payload).select('id').single()
  if (error) throw error
  return (data as any).id
}

export async function upsertEnsinoDisciplinas(ensinoId: string, disciplinas: Omit<EnsinoDisciplinaRow, 'id'>[]): Promise<void> {
  await supabase.from('transp_ensino_disciplinas').delete().eq('ensino_id', ensinoId)
  if (disciplinas.length === 0) return
  const { error } = await supabase.from('transp_ensino_disciplinas').insert(disciplinas.map((d, i) => ({ ...d, ensino_id: ensinoId, ordem: i + 1 })))
  if (error) throw error
}

export async function deleteEnsino(id: string): Promise<void> {
  const { error } = await supabase.from('transp_ensino').delete().eq('id', id)
  if (error) throw error
}
