import { useEffect, useState } from 'react'
import { getTransportePublic, type TransporteRow, type TransporteRotaRow } from '@/services/transparencia/transporteService'
import { SimpleMetricsTab } from './SimpleMetricsTab'
import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'

export function TransporteTab() {
  const [transporte, setTransporte] = useState<TransporteRow | null>(null)
  const [rotas, setRotas] = useState<TransporteRotaRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTransportePublic()
      .then(res => { if (res) { setTransporte(res.transporte); setRotas(res.rotas) } })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TransparenciaTabSkeleton />
  if (!transporte) return <TransparenciaEmptyState />

  const chartData = rotas.map(r => ({ label: r.zona.replace('Zona ', '').replace('Região ', ''), value: r.total_alunos }))

  return (
    <SimpleMetricsTab
      title="Transporte Escolar"
      description={`Alunos atendidos, frota ativa e distâncias operacionais por rota — ${transporte.ano}. Fonte: ${transporte.fonte}`}
      csvFileName="transporte-escolar.csv"
      chartTitle={`Alunos atendidos por zona — ${transporte.ano}`}
      kpis={[
        { label: 'Total alunos', value: transporte.total_alunos.toLocaleString('pt-BR') },
        { label: 'Rotas ativas', value: String(transporte.rotas_ativas) },
        { label: 'Km/dia', value: `${transporte.km_dia.toLocaleString('pt-BR')} km` },
      ]}
      data={chartData}
    />
  )
}
