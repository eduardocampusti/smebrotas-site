import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useEffect, useMemo, useState } from 'react'
import { Info } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Tooltip as UiTooltip,
  TooltipContent as UiTooltipContent,
  TooltipProvider as UiTooltipProvider,
  TooltipTrigger as UiTooltipTrigger,
} from '@/components/ui/tooltip'
import { getIdebPublicData, type IdebDataset } from '@/services/transparencia/idebService'

import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'

const ETAPAS = ['Anos Iniciais', 'Anos Finais', 'Ensino Médio'] as const
const HISTORICO_ANOS = [2019, 2021, 2023]
const INFRAESTRUTURA_ALIASES = ['infraestrutura escolar', 'infraestrutura']
const SAEB_ALIASES = ['saeb por disciplina', 'saeb']
const RENDIMENTO_ALIASES = ['rendimento escolar por etapa', 'rendimento e fluxo escolar', 'rendimento escolar']
const COMPARATIVO_ALIASES = ['comparativo 2021']
const COLOR_ANOS_INICIAIS = '#1a5276'
const COLOR_ANOS_FINAIS = '#1e8449'
const COLOR_ENSINO_MEDIO = '#2e4057'
const COLOR_META_NACIONAL = 'rgba(93, 173, 226, 0.55)'
const COLOR_APROVACAO = '#27ae60'
const COLOR_REPROVACAO = '#e67e22'
const COLOR_ABANDONO = '#c0392b'
const COLOR_PORTUGUES = '#1a5276'
const COLOR_MATEMATICA = '#1e8449'
const COLOR_INFRA_BAIXO_REFERENCIA = '#1e3a5f'
const COLOR_INFRA_ACIMA_REFERENCIA = '#1e8449'
const SCHOOL_SHORT_NAME_MAP: Record<string, string> = {
  'escola municipal dr.': 'Dr. ACM',
  'escola municipal professor agostinho': 'Agostinho',
  'escola municipal mariana lima': 'M. Lima',
}
const SCHOOL_COLOR_MAP: Record<string, string> = {
  'Dr. ACM': '#2563eb',
  Agostinho: '#16a34a',
  'M. Lima': '#f97316',
}
const ETAPA_COLORS: Record<string, string> = {
  'Anos Iniciais': COLOR_ANOS_INICIAIS,
  'Anos Finais': COLOR_ANOS_FINAIS,
  'Ensino Médio': COLOR_ENSINO_MEDIO,
}
const META_NACIONAL_2023: Record<string, number> = {
  'Anos Iniciais': 6.0,
  'Anos Finais': 5.5,
  'Ensino Médio': 5.2,
}

function normalizeText(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function formatChartNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n.toFixed(1) : '—'
}

function formatSaebValue(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 1,
    maximumFractionDigits: 1,
  })
}

function getMetaStatus(ideb: number | null | undefined, meta: number | null | undefined) {
  if (ideb === null || ideb === undefined || meta === null || meta === undefined) return 'sem-dado'
  const diff = ideb - meta
  if (diff >= 0.2) return 'acima'
  if (diff <= -0.2) return 'abaixo'
  return 'na-meta'
}

function getGrupoFiltro(grupo: string | null | undefined) {
  const normalized = normalizeText(grupo)
  if (COMPARATIVO_ALIASES.includes(normalized)) return 'comparativo'
  if (RENDIMENTO_ALIASES.includes(normalized)) return 'rendimento'
  if (SAEB_ALIASES.includes(normalized)) return 'saeb'
  if (INFRAESTRUTURA_ALIASES.includes(normalized)) return 'infraestrutura'
  return 'outros'
}

function getIndicadorBadgeClass(indicador: string | null | undefined) {
  const normalized = normalizeText(indicador)
  if (normalized === 'brotas de macaubas') return 'border-sky-300 bg-sky-50 text-sky-700'
  if (normalized === 'bahia') return 'border-emerald-300 bg-emerald-50 text-emerald-700'
  if (normalized === 'brasil') return 'border-amber-300 bg-amber-50 text-amber-700'
  return 'border-slate-300 bg-slate-50 text-slate-700'
}

function getSchoolShortName(fullName: string) {
  const normalized = normalizeText(fullName)
  for (const [key, value] of Object.entries(SCHOOL_SHORT_NAME_MAP)) {
    if (normalized.includes(key)) return value
  }
  return fullName.replace('Escola Municipal ', '')
}

export function IdebTab() {
  const [loading, setLoading] = useState(true)
  const [dataset, setDataset] = useState<IdebDataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [grupoFiltro, setGrupoFiltro] = useState<'todos' | 'comparativo' | 'rendimento' | 'saeb' | 'infraestrutura'>(
    'todos',
  )
  const [etapaFiltro, setEtapaFiltro] = useState<'todas' | (typeof ETAPAS)[number]>('todas')
  const [paginaIndicadores, setPaginaIndicadores] = useState(1)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getIdebPublicData()
        if (cancelled) return
        setDataset(data)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Erro ao carregar dados IDEB.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const currentYear = useMemo(() => {
    if (!dataset?.municipal.length) return 2023
    return Math.max(...dataset.municipal.map((r) => r.ano))
  }, [dataset])

  const municipalAtual = useMemo(
    () =>
      ETAPAS.map((etapa) => dataset?.municipal.find((row) => row.ano === currentYear && row.etapa === etapa)).filter(
        Boolean,
      ),
    [dataset, currentYear],
  )

  const escolasAtual = useMemo(
    () =>
      (dataset?.escolas ?? [])
        .filter((row) => row.ano === currentYear)
        .sort((a, b) => (a.posicao ?? 999) - (b.posicao ?? 999)),
    [dataset, currentYear],
  )

  const municipalHistorico = useMemo(
    () =>
      (dataset?.municipal ?? []).filter((row) => row.observacao === 'dados_complementares_historicos' && row.ideb !== null),
    [dataset],
  )

  const municipalOficial = useMemo(
    () =>
      (dataset?.municipal ?? []).filter((row) => row.ano === currentYear && row.observacao === 'dados_oficiais_relatorio_2023'),
    [dataset, currentYear],
  )

  const historico = useMemo(() => {
    return HISTORICO_ANOS.map((ano) => {
      const rowIniciais = municipalHistorico.find((r) => r.ano === ano && r.etapa === 'Anos Iniciais')
      const rowFinais = municipalHistorico.find((r) => r.ano === ano && r.etapa === 'Anos Finais')
      const rowMedio = municipalHistorico.find((r) => r.ano === ano && r.etapa === 'Ensino Médio')
      return {
        ano: String(ano),
        'Anos Iniciais': rowIniciais?.ideb ?? null,
        'Anos Finais': rowFinais?.ideb ?? null,
        'Ensino Médio': rowMedio?.ideb ?? null,
      }
    })
  }, [municipalHistorico])

  const indicadores = dataset?.indicadores ?? []
  const infraestrutura = useMemo(
    () => indicadores.filter((x) => INFRAESTRUTURA_ALIASES.includes(normalizeText(x.grupo))),
    [indicadores],
  )
  const saeb = useMemo(
    () => indicadores.filter((x) => SAEB_ALIASES.includes(normalizeText(x.grupo))),
    [indicadores],
  )
  const saebPorDisciplina = useMemo(
    () =>
      ['Língua Portuguesa', 'Matemática'].map((disciplina) => {
        const itens = saeb.filter((item) => normalizeText(item.indicador) === normalizeText(disciplina))
        const quintoAno = itens.find((item) => normalizeText(item.etapa) === '5º ano')?.valor ?? null
        const nonoAno = itens.find((item) => normalizeText(item.etapa) === '9º ano')?.valor ?? null
        return {
          disciplina,
          quintoAno,
          nonoAno,
          cor: disciplina === 'Língua Portuguesa' ? COLOR_PORTUGUES : COLOR_MATEMATICA,
        }
      }),
    [saeb],
  )
  const rendimento = useMemo(
    () => indicadores.filter((x) => RENDIMENTO_ALIASES.includes(normalizeText(x.grupo))),
    [indicadores],
  )
  const rendimentoPorEtapa = useMemo(
    () =>
      ETAPAS.map((etapa) => {
        const itensDaEtapa = rendimento.filter((item) => item.etapa === etapa)
        const aprovacao = itensDaEtapa.find((item) => normalizeText(item.indicador).includes('aprov'))?.valor ?? null
        const reprovacao = itensDaEtapa.find((item) => normalizeText(item.indicador).includes('reprov'))?.valor ?? null
        const abandono = itensDaEtapa.find((item) => normalizeText(item.indicador).includes('abandon'))?.valor ?? null
        return { etapa, aprovacao, reprovacao, abandono }
      }),
    [rendimento],
  )
  const indicadoresFiltrados = useMemo(() => {
    return indicadores.filter((row) => {
      const grupoOk = grupoFiltro === 'todos' ? true : getGrupoFiltro(row.grupo) === grupoFiltro
      const etapaOk = etapaFiltro === 'todas' ? true : row.etapa === etapaFiltro
      return grupoOk && etapaOk
    })
  }, [indicadores, grupoFiltro, etapaFiltro])
  const INDICADORES_POR_PAGINA = 8
  const totalPaginasIndicadores = Math.max(1, Math.ceil(indicadoresFiltrados.length / INDICADORES_POR_PAGINA))
  const paginaIndicadoresAjustada = Math.min(paginaIndicadores, totalPaginasIndicadores)
  const indicadoresPaginados = useMemo(() => {
    const start = (paginaIndicadoresAjustada - 1) * INDICADORES_POR_PAGINA
    return indicadoresFiltrados.slice(start, start + INDICADORES_POR_PAGINA)
  }, [indicadoresFiltrados, paginaIndicadoresAjustada])

  useEffect(() => {
    setPaginaIndicadores(1)
  }, [grupoFiltro, etapaFiltro])
  const escolasChartData = useMemo(
    () =>
      escolasAtual.map((x) => {
        const nomeCurto = getSchoolShortName(x.escola)
        return {
          ...x,
          nomeCurto,
          corEscola: SCHOOL_COLOR_MAP[nomeCurto] ?? COLOR_APROVACAO,
        }
      }),
    [escolasAtual],
  )

  if (loading) return <TransparenciaTabSkeleton />
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        {error}
      </div>
    )
  }
  if (!dataset || municipalAtual.length === 0) {
    return <TransparenciaEmptyState />
  }

  const melhorEscola = [...escolasAtual].sort((a, b) => (b.ideb ?? 0) - (a.ideb ?? 0))[0]
  const melhorEscolaNome = melhorEscola ? melhorEscola.escola.replace('Escola Municipal ', '') : null
  const comparativoMeta = ETAPAS.map((etapa) => {
    const row = municipalOficial.find((x) => x.etapa === etapa)
    const ideb = row?.ideb ?? null
    const meta = META_NACIONAL_2023[etapa]
    const diff = ideb !== null ? ideb - meta : null
    return { etapa, ideb, meta, diff, status: getMetaStatus(ideb, meta) }
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">IDEB</h3>
          <p className="text-sm text-slate-600">Índice de Desenvolvimento da Educação Básica de Brotas de Macaúbas</p>
          <p className="text-xs text-slate-500">
            O IDEB combina aprendizagem e fluxo escolar. Ele ajuda a acompanhar a qualidade da educação básica e orientar ações de melhoria da rede.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {comparativoMeta.map((item) => (
          <Card key={item.etapa} className="border border-slate-200">
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{item.etapa}</p>
                <Badge
                  variant={item.status === 'abaixo' ? 'destructive' : 'outline'}
                  className={
                    item.status === 'acima'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : item.status === 'abaixo'
                        ? ''
                        : 'border-amber-300 bg-amber-50 text-amber-700'
                  }
                >
                  {item.status === 'acima' ? 'Acima da meta' : item.status === 'abaixo' ? 'Abaixo da meta' : 'Na meta'}
                </Badge>
              </div>
              <p className="text-2xl font-black text-slate-900">{item.ideb?.toLocaleString('pt-BR') ?? '—'}</p>
              {item.etapa === 'Anos Iniciais' && melhorEscola ? (
                <p className="text-xs text-slate-600">
                  Melhor escola: {melhorEscolaNome} — {melhorEscola.ideb?.toLocaleString('pt-BR') ?? '—'}
                </p>
              ) : null}
              <p className="text-xs text-slate-600">Meta nacional 2023: {item.meta.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-slate-500">
                Diferença: {item.diff === null ? '—' : `${item.diff > 0 ? '+' : ''}${item.diff.toLocaleString('pt-BR')}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Como Brotas está em relação às metas nacionais (2023)</CardTitle>
          <p className="text-xs text-slate-500">Comparativo visual entre IDEB medido e meta nacional por etapa.</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativoMeta}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="etapa" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 7]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ideb" name="IDEB Brotas" radius={[6, 6, 0, 0]}>
                  {comparativoMeta.map((entry, index) => (
                    <Cell key={`${entry.etapa}-${index}`} fill={ETAPA_COLORS[entry.etapa] ?? COLOR_ANOS_INICIAIS} />
                  ))}
                  <LabelList dataKey="ideb" position="top" formatter={formatChartNumber} />
                </Bar>
                <Bar dataKey="meta" name="Meta nacional" fill={COLOR_META_NACIONAL} radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="meta" position="top" formatter={formatChartNumber} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>Como está o IDEB de Brotas por etapa (2023)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={municipalOficial}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="etapa" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 7]} />
                  <Tooltip />
                  <Bar dataKey="ideb" radius={[6, 6, 0, 0]}>
                    {municipalOficial.map((entry, index) => (
                      <Cell key={`${entry.etapa}-${index}`} fill={ETAPA_COLORS[entry.etapa] ?? COLOR_ANOS_INICIAIS} />
                    ))}
                    <LabelList dataKey="ideb" position="top" formatter={formatChartNumber} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>Quais escolas tiveram maior IDEB em 2023</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={escolasChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="nomeCurto" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 7]} />
                  <Tooltip />
                  <Bar dataKey="ideb" radius={[6, 6, 0, 0]} name="IDEB">
                    {escolasChartData.map((entry, index) => (
                      <Cell key={`${entry.escola}-${index}`} fill={ETAPA_COLORS[entry.etapa] ?? COLOR_ANOS_INICIAIS} />
                    ))}
                    <LabelList dataKey="ideb" position="top" formatter={formatChartNumber} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>Desempenho por escola: aprendizado e aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={escolasChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="nomeCurto" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="aprendizado" domain={[0, 7]} />
                  <YAxis yAxisId="fluxo" orientation="right" domain={[0, 1]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="aprendizado" dataKey="aprendizado" fill={COLOR_ANOS_INICIAIS} name="Aprendizado" />
                  <Line yAxisId="fluxo" type="monotone" dataKey="fluxo" stroke={COLOR_APROVACAO} strokeWidth={2} dot />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>Relação entre aprovação e aprendizado por escola</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="fluxo"
                    name="Fluxo"
                    domain={[0.9, 1.05]}
                    tickFormatter={(value) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  />
                  <YAxis type="number" dataKey="aprendizado" name="Aprendizado" domain={[4.5, 6.5]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const row = payload[0]?.payload as (typeof escolasChartData)[number] | undefined
                      if (!row) return null
                      return (
                        <div className="rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 shadow-sm">
                          <p className="font-semibold text-slate-900">{row.escola}</p>
                          <p>Aprendizado: {row.aprendizado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '—'}</p>
                          <p>Fluxo: {row.fluxo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '—'}</p>
                        </div>
                      )
                    }}
                  />
                  <Scatter data={escolasChartData} fill={COLOR_APROVACAO} dataKey="aprendizado" name="Aprendizado" r={8}>
                    {escolasChartData.map((entry, index) => (
                      <Cell key={`${entry.escola}-scatter-${index}`} fill={entry.corEscola} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Como o IDEB evoluiu entre 2019 e 2023</CardTitle>
          <p className="text-xs text-slate-500">Leitura rápida: quanto maior o ponto, melhor o resultado da etapa.</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="ano" />
                <YAxis domain={[0, 7]} />
                <Tooltip />
                <Legend />
                <Line
                  connectNulls
                  type="monotone"
                  dataKey="Anos Iniciais"
                  stroke={COLOR_ANOS_INICIAIS}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  connectNulls
                  type="monotone"
                  dataKey="Anos Finais"
                  stroke={COLOR_ANOS_FINAIS}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  connectNulls
                  type="monotone"
                  dataKey="Ensino Médio"
                  stroke={COLOR_ENSINO_MEDIO}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Estrutura das escolas da rede municipal (percentual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {infraestrutura.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={infraestrutura}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="indicador" width={180} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <ReferenceLine
                    x={50}
                    stroke="#64748b"
                    strokeDasharray="4 4"
                    label={{ value: '50%', position: 'insideTopRight', fill: '#64748b', fontSize: 11 }}
                  />
                  <Bar dataKey="valor">
                    {infraestrutura.map((entry, index) => (
                      <Cell
                        key={`${entry.indicador ?? 'infra'}-${index}`}
                        fill={(entry.valor ?? 0) > 50 ? COLOR_INFRA_ACIMA_REFERENCIA : COLOR_INFRA_BAIXO_REFERENCIA}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">Sem dados publicados para infraestrutura escolar.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200 py-0">
          <CardHeader><CardTitle>Desempenho SAEB em Português e Matemática</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              {saeb.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={saebPorDisciplina} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="disciplina" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [formatSaebValue(value), name === 'quintoAno' ? '5º ano' : '9º ano']}
                    />
                    <Legend
                      content={() => (
                        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_PORTUGUES }} />
                            <span>Língua Portuguesa</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_MATEMATICA }} />
                            <span>Matemática</span>
                          </div>
                        </div>
                      )}
                    />
                    <Bar dataKey="quintoAno" name="5º ano" radius={[6, 6, 0, 0]}>
                      {saebPorDisciplina.map((entry, index) => (
                        <Cell key={`${entry.disciplina}-5-${index}`} fill={entry.cor} />
                      ))}
                      <LabelList dataKey="quintoAno" position="top" formatter={formatSaebValue} />
                    </Bar>
                    <Bar dataKey="nonoAno" name="9º ano" radius={[6, 6, 0, 0]}>
                      {saebPorDisciplina.map((entry, index) => (
                        <Cell key={`${entry.disciplina}-9-${index}`} fill={entry.cor} />
                      ))}
                      <LabelList dataKey="nonoAno" position="top" formatter={formatSaebValue} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500">Sem dados publicados para SAEB por disciplina.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 py-0">
          <CardHeader><CardTitle>Aprovação, reprovação e abandono por etapa</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              {rendimentoPorEtapa.some((item) => item.aprovacao !== null || item.reprovacao !== null || item.abandono !== null) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rendimentoPorEtapa} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="etapa" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${formatChartNumber(value)}%`} />
                    <Legend />
                    <Bar dataKey="aprovacao" name="Aprovação" fill={COLOR_APROVACAO} radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="aprovacao" position="top" formatter={(value) => `${formatChartNumber(value)}%`} />
                    </Bar>
                    <Bar dataKey="reprovacao" name="Reprovação" fill={COLOR_REPROVACAO} radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="reprovacao" position="top" formatter={(value) => `${formatChartNumber(value)}%`} />
                    </Bar>
                    <Bar dataKey="abandono" name="Abandono" fill={COLOR_ABANDONO} radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="abandono" position="top" formatter={(value) => `${formatChartNumber(value)}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500">Sem dados publicados para rendimento escolar por etapa.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Tabela IDEB municipal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Etapa</TableHead>
                  <TableHead>IDEB</TableHead>
                  <TableHead>Matemática</TableHead>
                  <TableHead>Português</TableHead>
                  <TableHead>Fluxo</TableHead>
                  <TableHead className="hidden sm:table-cell">Fonte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {municipalOficial.map((row) => (
                  <TableRow key={`${row?.ano}-${row?.etapa}`}>
                    <TableCell>{row?.etapa}</TableCell>
                    <TableCell>{row?.ideb?.toLocaleString('pt-BR') ?? '—'}</TableCell>
                    <TableCell>{row?.matematica?.toLocaleString('pt-BR') ?? '—'}</TableCell>
                    <TableCell>{row?.portugues?.toLocaleString('pt-BR') ?? '—'}</TableCell>
                    <TableCell>{row?.fluxo?.toLocaleString('pt-BR') ?? '—'}</TableCell>
                    <TableCell className="hidden sm:table-cell">{row?.fonte}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Tabela IDEB por escola</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Escola</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>IDEB</TableHead>
                  <TableHead>Aprendizado</TableHead>
                  <TableHead>Fluxo</TableHead>
                  <TableHead className="hidden sm:table-cell">Leitura técnica</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escolasAtual.map((row) => (
                  <TableRow key={`${row.escola}-${row.ano}-${row.etapa}`}>
                    <TableCell>{row.escola}</TableCell>
                    <TableCell>{row.etapa}</TableCell>
                    <TableCell>{row.ideb?.toLocaleString('pt-BR') ?? '—'}</TableCell>
                    <TableCell>{row.aprendizado?.toLocaleString('pt-BR') ?? '—'}</TableCell>
                    <TableCell>{row.fluxo?.toLocaleString('pt-BR') ?? '—'}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {row.leitura_tecnica ? (
                        <UiTooltipProvider>
                          <UiTooltip>
                            <UiTooltipTrigger className="block max-w-[280px] truncate text-left">
                              {row.leitura_tecnica}
                            </UiTooltipTrigger>
                            <UiTooltipContent className="max-w-sm whitespace-normal">
                              {row.leitura_tecnica}
                            </UiTooltipContent>
                          </UiTooltip>
                        </UiTooltipProvider>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Tabela indicadores complementares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Grupo</span>
              <Select
                value={grupoFiltro}
                onValueChange={(value) =>
                  setGrupoFiltro(value as 'todos' | 'comparativo' | 'rendimento' | 'saeb' | 'infraestrutura')
                }
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os grupos</SelectItem>
                  <SelectItem value="comparativo">Comparativo 2021</SelectItem>
                  <SelectItem value="rendimento">Rendimento e fluxo</SelectItem>
                  <SelectItem value="saeb">SAEB</SelectItem>
                  <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Etapa</span>
              <Select value={etapaFiltro} onValueChange={(value) => setEtapaFiltro(value as 'todas' | (typeof ETAPAS)[number])}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as etapas</SelectItem>
                  {ETAPAS.map((etapa) => (
                    <SelectItem key={etapa} value={etapa}>
                      {etapa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="hidden sm:table-cell">Fonte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicadoresPaginados.map((row) => (
                    <TableRow key={`${row.id ?? `${row.grupo}-${row.indicador}-${row.etapa}`}`}>
                      <TableCell>{row.ano ?? '—'}</TableCell>
                      <TableCell>{row.grupo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getIndicadorBadgeClass(row.indicador)}>
                          {row.indicador}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.etapa ?? '—'}</TableCell>
                      <TableCell>{row.valor?.toLocaleString('pt-BR') ?? '—'}</TableCell>
                      <TableCell>{row.unidade ?? '—'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{row.fonte ?? '—'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Página {paginaIndicadoresAjustada} de {totalPaginasIndicadores} ({indicadoresFiltrados.length} registros)
            </p>
            <Pagination className="justify-start sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaIndicadores((prev) => Math.max(1, prev - 1))}
                    disabled={paginaIndicadoresAjustada <= 1}
                  >
                    Anterior
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                    onClick={(e) => e.preventDefault()}
                    size="default"
                  >
                    {paginaIndicadoresAjustada}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaIndicadores((prev) => Math.min(totalPaginasIndicadores, prev + 1))}
                    disabled={paginaIndicadoresAjustada >= totalPaginasIndicadores}
                  >
                    Próximo
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Alert variant="default">
        <Info />
        <AlertTitle>Aviso institucional</AlertTitle>
        <AlertDescription>
          Nem todas as escolas aparecem no IDEB, pois algumas podem não ter dados disponíveis no Saeb ou não atender aos critérios de divulgação.
        </AlertDescription>
      </Alert>

      <Alert variant="default">
        <Info />
        <AlertTitle>Aviso institucional</AlertTitle>
        <AlertDescription>
          O Ensino Médio deve ser interpretado com cuidado, pois normalmente a responsabilidade direta da oferta é da rede estadual.
        </AlertDescription>
      </Alert>

      <Alert variant="default">
        <Info />
        <AlertTitle>Dados complementares de série histórica</AlertTitle>
        <AlertDescription>
          Os dados de evolução e comparativos estão identificados como dados complementares informados para visualização histórica (fonte: QEdu/INEP).
        </AlertDescription>
      </Alert>

      <p className="text-xs text-slate-500">Fontes: INEP/MEC, QEdu, Censo Escolar e relatório técnico municipal.</p>
    </div>
  )
}
