import { SimpleMetricsTab } from './SimpleMetricsTab'

export function TransporteTab() {
  return (
    <SimpleMetricsTab
      title="Transporte Escolar"
      description="Alunos atendidos, frota ativa e distancias operacionais por rota."
      csvFileName="transporte.csv"
      chartTitle="Alunos atendidos por zona"
      kpis={[{ label: 'Total alunos', value: '1.148' }, { label: 'Rotas ativas', value: '17' }, { label: 'Km/dia', value: '1.240 km' }]}
      data={[{ label: 'Centro', value: 240 }, { label: 'Regiao Norte', value: 320 }, { label: 'Regiao Sul', value: 290 }, { label: 'Regiao Rural', value: 298 }]}
    />
  )
}
