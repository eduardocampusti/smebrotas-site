import { useEffect, useState } from 'react'
import { getAgriculturaPublic, type AgriculturaRow } from '@/services/transparencia/agriculturaService'
import { SimpleMetricsTab } from './SimpleMetricsTab'
import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'

export function AgriculturaTab() {
  const [rows, setRows] = useState<AgriculturaRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAgriculturaPublic()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TransparenciaTabSkeleton />
  const latest = rows[0]
  if (!latest) return <TransparenciaEmptyState />

  const chartData = rows.slice(0, 6).reverse().map(r => ({ label: String(r.ano), value: Number(r.percentual_af) }))

  return (
    <SimpleMetricsTab
      title="Agricultura Familiar"
      description={`Acompanhamento da meta PNAE e participação de fornecedores locais. Fonte: ${latest.fonte}`}
      csvFileName="agricultura-familiar.csv"
      chartTitle="% de compras da agricultura familiar por ano"
      kpis={[
        { label: '% atual ('+latest.ano+')', value: `${Number(latest.percentual_af).toFixed(1)}%` },
        { label: 'Meta PNAE', value: `${Number(latest.meta_pnae).toFixed(0)}%` },
        { label: 'Nº fornecedores', value: String(latest.num_fornecedores) },
      ]}
      data={chartData}
    />
  )
}
