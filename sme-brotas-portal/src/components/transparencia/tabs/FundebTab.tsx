import { SimpleMetricsTab } from './SimpleMetricsTab'

export function FundebTab() {
  return (
    <SimpleMetricsTab
      title="FUNDEB"
      description="Monitoramento mensal de receita, despesa e aplicacao do fundo."
      csvFileName="fundeb.csv"
      chartTitle="Receita x despesa por periodo"
      kpis={[{ label: 'Total recebido', value: 'R$ 4,2 mi' }, { label: 'Total aplicado', value: 'R$ 3,9 mi' }, { label: 'Saldo', value: 'R$ 300 mil' }]}
      data={[{ label: 'Jan', value: 320 }, { label: 'Fev', value: 340 }, { label: 'Mar', value: 355 }, { label: 'Abr', value: 332 }]}
    />
  )
}
