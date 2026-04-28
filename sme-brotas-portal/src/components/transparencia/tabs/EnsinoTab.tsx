import { SimpleMetricsTab } from './SimpleMetricsTab'

export function EnsinoTab() {
  return (
    <SimpleMetricsTab
      title="Ensino"
      description="Visao inicial do desempenho por area e indicadores de fluxo escolar."
      csvFileName="ensino.csv"
      chartTitle="Desempenho medio por disciplina"
      kpis={[{ label: 'Taxa aprovacao', value: '89%' }, { label: 'Frequencia media', value: '93%' }, { label: 'Abandono', value: '2,1%' }]}
      data={[{ label: 'Portugues', value: 68 }, { label: 'Matematica', value: 61 }, { label: 'Ciencias', value: 66 }, { label: 'Historia', value: 70 }]}
    />
  )
}
