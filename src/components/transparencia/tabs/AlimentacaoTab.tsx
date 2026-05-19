import { useEffect, useState } from 'react'
import { getAlimentacaoPublic, type AlimentacaoRow, type AlimentacaoEscolaRow } from '@/services/transparencia/alimentacaoService'
import { SimpleMetricsTab } from './SimpleMetricsTab'
import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'

export function AlimentacaoTab() {
  const [alimentacao, setAlimentacao] = useState<AlimentacaoRow | null>(null)
  const [escolas, setEscolas] = useState<AlimentacaoEscolaRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAlimentacaoPublic()
      .then(res => { if (res) { setAlimentacao(res.alimentacao); setEscolas(res.escolas) } })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TransparenciaTabSkeleton />
  if (!alimentacao) return <TransparenciaEmptyState />

  const investFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(alimentacao.investimento_mes)
  const chartData = escolas.map(e => ({ label: e.escola.replace('E.M. ', '').replace(' (Sede)', ''), value: e.refeicoes_mes }))

  return (
    <SimpleMetricsTab
      title="Alimentação Escolar"
      description={`Produção de refeições e composição da origem dos alimentos. Fonte: ${alimentacao.fonte}`}
      csvFileName="alimentacao-escolar.csv"
      chartTitle="Refeições servidas por unidade (mês)"
      kpis={[
        { label: 'Refeições/dia', value: alimentacao.refeicoes_dia.toLocaleString('pt-BR') },
        { label: '% Agric. Familiar', value: `${Number(alimentacao.percentual_af).toFixed(1)}%` },
        { label: 'Investimento/mês', value: investFormatted },
      ]}
      data={chartData}
    />
  )
}
