import type { LucideIcon } from 'lucide-react'

export type TransparenciaTabId =
  | 'ideb'
  | 'matriculas'
  | 'fundeb'
  | 'transporte'
  | 'alimentacao'
  | 'agricultura'
  | 'cardapio'
  | 'licitacoes'
  | 'eja'
  | 'ensino'

export interface TransparenciaTabConfig {
  id: TransparenciaTabId
  label: string
  icon: LucideIcon
  colorClass: string
  description: string
  supportText?: string
}

export interface KpiItem {
  label: string
  value: string
  hint?: string
}
