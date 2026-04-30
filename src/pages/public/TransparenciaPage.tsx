import { useEffect, useState } from 'react'

import { transparenciaTabs } from '@/components/transparencia/mockData'
import { TransparenciaDashboardNav } from '@/components/transparencia/TransparenciaDashboardNav'
import { TransparenciaTabSkeleton } from '@/components/transparencia/TransparenciaTabSkeleton'
import { AlimentacaoTab } from '@/components/transparencia/tabs/AlimentacaoTab'
import { AgriculturaTab } from '@/components/transparencia/tabs/AgriculturaTab'
import { CardapioTab } from '@/components/transparencia/tabs/CardapioTab'
import { EjaTab } from '@/components/transparencia/tabs/EjaTab'
import { EnsinoTab } from '@/components/transparencia/tabs/EnsinoTab'
import { FundebTab } from '@/components/transparencia/tabs/FundebTab'
import { IdebTab } from '@/components/transparencia/tabs/IdebTab'
import { LicitacoesTab } from '@/components/transparencia/tabs/LicitacoesTab'
import { MatriculasTab } from '@/components/transparencia/tabs/MatriculasTab'
import { TransporteTab } from '@/components/transparencia/tabs/TransporteTab'
import type { TransparenciaTabId } from '@/components/transparencia/types'

const TAB_LOADING_MS = 220

export default function TransparenciaPage() {
  const [activeTab, setActiveTab] = useState<TransparenciaTabId>('ideb')
  const [tabLoading, setTabLoading] = useState(false)
  const sortedIndicators = [...transparenciaTabs].sort((a, b) =>
    a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }),
  )

  useEffect(() => {
    document.title = 'Transparência e Indicadores Educacionais | SME Brotas'
  }, [])

  const changeTab = (nextTab: TransparenciaTabId) => {
    if (nextTab === activeTab) return
    setTabLoading(true)
    setActiveTab(nextTab)
  }

  useEffect(() => {
    if (!tabLoading) return
    const timer = window.setTimeout(() => setTabLoading(false), TAB_LOADING_MS)
    return () => window.clearTimeout(timer)
  }, [tabLoading])

  const renderActiveIndicator = () => {
    if (tabLoading) return null

    switch (activeTab) {
      case 'agricultura':
        return <AgriculturaTab />
      case 'alimentacao':
        return <AlimentacaoTab />
      case 'cardapio':
        return <CardapioTab />
      case 'eja':
        return <EjaTab />
      case 'ensino':
        return <EnsinoTab />
      case 'fundeb':
        return <FundebTab />
      case 'ideb':
        return <IdebTab />
      case 'licitacoes':
        return <LicitacoesTab />
      case 'matriculas':
        return <MatriculasTab />
      case 'transporte':
        return <TransporteTab />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="mb-3 space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          Transparência e Indicadores Educacionais
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 md:text-base">
          Painel público com dados educacionais, indicadores de qualidade, financiamento e execução
          da rede municipal de ensino.
        </p>
      </div>

      <TransparenciaDashboardNav
        indicators={sortedIndicators}
        activeIndicator={activeTab}
        onSelect={changeTab}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {tabLoading ? <TransparenciaTabSkeleton /> : null}
        {renderActiveIndicator()}
      </div>
    </div>
  )
}
