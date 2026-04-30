import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { IdebTab } from './IdebTab'
import type { IdebDataset } from '@/services/transparencia/idebService'

const mockGetIdebPublicData = vi.fn<() => Promise<IdebDataset>>()

vi.mock('@/services/transparencia/idebService', () => ({
  getIdebPublicData: () => mockGetIdebPublicData(),
}))

function MockChart({
  testId,
  data,
  children,
}: {
  testId: string
  data?: unknown[]
  children?: ReactNode
}) {
  return (
    <div data-testid={testId} data-points={Array.isArray(data) ? data.length : 0}>
      {children}
    </div>
  )
}

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  CartesianGrid: () => <div data-testid="grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
  LabelList: () => <div data-testid="label-list" />,
  Cell: () => <div data-testid="cell" />,
  Bar: ({ children }: { children?: ReactNode }) => <div data-testid="bar">{children}</div>,
  Line: () => <div data-testid="line" />,
  Scatter: ({ children }: { children?: ReactNode }) => <div data-testid="scatter">{children}</div>,
  BarChart: ({ data, children }: { data?: unknown[]; children?: ReactNode }) => (
    <MockChart testId="bar-chart" data={data}>
      {children}
    </MockChart>
  ),
  LineChart: ({ data, children }: { data?: unknown[]; children?: ReactNode }) => (
    <MockChart testId="line-chart" data={data}>
      {children}
    </MockChart>
  ),
  ScatterChart: ({ children }: { children?: ReactNode }) => <div data-testid="scatter-chart">{children}</div>,
  ComposedChart: ({ data, children }: { data?: unknown[]; children?: ReactNode }) => (
    <MockChart testId="composed-chart" data={data}>
      {children}
    </MockChart>
  ),
}))

const datasetComDados: IdebDataset = {
  source: 'database',
  municipal: [
    { ano: 2023, etapa: 'Anos Iniciais', ideb: 5.1, publicado: true, observacao: 'dados_oficiais_relatorio_2023' },
    { ano: 2023, etapa: 'Anos Finais', ideb: 4.8, publicado: true, observacao: 'dados_oficiais_relatorio_2023' },
    { ano: 2023, etapa: 'Ensino Médio', ideb: 3.8, publicado: true, observacao: 'dados_oficiais_relatorio_2023' },
    { ano: 2019, etapa: 'Anos Iniciais', ideb: 5.4, publicado: true, observacao: 'dados_complementares_historicos' },
    { ano: 2021, etapa: 'Anos Iniciais', ideb: 5.2, publicado: true, observacao: 'dados_complementares_historicos' },
    { ano: 2023, etapa: 'Anos Iniciais', ideb: 5.3, publicado: true, observacao: 'dados_complementares_historicos' },
    { ano: 2019, etapa: 'Anos Finais', ideb: 4.1, publicado: true, observacao: 'dados_complementares_historicos' },
    { ano: 2021, etapa: 'Anos Finais', ideb: 3.9, publicado: true, observacao: 'dados_complementares_historicos' },
    { ano: 2023, etapa: 'Anos Finais', ideb: 4.0, publicado: true, observacao: 'dados_complementares_historicos' },
  ],
  escolas: [
    { ano: 2023, escola: 'Escola Municipal A', etapa: 'Anos Iniciais', aprendizado: 5.6, fluxo: 1, ideb: 5.7, publicado: true },
    { ano: 2023, escola: 'Escola Municipal B', etapa: 'Anos Finais', aprendizado: 5.1, fluxo: 0.99, ideb: 5.1, publicado: true },
    { ano: 2023, escola: 'Escola Municipal C', etapa: 'Ensino Médio', aprendizado: 4.3, fluxo: 0.92, ideb: 4.0, publicado: true },
  ],
  indicadores: [
    { ano: 2023, grupo: 'Infraestrutura', indicador: 'Internet Banda Larga', etapa: null, valor: 75, unidade: 'percentual', publicado: true },
    { ano: 2023, grupo: 'Infraestrutura', indicador: 'Biblioteca / Sala de Leitura', etapa: null, valor: 60, unidade: 'percentual', publicado: true },
    { ano: 2023, grupo: 'SAEB por disciplina', indicador: 'Língua Portuguesa', etapa: '5º ano', valor: 198.5, unidade: 'pontos', publicado: true },
    { ano: 2023, grupo: 'SAEB por disciplina', indicador: 'Matemática', etapa: '9º ano', valor: 248.6, unidade: 'pontos', publicado: true },
    { ano: 2023, grupo: 'Rendimento e fluxo escolar', indicador: 'Aprovação', etapa: 'Anos Iniciais', valor: 96.2, unidade: 'percentual', publicado: true },
    { ano: 2023, grupo: 'Rendimento e fluxo escolar', indicador: 'Reprovação', etapa: 'Anos Finais', valor: 9.8, unidade: 'percentual', publicado: true },
    { ano: 2023, grupo: 'Rendimento e fluxo escolar', indicador: 'Abandono', etapa: 'Ensino Médio', valor: 4.4, unidade: 'percentual', publicado: true },
  ],
}

describe('IdebTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetIdebPublicData.mockResolvedValue(datasetComDados)
  })

  it('renderiza os 6 gráficos principais com dados válidos', async () => {
    render(<IdebTab />)

    const barCharts = await screen.findAllByTestId('bar-chart')
    expect(barCharts.length).toBeGreaterThanOrEqual(6)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument()
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument()

    const pontosGraficos = barCharts.map((chart) => Number(chart.getAttribute('data-points') ?? '0'))
    expect(pontosGraficos.some((qtd) => qtd > 0)).toBe(true)
  })

  it('exibe as 3 etapas nas tabelas de IDEB', async () => {
    render(<IdebTab />)

    await screen.findByText('Tabela IDEB municipal')
    expect(screen.getAllByText('Anos Iniciais').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Anos Finais').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ensino Médio').length).toBeGreaterThan(0)
  })

  it('mantém tabelas com scroll horizontal e colunas reduzidas em mobile 375px', async () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))
    render(<IdebTab />)

    await screen.findByText('Tabela IDEB por escola')
    const wrappersComScroll = document.querySelectorAll('.overflow-x-auto')
    expect(wrappersComScroll.length).toBeGreaterThanOrEqual(3)

    const colunasReduzidasNoMobile = document.querySelectorAll('.hidden.sm\\:table-cell')
    expect(colunasReduzidasNoMobile.length).toBeGreaterThanOrEqual(3)
    expect(document.querySelectorAll('.md\\:hidden').length).toBe(0)
    expect(screen.getByText('Escola Municipal A')).toBeInTheDocument()
    expect(screen.getByText('Leitura técnica')).toHaveClass('hidden', 'sm:table-cell')
  })

  it('mostra estado vazio quando API retorna dados vazios, sem gráfico em branco', async () => {
    mockGetIdebPublicData.mockResolvedValue({
      source: 'database',
      municipal: [],
      escolas: [],
      indicadores: [],
    })

    render(<IdebTab />)

    await waitFor(() => {
      expect(screen.getByText('Nenhum dado cadastrado ainda')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
  })
})
