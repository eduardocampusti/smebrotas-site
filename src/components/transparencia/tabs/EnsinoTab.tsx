import { useEffect, useState } from 'react'
import { getEnsinoPublic, type EnsinoRow, type EnsinoDisciplinaRow } from '@/services/transparencia/ensinoService'
import { SimpleMetricsTab } from './SimpleMetricsTab'
import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'

export function EnsinoTab() {
  const [dados, setDados] = useState<{ ensino: EnsinoRow; disciplinas: EnsinoDisciplinaRow[] }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEnsinoPublic()
      .then(setDados)
      .catch(() => setDados([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TransparenciaTabSkeleton />
  if (!dados.length) return <TransparenciaEmptyState />

  // Pega o mais recente EF I para KPIs principais
  const latestEF = dados[0]
  const { ensino, disciplinas } = latestEF
  const chartData = disciplinas.map(d => ({ label: d.disciplina.replace('Língua ', ''), value: Number(d.media_nota) }))

  return (
    <SimpleMetricsTab
      title="Ensino"
      description={`Fluxo escolar e desempenho por disciplina — ${ensino.modalidade} (${ensino.ano}). Fonte: ${ensino.fonte}`}
      csvFileName="ensino-escolar.csv"
      chartTitle={`Média por disciplina — ${ensino.modalidade} (${ensino.ano})`}
      kpis={[
        { label: 'Taxa aprovação', value: `${Number(ensino.taxa_aprovacao).toFixed(1)}%` },
        { label: 'Freq. média', value: `${Number(ensino.frequencia_media).toFixed(1)}%` },
        { label: 'Taxa abandono', value: `${Number(ensino.taxa_abandono).toFixed(1)}%` },
      ]}
      data={chartData}
    />
  )
}
