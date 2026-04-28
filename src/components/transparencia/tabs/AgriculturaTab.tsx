import { SimpleMetricsTab } from './SimpleMetricsTab'

export function AgriculturaTab() {
  return (
    <SimpleMetricsTab
      title="Agricultura Familiar"
      description="Acompanhamento da meta PNAE e participacao de fornecedores locais."
      csvFileName="agricultura-familiar.csv"
      chartTitle="% de compras da agricultura familiar"
      kpis={[
        { label: '% atual', value: '32%' },
        { label: 'Meta PNAE', value: '30%' },
        { label: 'Nº fornecedores', value: '18' },
      ]}
      data={[
        { label: 'Jan', value: 28 },
        { label: 'Fev', value: 30 },
        { label: 'Mar', value: 33 },
        { label: 'Abr', value: 32 },
      ]}
    />
  )
}
