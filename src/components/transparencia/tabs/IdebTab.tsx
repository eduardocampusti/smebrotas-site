import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useEffect, useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getIdebPublicData, type IdebDataset } from '@/services/transparencia/idebService'

import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaExportCsvButton } from '../TransparenciaExportCsvButton'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'

const ETAPAS = ['Anos Iniciais', 'Anos Finais', 'Ensino Médio'] as const

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

  const historico = useMemo(() => {
    const anos = [2019, 2021, 2023]
    return anos.map((ano) => {
      const rowIniciais = (dataset?.municipal ?? []).find((r) => r.ano === ano && r.etapa === 'Anos Iniciais')
      const rowFinais = (dataset?.municipal ?? []).find((r) => r.ano === ano && r.etapa === 'Anos Finais')
      const rowMedio = (dataset?.municipal ?? []).find((r) => r.ano === ano && r.etapa === 'Ensino Médio')
      return {
        ano: String(ano),
        anosIniciais: rowIniciais?.ideb ?? null,
        anosFinais: rowFinais?.ideb ?? null,
        ensinoMedio: rowMedio?.ideb ?? null,
      }
    })
  }, [dataset])

  const csvRows = useMemo(
    () =>
      (dataset?.municipal ?? []).map((item) => ({
        ano: item.ano,
        etapa: item.etapa,
        ideb: item.ideb,
        matematica: item.matematica,
        portugues: item.portugues,
        fluxo: item.fluxo,
        fonte: item.fonte,
      })),
    [dataset],
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

  const melhorEscola = escolasAtual[0]
  const cards = [
    {
      label: 'IDEB Anos Iniciais',
      value: municipalAtual.find((x) => x?.etapa === 'Anos Iniciais')?.ideb.toLocaleString('pt-BR') ?? '—',
    },
    {
      label: 'IDEB Anos Finais',
      value: municipalAtual.find((x) => x?.etapa === 'Anos Finais')?.ideb.toLocaleString('pt-BR') ?? '—',
    },
    {
      label: 'IDEB Ensino Médio',
      value: municipalAtual.find((x) => x?.etapa === 'Ensino Médio')?.ideb.toLocaleString('pt-BR') ?? '—',
    },
    {
      label: 'Melhor escola com dado disponível',
      value: melhorEscola ? `${melhorEscola.escola} — IDEB ${melhorEscola.ideb.toLocaleString('pt-BR')}` : '—',
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">IDEB</h3>
          <p className="text-sm text-slate-600">
            Índice de Desenvolvimento da Educação Básica de Brotas de Macaúbas.
          </p>
          <p className="text-xs text-slate-500">
            O IDEB combina aprendizagem e fluxo escolar para análise da qualidade da educação básica.
          </p>
        </div>
        <TransparenciaExportCsvButton fileName="ideb-brotas.csv" rows={csvRows} />
      </div>

      <Alert>
        <AlertTitle>Leitura técnica</AlertTitle>
        <AlertDescription>
          O IDEB de Brotas de Macaúbas em 2023 mostra melhor desempenho nos Anos Iniciais, com IDEB 5,1, queda nos Anos Finais, com 4,8, e situação mais delicada no Ensino Médio, com 3,8. Nos Anos Iniciais, o fluxo escolar está muito alto, então a principal frente de melhoria é fortalecer a aprendizagem em Língua Portuguesa e Matemática.
        </AlertDescription>
      </Alert>

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
                <BarChart data={municipalAtual}>
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
                <BarChart data={escolasAtual}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="escola" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="ideb" fill="#0B4F8A" radius={[6, 6, 0, 0]} />
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
                <BarChart data={escolasAtual}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="escola" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="aprendizado" fill="#0B4F8A" />
                  <Bar dataKey="fluxo" fill="#10B981" />
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
          <CardTitle>Série temporal IDEB (2019, 2021 e 2023)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="ano" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line connectNulls type="monotone" dataKey="anosIniciais" stroke="#0B4F8A" strokeWidth={2} />
                <Line connectNulls type="monotone" dataKey="anosFinais" stroke="#0EA5E9" strokeWidth={2} />
                <Line connectNulls type="monotone" dataKey="ensinoMedio" stroke="#DC2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Tabela detalhada IDEB</CardTitle>
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
                {municipalAtual.map((row) => (
                  <TableRow key={`${row?.ano}-${row?.etapa}`}>
                    <TableCell>{row?.etapa}</TableCell>
                    <TableCell>{row?.ideb.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{row?.matematica.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{row?.portugues.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{row?.fluxo.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{row?.fonte}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Avisos importantes</AlertTitle>
        <AlertDescription>
          Nem toda escola aparece no IDEB, pois algumas podem não ter dados disponíveis no Saeb ou não atender aos critérios de divulgação. O ranking escolar apresentado considera apenas as escolas com dados disponíveis. O Ensino Médio deve ser interpretado com cuidado, pois normalmente a oferta é da rede estadual.
        </AlertDescription>
      </Alert>
    </div>
  )
}
