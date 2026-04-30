import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect, useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getIdebPublicData, type IdebDataset } from '@/services/transparencia/idebService'

import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'

const ETAPAS = ['Anos Iniciais', 'Anos Finais', 'Ensino Médio'] as const
const HISTORICO_ANOS = [2019, 2021, 2023]

export function IdebTab() {
  const [loading, setLoading] = useState(true)
  const [dataset, setDataset] = useState<IdebDataset | null>(null)
  const [error, setError] = useState<string | null>(null)

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
  const infraestrutura = useMemo(() => indicadores.filter((x) => x.grupo === 'Infraestrutura'), [indicadores])
  const saeb = useMemo(() => indicadores.filter((x) => x.grupo === 'SAEB por disciplina'), [indicadores])
  const rendimento = useMemo(() => indicadores.filter((x) => x.grupo === 'Rendimento e fluxo escolar'), [indicadores])

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
  const cards = [
    {
      label: 'IDEB Anos Iniciais',
      value: municipalOficial.find((x) => x.etapa === 'Anos Iniciais')?.ideb?.toLocaleString('pt-BR') ?? '—',
    },
    {
      label: 'IDEB Anos Finais',
      value: municipalOficial.find((x) => x.etapa === 'Anos Finais')?.ideb?.toLocaleString('pt-BR') ?? '—',
    },
    {
      label: 'IDEB Ensino Médio',
      value: municipalOficial.find((x) => x.etapa === 'Ensino Médio')?.ideb?.toLocaleString('pt-BR') ?? '—',
    },
    {
      label: 'Melhor escola com dado disponível',
      value: melhorEscola ? `${melhorEscola.escola} — ${melhorEscola.ideb?.toLocaleString('pt-BR') ?? '—'}` : '—',
    },
  ]

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
        {cards.map((card) => (
          <TransparenciaKpiCard key={card.label} label={card.label} value={card.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>IDEB 2023 por etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={municipalOficial}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="etapa" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="ideb" fill="#0B4F8A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>IDEB 2023 por escola</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={escolasAtual.map((x) => ({ ...x, nomeCurto: x.escola.replace('Escola Municipal ', '') }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="nomeCurto" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="ideb" fill="#0B4F8A" radius={[6, 6, 0, 0]} name="IDEB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>Aprendizado x Fluxo por escola</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={escolasAtual.map((x) => ({ ...x, nomeCurto: x.escola.replace('Escola Municipal ', '') }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="nomeCurto" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="aprendizado" fill="#0B4F8A" name="Aprendizado" />
                  <Bar dataKey="fluxo" fill="#10B981" name="Fluxo" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>Dispersão: Fluxo x Aprendizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="fluxo" name="Fluxo" domain={[0, 1]} />
                  <YAxis type="number" dataKey="aprendizado" name="Aprendizado" domain={[0, 10]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={escolasAtual} fill="#F59E0B" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>BLOCO 2 — Evolução do IDEB (2019–2023)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="ano" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line connectNulls type="monotone" dataKey="Anos Iniciais" stroke="#0B4F8A" strokeWidth={2} />
                <Line connectNulls type="monotone" dataKey="Anos Finais" stroke="#0EA5E9" strokeWidth={2} />
                <Line connectNulls type="monotone" dataKey="Ensino Médio" stroke="#DC2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Infraestrutura escolar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={infraestrutura}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="indicador" width={180} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="valor" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200 py-0">
          <CardHeader><CardTitle>SAEB por disciplina</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={saeb}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="etapa" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#14B8A6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 py-0">
          <CardHeader><CardTitle>Rendimento escolar por etapa</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rendimento}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="etapa" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
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
                  <TableHead>Fonte</TableHead>
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
                    <TableCell>{row?.fonte}</TableCell>
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
                  <TableHead>Leitura técnica</TableHead>
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
                    <TableCell>{row.leitura_tecnica ?? '—'}</TableCell>
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
                  <TableHead>Fonte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicadores.map((row) => (
                    <TableRow key={`${row.id ?? `${row.grupo}-${row.indicador}-${row.etapa}`}`}>
                      <TableCell>{row.ano ?? '—'}</TableCell>
                      <TableCell>{row.grupo}</TableCell>
                      <TableCell>{row.indicador}</TableCell>
                      <TableCell>{row.etapa ?? '—'}</TableCell>
                      <TableCell>{row.valor?.toLocaleString('pt-BR') ?? '—'}</TableCell>
                      <TableCell>{row.unidade ?? '—'}</TableCell>
                      <TableCell>{row.fonte ?? '—'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Aviso institucional</AlertTitle>
        <AlertDescription>
          Nem todas as escolas aparecem no IDEB, pois algumas podem não ter dados disponíveis no Saeb ou não atender aos critérios de divulgação.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTitle>Aviso institucional</AlertTitle>
        <AlertDescription>
          O Ensino Médio deve ser interpretado com cuidado, pois normalmente a responsabilidade direta da oferta é da rede estadual.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTitle>Dados complementares de série histórica</AlertTitle>
        <AlertDescription>
          Os dados de evolução e comparativos estão identificados como dados complementares informados para visualização histórica (fonte: QEdu/INEP).
        </AlertDescription>
      </Alert>

      <p className="text-xs text-slate-500">Fontes: INEP/MEC, QEdu, Censo Escolar e relatório técnico municipal.</p>
    </div>
  )
}
