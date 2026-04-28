import { SimpleMetricsTab } from './SimpleMetricsTab'

export function EjaTab() {
  return (
    <SimpleMetricsTab
      title="EJA"
      description="Matriz inicial de acompanhamento de matriculas e concluintes."
      csvFileName="eja.csv"
      chartTitle="Matriculas EJA por turno"
      kpis={[{ label: 'Matriculas', value: '210' }, { label: 'Concluintes', value: '146' }, { label: 'Taxa conclusao', value: '69,5%' }]}
      data={[{ label: 'Manha', value: 42 }, { label: 'Tarde', value: 68 }, { label: 'Noite', value: 100 }]}
    />
  )
}
