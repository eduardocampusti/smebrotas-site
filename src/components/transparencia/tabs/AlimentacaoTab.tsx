import { SimpleMetricsTab } from './SimpleMetricsTab'

export function AlimentacaoTab() {
  return (
    <SimpleMetricsTab
      title="Alimentacao Escolar"
      description="Produção de refeicoes e composicao da origem dos alimentos."
      csvFileName="alimentacao.csv"
      chartTitle="Refeicoes por unidade (mes)"
      kpis={[
        { label: 'Refeicoes/dia', value: '3.450' },
        { label: '% Agric. Familiar', value: '32%' },
        { label: 'Investimento/mes', value: 'R$ 186 mil' },
      ]}
      data={[
        { label: 'E.M. Centro', value: 840 },
        { label: 'E.M. Lagoa', value: 690 },
        { label: 'E.M. Serra', value: 720 },
        { label: 'E.M. Rural', value: 610 },
      ]}
    />
  )
}
