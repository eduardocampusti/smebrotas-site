import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'
import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { getFundebPublicData, type FundebDataset } from '@/services/transparencia/fundebService'
import { formatCurrencyBRL, formatMillionBRL, formatPercentBR } from '@/services/transparencia/fundebFormatters'

const COLORS = {
  contribuicao: '#0B4F8A',
  vaaf: '#16A34A',
  vaat: '#F59E0B',
  vaar: '#DC2626',
  total: '#0B4F8A',
}

export function FundebTab() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataset, setDataset] = useState<FundebDataset | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getFundebPublicData()
        if (cancelled) return
        setDataset(data)
        const maxYear = Math.max(...data.annual.map((item) => item.year))
        setSelectedYear(maxYear)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Não foi possível carregar os dados do FUNDEB.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const years = useMemo(() => (dataset ? dataset.annual.map((item) => item.year) : []), [dataset])
  const selectedAnnual = useMemo(
    () => dataset?.annual.find((item) => item.year === selectedYear) ?? null,
    [dataset, selectedYear],
  )
  const selectedVaatIndicator = useMemo(
    () => dataset?.vaatIndicators.find((item) => item.year === selectedYear) ?? null,
    [dataset, selectedYear],
  )
  const fixedGrowth = useMemo(
    () => dataset?.growth.find((item) => item.fromYear === 2023 && item.toYear === 2025) ?? null,
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
  if (!dataset || dataset.annual.length === 0 || !selectedAnnual) {
    return <TransparenciaEmptyState title="Sem dados do FUNDEB publicados" />
  }

  const compositionData = [
    { name: 'Receita contribuição Estados/Municípios', value: selectedAnnual.receita_contribuicao_estados_municipios, color: COLORS.contribuicao },
    { name: 'VAAF', value: selectedAnnual.complementacao_vaaf, color: COLORS.vaaf },
    { name: 'VAAT', value: selectedAnnual.complementacao_vaat, color: COLORS.vaat },
    { name: 'VAAR', value: selectedAnnual.complementacao_vaar, color: COLORS.vaar },
  ]
  const compositionChartData = compositionData.filter((item) => item.value > 0)

  const scheduleData = Array.from(new Set(dataset.vaatSchedule.map((x) => x.month_order))).map((monthOrder) => {
    const label = dataset.vaatSchedule.find((x) => x.month_order === monthOrder)?.month_label ?? ''
    const row: Record<string, string | number> = { month_label: label }
    for (const year of years) {
      row[String(year)] = dataset.vaatSchedule.find((x) => x.year === year && x.month_order === monthOrder)?.value ?? 0
    }
    return row
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-900">{dataset.settings.title}</h3>
          <p className="max-w-3xl text-sm text-slate-600">{dataset.settings.subtitle}</p>
        </div>
        <Badge variant="outline">{dataset.settings.source_text}</Badge>
      </div>

      <Alert>
        <AlertTitle>Os valores apresentados são previstos/estimados, conforme publicações oficiais do FNDE/MEC.</AlertTitle>
        <AlertDescription>{dataset.settings.observation_text}</AlertDescription>
      </Alert>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">Ano</span>
        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <TransparenciaKpiCard label="Receita total prevista/estimada" value={formatCurrencyBRL(selectedAnnual.total_fundeb_previsto)} borderTopClass="border-t-blue-700" />
        <TransparenciaKpiCard label="Complementação da União total" value={formatCurrencyBRL(selectedAnnual.complementacao_uniao_total)} borderTopClass="border-t-emerald-600" />
        <TransparenciaKpiCard label="Complementação VAAT" value={formatCurrencyBRL(selectedAnnual.complementacao_vaat)} borderTopClass="border-t-amber-500" />
        <TransparenciaKpiCard label="Receita contribuição Estados/Municípios" value={formatCurrencyBRL(selectedAnnual.receita_contribuicao_estados_municipios)} borderTopClass="border-t-sky-700" />
        <TransparenciaKpiCard label="IEI" value={selectedVaatIndicator ? formatPercentBR(selectedVaatIndicator.iei_percentual) : '—'} borderTopClass="border-t-violet-600" />
        <TransparenciaKpiCard
          label="Crescimento histórico (2023-2025)"
          value={fixedGrowth ? `${formatCurrencyBRL(fixedGrowth.crescimento_valor)} (${formatPercentBR(fixedGrowth.crescimento_percentual)})` : '—'}
          borderTopClass="border-t-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="py-0">
          <CardHeader><CardTitle>Evolução da Receita Total Prevista do Fundeb</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataset.annual}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(v) => formatMillionBRL(Number(v))} />
                <Tooltip formatter={(value) => formatCurrencyBRL(Number(value ?? 0))} />
                <Bar dataKey="total_fundeb_previsto" fill={COLORS.total} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader><CardTitle>Composição do Fundeb por Origem dos Recursos</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={compositionChartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                  {compositionChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrencyBRL(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-600 sm:grid-cols-2">
              {compositionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 rounded border border-slate-200 px-2 py-1">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <span>{formatCurrencyBRL(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="py-0">
        <CardHeader><CardTitle>Cronograma de Distribuição da Complementação VAAT - 2023 a 2025</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scheduleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month_label" />
                <YAxis tickFormatter={(v) => formatMillionBRL(Number(v))} />
                <Tooltip formatter={(value) => formatCurrencyBRL(Number(value ?? 0))} />
                <Legend />
                {years.map((year, idx) => (
                  <Line key={year} type="monotone" dataKey={String(year)} stroke={['#0B4F8A', '#16A34A', '#F59E0B'][idx % 3]} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-600">
            “Jan seg.” representa a parcela de janeiro do exercício seguinte, conforme cronograma do FNDE.
          </p>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader><CardTitle>VAAT antes e após a Complementação da União</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataset.vaatIndicators}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => formatMillionBRL(Number(v))} />
              <Tooltip formatter={(value) => formatCurrencyBRL(Number(value ?? 0))} />
              <Legend />
              <Bar dataKey="vaat_antes_complementacao" fill="#64748B" name="VAAT antes da complementação" />
              <Bar dataKey="vaat_com_complementacao" fill={COLORS.vaat} name="VAAT com complementação" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader><CardTitle>Crescimento do Fundeb</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {dataset.growth.map((item) => (
            <div key={`${item.fromYear}-${item.toYear}`} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800">{item.fromYear} → {item.toYear}</p>
              <p className="text-sm text-slate-700">{formatCurrencyBRL(item.crescimento_valor)}</p>
              <p className="text-xs text-slate-500">{formatPercentBR(item.crescimento_percentual)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader><CardTitle>Tabela anual do FUNDEB</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead>Receita contribuição Estados/Municípios</TableHead>
                <TableHead>VAAF</TableHead>
                <TableHead>VAAT</TableHead>
                <TableHead>VAAR</TableHead>
                <TableHead>Complementação União total</TableHead>
                <TableHead>Receita total prevista/estimada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataset.annual.map((row) => (
                <TableRow key={row.year}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{formatCurrencyBRL(row.receita_contribuicao_estados_municipios)}</TableCell>
                  <TableCell>{formatCurrencyBRL(row.complementacao_vaaf)}</TableCell>
                  <TableCell>{formatCurrencyBRL(row.complementacao_vaat)}</TableCell>
                  <TableCell>{formatCurrencyBRL(row.complementacao_vaar)}</TableCell>
                  <TableCell>{formatCurrencyBRL(row.complementacao_uniao_total)}</TableCell>
                  <TableCell>{formatCurrencyBRL(row.total_fundeb_previsto)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <p className="border-t border-slate-200 pt-3 text-xs text-slate-600">{dataset.settings.footer_text}</p>
    </div>
  )
}
