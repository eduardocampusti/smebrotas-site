import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransparenciaExportCsvButton } from '../TransparenciaExportCsvButton'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'
import { getPublicadaMaisRecenteMatriculas } from '@/services/transparencia/matriculasImportacaoService'
import {
  mapMatriculasImportacaoToPublicTab,
  type MatriculasTabPublicData,
} from '@/services/transparencia/transparenciaMapper'

/** Cores por etapa (gráfico de barras — alinhado às chaves de `porEtapaOrdenado`). */
const CORES_ETAPAS: Record<string, string> = {
  Creche: '#2563eb',
  'Pré-escola': '#f59e0b',
  'Anos Iniciais': '#16a34a',
  'Anos Finais': '#7c3aed',
  EJA: '#dc2626',
  'AEE / Educação Especial': '#ea580c',
}
const CORES_COMPOSICAO = ['#0B4F8A', '#16A34A', '#CA8A04']
const CORES_LOCALIZACAO = ['#0B4F8A', '#22C55E']
const CORES_EVOLUCAO = {
  totalGeral: '#0B4F8A',
  urbana: '#1D4ED8',
  rural: '#065F46',
  educacaoEspecial: '#9D174D',
}
const CORES_EVOLUCAO_LOCALIZACAO = {
  urbana: '#0B4F8A',
  rural: '#10B981',
  totalGeral: '#F59E0B',
} as const

function ChartEmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
      <p className="text-sm text-slate-700">{text}</p>
    </div>
  )
}

type TooltipLocalizacaoPayloadEntry = {
  name?: string
  value?: number | string
  fill?: string
  color?: string
}

function TooltipLocalizacao({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipLocalizacaoPayloadEntry[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-[160px] rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xl">
      <p className="mb-2 border-b border-slate-100 pb-2 font-bold text-[#0B2545]">Ano: {label}</p>
      {payload.map((entry, i) => {
        const num = Number(entry.value)
        const texto = Number.isFinite(num) ? num.toLocaleString('pt-BR') : String(entry.value ?? '')
        return (
          <div key={i} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: entry.fill || entry.color }}
              />
              <span className="text-slate-600">{entry.name}</span>
            </div>
            <span className="font-bold text-[#0B2545]">{texto}</span>
          </div>
        )
      })}
    </div>
  )
}

function LegendaCustom({ payload }: { payload?: ReadonlyArray<{ value?: string; color?: string }> }) {
  if (!payload?.length) return null
  return (
    <div className="mt-3 flex justify-center gap-5">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm" style={{ background: entry.color }} />
          <span className="text-xs font-medium text-slate-600">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

/** Fallback quando não há importação publicada (formato alinhado ao mapper público). */
export const MATRICULAS_TAB_MOCK: MatriculasTabPublicData = {
  mostrarAvisoDemonstrativo: true,
  kpisPrincipais: [
    { label: 'Total geral importado', value: '2.662' },
    { label: 'Infantil + Fundamental', value: '2.360' },
    { label: 'EJA', value: '210' },
    { label: 'AEE / Educação Especial', value: '92' },
    { label: 'Ano de referência', value: '2023' },
  ],
  porEtapaOrdenado: [
    { etapa: 'Creche', quantidade: 620 },
    { etapa: 'Pré-escola', quantidade: 580 },
    { etapa: 'Anos Iniciais', quantidade: 720 },
    { etapa: 'Anos Finais', quantidade: 440 },
    { etapa: 'EJA', quantidade: 210 },
    { etapa: 'AEE / Educação Especial', quantidade: 92 },
  ],
  composicaoImportacao: [
    { name: 'Infantil + Fundamental', value: 2360 },
    { name: 'EJA', value: 210 },
    { name: 'AEE / Educação Especial', value: 92 },
  ],
  evolucaoAnual: [
    { ano: '2020', totalGeral: 2450, urbana: 1510, rural: 940, educacaoEspecial: 68 },
    { ano: '2021', totalGeral: 2520, urbana: 1540, rural: 980, educacaoEspecial: 74 },
    { ano: '2022', totalGeral: 2590, urbana: 1600, rural: 990, educacaoEspecial: 86 },
    { ano: '2023', totalGeral: 2662, urbana: 1710, rural: 952, educacaoEspecial: 92 },
  ],
  podeExibirEvolucaoAnual: true,
  localizacao: {
    visivel: true,
    serie: [
      { name: 'Urbana', value: 1710 },
      { name: 'Rural', value: 952 },
    ],
  },
  rodape: {
    fonte: 'Dados ilustrativos para demonstração do painel',
    anoReferencia: '2023',
    dataAtualizacao: '—',
    statusLabel: 'Demonstrativo',
  },
}

function buildMatriculasExportRows(data: MatriculasTabPublicData): Record<string, string>[] {
  const rows: Record<string, string>[] = []
  const push = (categoria: string, rotulo: string, valor: string) => {
    rows.push({ categoria, rotulo, valor })
  }

  for (const k of data.kpisPrincipais) {
    push('Indicadores principais', k.label, k.value)
  }
  for (const e of data.porEtapaOrdenado) {
    push('Matrículas por etapa de ensino', e.etapa, String(e.quantidade))
  }
  for (const c of data.composicaoImportacao) {
    push('Composição dos registros importados', c.name, String(c.value))
  }
  if (data.localizacao.visivel && data.localizacao.serie?.length) {
    for (const z of data.localizacao.serie) {
      push('Localização', z.name, String(z.value))
    }
  } else {
    push(
      'Localização',
      'Observação',
      'Dados por localização urbana/rural não disponíveis nesta importação.',
    )
  }
  if (data.podeExibirEvolucaoAnual) {
    for (const ev of data.evolucaoAnual) {
      push('Evolução anual', `${ev.ano} - Total Geral`, String(ev.totalGeral))
      push('Evolução anual', `${ev.ano} - Urbana`, String(ev.urbana))
      push('Evolução anual', `${ev.ano} - Rural`, String(ev.rural))
      push('Evolução anual', `${ev.ano} - Educação Especial`, String(ev.educacaoEspecial))
    }
  } else {
    push(
      'Evolução anual',
      'Observação',
      'A evolução anual será exibida quando houver importações de anos anteriores.',
    )
  }
  push('Fonte dos dados', 'Fonte', data.rodape.fonte)
  push('Fonte dos dados', 'Ano de referência', data.rodape.anoReferencia)
  push('Fonte dos dados', 'Data de atualização', data.rodape.dataAtualizacao)
  push('Fonte dos dados', 'Status', data.rodape.statusLabel)
  return rows
}

export function MatriculasTab() {
  const [data, setData] = useState<MatriculasTabPublicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const publicada = await getPublicadaMaisRecenteMatriculas()
      if (!publicada) {
        setData(MATRICULAS_TAB_MOCK)
      } else {
        setData(mapMatriculasImportacaoToPublicTab(publicada.importacao, publicada.linhas))
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Não foi possível carregar os dados de matrículas.'
      setError(message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, retryToken])

  const csvRows = useMemo(() => (data ? buildMatriculasExportRows(data) : []), [data])

  const handleRetry = () => {
    setRetryToken((n) => n + 1)
  }

  if (loading) {
    return <TransparenciaTabSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <p>{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const composicaoComDados = data.composicaoImportacao.filter((item) => item.value > 0)
  const podeExibirEvolucao = data.podeExibirEvolucaoAnual && data.evolucaoAnual.length > 1

  return (
    <div className="space-y-5">
      {data.mostrarAvisoDemonstrativo ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          role="status"
        >
          Dados demonstrativos. Nenhuma importação publicada encontrada.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Matrículas</h3>
          <p className="text-sm text-slate-600">
            {data.mostrarAvisoDemonstrativo
              ? 'Valores apenas ilustrativos até existir uma importação publicada no painel administrativo.'
              : 'Indicadores consolidados a partir da importação publicada no portal da transparência.'}
          </p>
        </div>
        <TransparenciaExportCsvButton fileName="matriculas.csv" rows={csvRows} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {data.kpisPrincipais.map((kpi) => (
          <TransparenciaKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            borderTopClass={
              kpi.label === 'Total geral importado'
                ? 'border-t-blue-700'
                : kpi.label === 'Infantil + Fundamental'
                  ? 'border-t-emerald-600'
                  : kpi.label === 'EJA'
                    ? 'border-t-violet-600'
                    : kpi.label === 'AEE / Educação Especial'
                      ? 'border-t-rose-600'
                      : kpi.label === 'Ano de referência'
                        ? 'border-t-amber-600'
                        : 'border-t-blue-700'
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border border-slate-200 py-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Matrículas por etapa de ensino</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.porEtapaOrdenado}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="etapa" interval={0} angle={-12} textAnchor="end" height={56} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                    {data.porEtapaOrdenado.map((entry, index) => (
                      <Cell
                        key={`etapa-${entry.etapa}-${index}`}
                        fill={CORES_ETAPAS[entry.etapa] ?? '#64748b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>Composição dos registros importados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {composicaoComDados.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={composicaoComDados}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {composicaoComDados.map((_, index) => (
                        <Cell key={String(index)} fill={CORES_COMPOSICAO[index % CORES_COMPOSICAO.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                  Não há dados de composição para exibir.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border border-slate-200 py-0 xl:col-span-1">
          <CardHeader>
            <CardTitle>Urbana × Rural</CardTitle>
          </CardHeader>
          <CardContent>
            {data.localizacao.visivel && data.localizacao.serie?.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.localizacao.serie}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {data.localizacao.serie.map((entry, index) => (
                        <Cell key={entry.name} fill={CORES_LOCALIZACAO[index % CORES_LOCALIZACAO.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState text="Dados por localização urbana/rural não disponíveis nesta importação." />
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 py-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Evolução anual</CardTitle>
          </CardHeader>
          <CardContent>
            {podeExibirEvolucao ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
                  {data.evolucaoAnual.map((item) => (
                    <div key={item.ano} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="text-xs font-semibold text-slate-900">{item.ano}</p>
                      <p className="mt-1 text-xs text-slate-700">Total: {item.totalGeral.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-slate-700">Urbana: {item.urbana.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-slate-700">Rural: {item.rural.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-slate-700">
                        Educação Especial: {item.educacaoEspecial.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="mb-2 text-sm font-semibold text-slate-900">Evolução anual por localização</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.evolucaoAnual} barCategoryGap="25%">
                          <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="ano"
                            tick={{ fontSize: 12, fill: '#94A3B8' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#94A3B8' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => Number(v).toLocaleString('pt-BR')}
                          />
                          <Tooltip content={<TooltipLocalizacao />} cursor={{ fill: '#EFF6FF', radius: 4 }} />
                          <Legend content={<LegendaCustom />} />
                          <Bar
                            dataKey="urbana"
                            name="Urbana"
                            fill={CORES_EVOLUCAO_LOCALIZACAO.urbana}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={18}
                          />
                          <Bar
                            dataKey="rural"
                            name="Rural"
                            fill={CORES_EVOLUCAO_LOCALIZACAO.rural}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={18}
                          />
                          <Bar
                            dataKey="totalGeral"
                            name="Total geral"
                            fill={CORES_EVOLUCAO_LOCALIZACAO.totalGeral}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={18}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="mb-2 text-sm font-semibold text-slate-900">Evolução da Educação Especial</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.evolucaoAnual}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="ano" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="educacaoEspecial"
                            name="Educação Especial"
                            fill={CORES_EVOLUCAO.educacaoEspecial}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ChartEmptyState text="A evolução anual será exibida quando houver importações de anos anteriores." />
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="border-t border-slate-200 pt-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">Fonte dos dados</p>
        <dl className="mt-2 grid gap-1 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Fonte</dt>
            <dd>{data.rodape.fonte}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Ano de referência</dt>
            <dd>{data.rodape.anoReferencia}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Data de atualização</dt>
            <dd>{data.rodape.dataAtualizacao}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd>{data.rodape.statusLabel}</dd>
          </div>
        </dl>
      </footer>
    </div>
  )
}
