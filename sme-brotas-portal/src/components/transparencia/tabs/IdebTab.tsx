import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaExportCsvButton } from '../TransparenciaExportCsvButton'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'

const idebHistorico = [
  { ano: '2019', anosIniciais: 5.4, anosFinais: 4.8, meta: 5.5 },
  { ano: '2021', anosIniciais: 5.8, anosFinais: 5.1, meta: 5.8 },
  { ano: '2023', anosIniciais: 6.2, anosFinais: 5.6, meta: 6.0 },
]
const idebEscolas = [
  { escola: 'E.M. Centro', nota: 6.4 },
  { escola: 'E.M. Serra Azul', nota: 6.1 },
  { escola: 'E.M. Lagoa', nota: 5.9 },
  { escola: 'E.M. Sao Jose', nota: 5.7 },
]

export function IdebTab() {
  if (!idebHistorico.length || !idebEscolas.length) return <TransparenciaEmptyState />
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">IDEB</h3>
          <p className="text-sm text-slate-600">Evolucao das notas municipais e comparativo por escola.</p>
        </div>
        <TransparenciaExportCsvButton fileName="ideb.csv" rows={idebHistorico} />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <TransparenciaKpiCard label="Nota atual" value="6,2" hint="Anos iniciais (2023)" />
        <TransparenciaKpiCard label="Meta" value="6,0" hint="Meta municipal vigente" />
        <TransparenciaKpiCard label="Variacao" value="+0,4" hint="Comparado a 2021" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200 py-0">
          <CardHeader><CardTitle>Evolucao historica</CardTitle></CardHeader>
          <CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={idebHistorico}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="ano" /><YAxis domain={[4, 7]} /><Tooltip /><Line type="monotone" dataKey="anosIniciais" stroke="#0B4F8A" strokeWidth={2} /><Line type="monotone" dataKey="anosFinais" stroke="#0EA5E9" strokeWidth={2} /><Line type="monotone" dataKey="meta" stroke="#10B981" strokeDasharray="5 5" /></LineChart></ResponsiveContainer></div></CardContent>
        </Card>
        <Card className="border border-slate-200 py-0">
          <CardHeader><CardTitle>Comparativo por escola</CardTitle></CardHeader>
          <CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={idebEscolas}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="escola" tick={{ fontSize: 11 }} /><YAxis domain={[0, 7]} /><Tooltip /><Bar dataKey="nota" fill="#0B4F8A" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent>
        </Card>
      </div>
    </div>
  )
}
