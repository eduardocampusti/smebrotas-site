import { supabase } from '@/config/supabase'

export interface AgriculturaRow {
  id: string
  ano: number
  mes: string | null
  percentual_af: number
  meta_pnae: number
  num_fornecedores: number
  valor_total: number
  valor_af: number
  fonte: string
  publicado: boolean
  created_at: string
  updated_at: string
}

export async function getAgriculturaPublic(): Promise<AgriculturaRow[]> {
  const { data, error } = await supabase
    .from('transp_agricultura')
    .select('*')
    .eq('publicado', true)
    .order('ano', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAgriculturaAdmin(): Promise<{ data: AgriculturaRow[]; source: 'database' | 'fallback' }> {
  try {
    const { data, error } = await supabase
      .from('transp_agricultura')
      .select('*')
      .order('ano', { ascending: false })
    if (error) throw error
    return { data: data ?? [], source: data && data.length > 0 ? 'database' : 'fallback' }
  } catch {
    return { data: [], source: 'fallback' }
  }
}

export async function upsertAgricultura(row: Partial<AgriculturaRow>): Promise<void> {
  const payload = { ...row, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('transp_agricultura').upsert(payload)
  if (error) throw error
}

export async function deleteAgricultura(id: string): Promise<void> {
  const { error } = await supabase.from('transp_agricultura').delete().eq('id', id)
  if (error) throw error
}

export async function toggleAgriculturaPublicado(id: string, publicado: boolean): Promise<void> {
  const { error } = await supabase.from('transp_agricultura').update({ publicado }).eq('id', id)
  if (error) throw error
}
