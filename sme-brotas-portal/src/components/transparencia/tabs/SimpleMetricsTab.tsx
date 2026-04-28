import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { KpiItem } from '../types'
import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaExportCsvButton } from '../TransparenciaExportCsvButton'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'

type SimpleMetricsTabProps = {
  title: string
  description: string
  kpis: KpiItem[]
  data: Array<{ label: string; value: number }>
  csvFileName: string
  chartTitle: string
}

export function SimpleMetricsTab({ title, description, kpis, data, csvFileName, chartTitle }: SimpleMetricsTabProps) {
  if (!data.length) return <TransparenciaEmptyState />
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <TransparenciaExportCsvButton fileName={csvFileName} rows={data.map((i) => ({ eixo: i.label, valor: i.value }))} />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {kpis.map((kpi) => (
          <TransparenciaKpiCard key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} />
        ))}
      </div>
      <Card className="border border-slate-200 py-0">
        <CardHeader><CardTitle>{chartTitle}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0B4F8A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
