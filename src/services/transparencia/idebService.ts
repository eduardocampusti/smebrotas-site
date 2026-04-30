import { supabase } from '@/config/supabase'

export type IdebMunicipalRow = {
  id?: string
  ano: number
  municipio?: string | null
  uf?: string | null
  etapa: 'Anos Iniciais' | 'Anos Finais' | 'Ensino Médio'
  ideb: number | null
  meta_projetada?: number | null
  matematica?: number | null
  portugues?: number | null
  proficiencia_media?: number | null
  taxa_aprovacao?: number | null
  fluxo?: number | null
  fonte?: string | null
  observacao?: string | null
  publicado: boolean
}

export type IdebEscolaRow = {
  id?: string
  ano: number
  escola: string
  etapa: 'Anos Iniciais' | 'Anos Finais' | 'Ensino Médio'
  posicao?: number | null
  aprendizado: number | null
  fluxo: number | null
  ideb: number | null
  leitura_tecnica?: string | null
  fonte?: string | null
  publicado: boolean
}

export type IdebIndicadorRow = {
  id?: string
  ano: number | null
  grupo: string
  indicador: string
  etapa?: string | null
  valor: number | null
  unidade?: string | null
  fonte?: string | null
  publicado: boolean
}

export type IdebDataset = {
  municipal: IdebMunicipalRow[]
  escolas: IdebEscolaRow[]
  indicadores: IdebIndicadorRow[]
  source: 'database' | 'fallback'
}

const MUNICIPAL_FALLBACK: IdebMunicipalRow[] = [
  {
    ano: 2023,
    municipio: 'Brotas de Macaúbas',
    uf: 'BA',
    etapa: 'Anos Iniciais',
    ideb: 5.1,
    matematica: 5.09,
    portugues: 5.15,
    fluxo: 1,
    fonte: 'Relatório técnico municipal / QEdu / INEP',
    observacao: 'dados_oficiais_relatorio_2023',
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
    fonte: 'Relatório técnico municipal / QEdu / INEP',
    observacao: 'dados_oficiais_relatorio_2023',
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
    fonte: 'Relatório técnico municipal / QEdu / INEP',
    observacao: 'dados_oficiais_relatorio_2023',
    publicado: true,
  },
  {
    ano: 2019,
    municipio: 'Brotas de Macaúbas',
    uf: 'BA',
    etapa: 'Anos Iniciais',
    ideb: 5.4,
    meta_projetada: 4.7,
    proficiencia_media: 5.68,
    taxa_aprovacao: 95,
    fonte: 'QEdu/INEP',
    observacao: 'dados_complementares_historicos',
    publicado: true,
  },
  {
    ano: 2021,
    municipio: 'Brotas de Macaúbas',
    uf: 'BA',
    etapa: 'Anos Iniciais',
    ideb: 5.2,
    meta_projetada: 5.0,
    proficiencia_media: 5.3,
    taxa_aprovacao: 98,
    fonte: 'QEdu/INEP',
    observacao: 'dados_complementares_historicos',
    publicado: true,
  },
  {
    ano: 2023,
    municipio: 'Brotas de Macaúbas',
    uf: 'BA',
    etapa: 'Anos Iniciais',
    ideb: 5.3,
    meta_projetada: 5.2,
    proficiencia_media: 5.42,
    taxa_aprovacao: 96,
    fonte: 'QEdu/INEP',
    observacao: 'dados_complementares_historicos',
    publicado: true,
  },
]

const ESCOLAS_FALLBACK: IdebEscolaRow[] = [
  {
    ano: 2023,
    escola: 'Escola Municipal Dr. Antonio Carlos Magalhães',
    etapa: 'Anos Iniciais',
    posicao: 1,
    aprendizado: 5.66,
    fluxo: 1.0,
    ideb: 5.7,
    leitura_tecnica:
      'Melhor resultado entre as escolas listadas; combina maior aprendizado com aprovação máxima.',
    fonte: 'Relatório técnico municipal / QEdu / INEP',
    publicado: true,
  },
  {
    ano: 2023,
    escola: 'Escola Municipal Agostinho Ribeiro',
    etapa: 'Anos Iniciais',
    posicao: 2,
    aprendizado: 5.17,
    fluxo: 0.99,
    ideb: 5.1,
    leitura_tecnica: 'Resultado positivo, com pequena redução por fluxo inferior a 1,00.',
    fonte: 'Relatório técnico municipal / QEdu / INEP',
    publicado: true,
  },
  {
    ano: 2023,
    escola: 'Escola Municipal Maria de Meira Lima Costa',
    etapa: 'Anos Iniciais',
    posicao: 2,
    aprendizado: 5.12,
    fluxo: 1.0,
    ideb: 5.1,
    leitura_tecnica:
      'Aprovação plena; ganho futuro depende mais do aprendizado medido pelo Saeb.',
    fonte: 'Relatório técnico municipal / QEdu / INEP',
    publicado: true,
  },
]

const INDICADORES_FALLBACK: IdebIndicadorRow[] = [
  { ano: 2021, grupo: 'Comparativo 2021', indicador: 'Brotas de Macaúbas', etapa: 'Anos Iniciais', valor: 5.2, unidade: 'indice', fonte: 'QEdu/INEP', publicado: true },
  { ano: 2021, grupo: 'Comparativo 2021', indicador: 'Brotas de Macaúbas', etapa: 'Anos Finais', valor: 3.9, unidade: 'indice', fonte: 'QEdu/INEP', publicado: true },
  { ano: 2021, grupo: 'Comparativo 2021', indicador: 'Bahia', etapa: 'Anos Iniciais', valor: 4.9, unidade: 'indice', fonte: 'QEdu/INEP', publicado: true },
  { ano: 2021, grupo: 'Comparativo 2021', indicador: 'Bahia', etapa: 'Anos Finais', valor: 3.8, unidade: 'indice', fonte: 'QEdu/INEP', publicado: true },
  { ano: 2021, grupo: 'Comparativo 2021', indicador: 'Brasil', etapa: 'Anos Iniciais', valor: 5.8, unidade: 'indice', fonte: 'QEdu/INEP', publicado: true },
  { ano: 2021, grupo: 'Comparativo 2021', indicador: 'Brasil', etapa: 'Anos Finais', valor: 5.1, unidade: 'indice', fonte: 'QEdu/INEP', publicado: true },
]

export const IDEB_FALLBACK: IdebDataset = {
  municipal: MUNICIPAL_FALLBACK,
  escolas: ESCOLAS_FALLBACK,
  indicadores: INDICADORES_FALLBACK,
  source: 'fallback',
}

async function fetchIdebData(publicOnly: boolean): Promise<IdebDataset> {
  try {
    const municipalQuery = supabase
      .from('transparencia_ideb_municipal')
      .select('*')
      .order('ano', { ascending: true })
    const escolasQuery = supabase
      .from('transparencia_ideb_escolas')
      .select('*')
      .order('ano', { ascending: true })
      .order('posicao', { ascending: true, nullsFirst: false })
    const indicadoresQuery = supabase
      .from('transparencia_ideb_indicadores')
      .select('*')
      .order('ano', { ascending: true, nullsFirst: false })

    const [municipalRes, escolasRes, indicadoresRes] = await Promise.all([
      publicOnly ? municipalQuery.eq('publicado', true) : municipalQuery,
      publicOnly ? escolasQuery.eq('publicado', true) : escolasQuery,
      publicOnly ? indicadoresQuery.eq('publicado', true) : indicadoresQuery,
    ])

    if (municipalRes.error || escolasRes.error || indicadoresRes.error) return IDEB_FALLBACK
    if (!municipalRes.data?.length) return IDEB_FALLBACK

    return {
      municipal: (municipalRes.data as IdebMunicipalRow[]) ?? [],
      escolas: (escolasRes.data as IdebEscolaRow[]) ?? [],
      indicadores: (indicadoresRes.data as IdebIndicadorRow[]) ?? [],
      source: 'database',
    }
  } catch {
    return IDEB_FALLBACK
  }
}

export async function getIdebPublicData(): Promise<IdebDataset> {
  return fetchIdebData(true)
}

export async function getIdebAdminData(): Promise<IdebDataset> {
  return fetchIdebData(false)
}

type IdebEntity = 'municipal' | 'escolas' | 'indicadores'

const TABLE_BY_ENTITY: Record<IdebEntity, string> = {
  municipal: 'transparencia_ideb_municipal',
  escolas: 'transparencia_ideb_escolas',
  indicadores: 'transparencia_ideb_indicadores',
}

export async function upsertIdebMunicipal(row: IdebMunicipalRow) {
  const payload = { ...row, id: row.id ?? undefined }
  const { error } = await supabase.from(TABLE_BY_ENTITY.municipal).upsert(payload)
  if (error) throw error
}

export async function upsertIdebEscola(row: IdebEscolaRow) {
  const payload = { ...row, id: row.id ?? undefined }
  const { error } = await supabase.from(TABLE_BY_ENTITY.escolas).upsert(payload)
  if (error) throw error
}

export async function upsertIdebIndicador(row: IdebIndicadorRow) {
  const payload = { ...row, id: row.id ?? undefined }
  const { error } = await supabase.from(TABLE_BY_ENTITY.indicadores).upsert(payload)
  if (error) throw error
}

export async function deleteIdebRow(entity: IdebEntity, id: string) {
  const { error } = await supabase.from(TABLE_BY_ENTITY[entity]).delete().eq('id', id)
  if (error) throw error
}

export async function setIdebPublished(entity: IdebEntity, id: string, publicado: boolean) {
  const { error } = await supabase.from(TABLE_BY_ENTITY[entity]).update({ publicado }).eq('id', id)
  if (error) throw error
}
