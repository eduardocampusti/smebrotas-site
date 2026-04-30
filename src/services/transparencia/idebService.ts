import { supabase } from '@/config/supabase'

export type IdebMunicipalRow = {
  id?: string
  ano: number
  municipio: string
  uf: string
  etapa: 'Anos Iniciais' | 'Anos Finais' | 'Ensino Médio'
  ideb: number
  matematica: number
  portugues: number
  fluxo: number
  fonte: string
  publicado: boolean
}

export type IdebEscolaRow = {
  id?: string
  ano: number
  escola: string
  etapa: 'Anos Iniciais' | 'Anos Finais' | 'Ensino Médio'
  aprendizado: number
  fluxo: number
  ideb: number
  posicao: number | null
  leitura_tecnica: string | null
  fonte: string
  publicado: boolean
}

export type IdebDataset = {
  municipal: IdebMunicipalRow[]
  escolas: IdebEscolaRow[]
  source: 'database' | 'fallback'
}

export const IDEB_FALLBACK: IdebDataset = {
  municipal: [
    {
      ano: 2023,
      municipio: 'Brotas de Macaúbas',
      uf: 'BA',
      etapa: 'Anos Iniciais',
      ideb: 5.1,
      matematica: 5.09,
      portugues: 5.15,
      fluxo: 1,
      fonte: 'QEdu/INEP',
      publicado: true,
    },
    {
      ano: 2023,
      municipio: 'Brotas de Macaúbas',
      uf: 'BA',
      etapa: 'Anos Finais',
      ideb: 4.8,
      matematica: 5.12,
      portugues: 5.29,
      fluxo: 0.92,
      fonte: 'QEdu/INEP',
      publicado: true,
    },
    {
      ano: 2023,
      municipio: 'Brotas de Macaúbas',
      uf: 'BA',
      etapa: 'Ensino Médio',
      ideb: 3.8,
      matematica: 3.99,
      portugues: 4.26,
      fluxo: 0.92,
      fonte: 'QEdu/INEP',
      publicado: true,
    },
  ],
  escolas: [
    {
      ano: 2023,
      escola: 'Escola Municipal Dr. Antonio Carlos Magalhães',
      etapa: 'Anos Iniciais',
      aprendizado: 5.66,
      fluxo: 1,
      ideb: 5.7,
      posicao: 1,
      leitura_tecnica: 'Melhor escola com dado disponível em 2023.',
      fonte: 'QEdu/INEP',
      publicado: true,
    },
    {
      ano: 2023,
      escola: 'Escola Municipal Agostinho Ribeiro',
      etapa: 'Anos Iniciais',
      aprendizado: 5.17,
      fluxo: 0.99,
      ideb: 5.1,
      posicao: 2,
      leitura_tecnica: 'Desempenho consistente com espaço para reforço em aprendizagem.',
      fonte: 'QEdu/INEP',
      publicado: true,
    },
    {
      ano: 2023,
      escola: 'Escola Municipal Maria de Meira Lima Costa',
      etapa: 'Anos Iniciais',
      aprendizado: 5.12,
      fluxo: 1,
      ideb: 5.1,
      posicao: 3,
      leitura_tecnica: 'Fluxo elevado e oportunidade de avanço em português e matemática.',
      fonte: 'QEdu/INEP',
      publicado: true,
    },
  ],
  source: 'fallback',
}

export async function getIdebPublicData(): Promise<IdebDataset> {
  try {
    const [municipalRes, escolasRes] = await Promise.all([
      supabase
        .from('ideb_municipal_data')
        .select('*')
        .eq('publicado', true)
        .order('ano', { ascending: true }),
      supabase
        .from('ideb_school_data')
        .select('*')
        .eq('publicado', true)
        .order('ano', { ascending: true })
        .order('posicao', { ascending: true, nullsFirst: false }),
    ])
    if (municipalRes.error || escolasRes.error) return IDEB_FALLBACK
    if (!municipalRes.data?.length) return IDEB_FALLBACK
    return {
      municipal: (municipalRes.data as IdebMunicipalRow[]) ?? [],
      escolas: (escolasRes.data as IdebEscolaRow[]) ?? [],
      source: 'database',
    }
  } catch {
    return IDEB_FALLBACK
  }
}

export async function getIdebAdminData(): Promise<IdebDataset> {
  try {
    const [municipalRes, escolasRes] = await Promise.all([
      supabase.from('ideb_municipal_data').select('*').order('ano', { ascending: true }),
      supabase
        .from('ideb_school_data')
        .select('*')
        .order('ano', { ascending: true })
        .order('posicao', { ascending: true, nullsFirst: false }),
    ])
    if (municipalRes.error || escolasRes.error) return IDEB_FALLBACK
    if (!municipalRes.data?.length) return IDEB_FALLBACK
    return {
      municipal: (municipalRes.data as IdebMunicipalRow[]) ?? [],
      escolas: (escolasRes.data as IdebEscolaRow[]) ?? [],
      source: 'database',
    }
  } catch {
    return IDEB_FALLBACK
  }
}

export async function saveIdebDraft(payload: { municipal: IdebMunicipalRow[]; escolas: IdebEscolaRow[] }) {
  const municipalRows = payload.municipal.map((row) => ({ ...row, publicado: false }))
  const escolasRows = payload.escolas.map((row) => ({ ...row, publicado: false }))
  const { error: municipalError } = await supabase
    .from('ideb_municipal_data')
    .upsert(municipalRows, { onConflict: 'ano,etapa' })
  if (municipalError) throw municipalError
  const { error: escolasError } = await supabase
    .from('ideb_school_data')
    .upsert(escolasRows, { onConflict: 'ano,escola,etapa' })
  if (escolasError) throw escolasError
}

export async function publishIdebData() {
  const { error: municipalError } = await supabase
    .from('ideb_municipal_data')
    .update({ publicado: true })
    .gte('ano', 0)
  if (municipalError) throw municipalError
  const { error: escolasError } = await supabase
    .from('ideb_school_data')
    .update({ publicado: true })
    .gte('ano', 0)
  if (escolasError) throw escolasError
}

export async function deleteIdebYearSafe(ano: number) {
  const { error: e1 } = await supabase.from('ideb_school_data').delete().eq('ano', ano).eq('publicado', false)
  if (e1) throw e1
  const { error: e2 } = await supabase.from('ideb_municipal_data').delete().eq('ano', ano).eq('publicado', false)
  if (e2) throw e2
}
