import { supabase } from '@/config/supabase'

export interface CardapioRow {
  id: string
  semana_ref: string
  data_inicio: string | null
  data_fim: string | null
  escolas_atendidas: number
  faixas_etarias: number
  ativo: boolean
  publicado: boolean
  created_at: string
  updated_at: string
}

export interface CardapioItemRow {
  id: string
  cardapio_id: string
  dia_semana: string
  ordem_dia: number
  cafe_manha: string
  almoco: string
  lanche: string
}

export async function getCardapioAtivoPublic(): Promise<{ cardapio: CardapioRow; itens: CardapioItemRow[] } | null> {
  const { data, error } = await supabase
    .from('transp_cardapio')
    .select('*, itens:transp_cardapio_itens(*)')
    .eq('publicado', true)
    .eq('ativo', true)
    .order('data_inicio', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  const itens = ((data as any).itens ?? []).sort((a: CardapioItemRow, b: CardapioItemRow) => a.ordem_dia - b.ordem_dia)
  return { cardapio: data as CardapioRow, itens }
}

export async function getAllCardapiosAdmin(): Promise<CardapioRow[]> {
  const { data, error } = await supabase
    .from('transp_cardapio')
    .select('*')
    .order('data_inicio', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getCardapioItens(cardapioId: string): Promise<CardapioItemRow[]> {
  const { data, error } = await supabase
    .from('transp_cardapio_itens')
    .select('*')
    .eq('cardapio_id', cardapioId)
    .order('ordem_dia', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function upsertCardapio(row: Partial<CardapioRow>): Promise<string> {
  const payload = { ...row, updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('transp_cardapio').upsert(payload).select('id').single()
  if (error) throw error
  return (data as any).id
}

export async function upsertCardapioItens(cardapioId: string, itens: Omit<CardapioItemRow, 'id'>[]): Promise<void> {
  await supabase.from('transp_cardapio_itens').delete().eq('cardapio_id', cardapioId)
  if (itens.length === 0) return
  const { error } = await supabase.from('transp_cardapio_itens').insert(itens.map((it, i) => ({ ...it, cardapio_id: cardapioId, ordem_dia: i + 1 })))
  if (error) throw error
}

export async function deleteCardapio(id: string): Promise<void> {
  const { error } = await supabase.from('transp_cardapio').delete().eq('id', id)
  if (error) throw error
}

export async function setCardapioAtivo(id: string): Promise<void> {
  await supabase.from('transp_cardapio').update({ ativo: false }).neq('id', id)
  await supabase.from('transp_cardapio').update({ ativo: true, publicado: true }).eq('id', id)
}
