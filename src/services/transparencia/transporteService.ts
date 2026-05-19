import { supabase } from '@/config/supabase'

export interface TransporteRow {
  id: string
  ano: number
  total_alunos: number
  rotas_ativas: number
  km_dia: number
  num_veiculos: number
  valor_contrato: number
  fonte: string
  publicado: boolean
  created_at: string
  updated_at: string
}

export interface TransporteRotaRow {
  id: string
  transporte_id: string
  zona: string
  total_alunos: number
  ordem: number
}

export async function getTransportePublic(): Promise<{ transporte: TransporteRow; rotas: TransporteRotaRow[] } | null> {
  const { data, error } = await supabase
    .from('transp_transporte')
    .select('*, rotas:transp_transporte_rotas(*)')
    .eq('publicado', true)
    .order('ano', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  const rotas = ((data as any).rotas ?? []).sort((a: TransporteRotaRow, b: TransporteRotaRow) => a.ordem - b.ordem)
  return { transporte: data as TransporteRow, rotas }
}

export async function getAllTransporteAdmin(): Promise<TransporteRow[]> {
  const { data, error } = await supabase
    .from('transp_transporte')
    .select('*')
    .order('ano', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getTransporteRotas(transporteId: string): Promise<TransporteRotaRow[]> {
  const { data, error } = await supabase
    .from('transp_transporte_rotas')
    .select('*')
    .eq('transporte_id', transporteId)
    .order('ordem', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function upsertTransporte(row: Partial<TransporteRow>): Promise<string> {
  const payload = { ...row, updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('transp_transporte').upsert(payload).select('id').single()
  if (error) throw error
  return (data as any).id
}

export async function upsertTransporteRotas(transporteId: string, rotas: Omit<TransporteRotaRow, 'id'>[]): Promise<void> {
  await supabase.from('transp_transporte_rotas').delete().eq('transporte_id', transporteId)
  if (rotas.length === 0) return
  const { error } = await supabase.from('transp_transporte_rotas').insert(rotas.map((r, i) => ({ ...r, transporte_id: transporteId, ordem: i + 1 })))
  if (error) throw error
}

export async function deleteTransporte(id: string): Promise<void> {
  const { error } = await supabase.from('transp_transporte').delete().eq('id', id)
  if (error) throw error
}
