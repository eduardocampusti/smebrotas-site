import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaExportCsvButton } from '../TransparenciaExportCsvButton'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'

const porModalidade = [
  { modalidade: 'Infantil', quantidade: 620 },
  { modalidade: 'Fund. I', quantidade: 980 },
  { modalidade: 'Fund. II', quantidade: 760 },
  { modalidade: 'EJA', quantidade: 210 },
  { modalidade: 'Especial', quantidade: 92 },
]

const evolucaoAnual = [
  { ano: '2020', total: 2450 },
  { ano: '2021', total: 2520 },
  { ano: '2022', total: 2590 },
  { ano: '2023', total: 2662 },
]

const zonaDistribuicao = [
  { name: 'Urbana', value: 1710, color: '#0B4F8A' },
  { name: 'Rural', value: 952, color: '#22C55E' },
]

const csvRows = porModalidade.map((item) => ({
  modalidade: item.modalidade,
  quantidade: item.quantidade,
}))

export function MatriculasTab() {
  const hasData = porModalidade.length > 0

  if (!hasData) {
    return <TransparenciaEmptyState />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Matriculas</h3>
          <p className="text-sm text-slate-600">
            Distribuicao por modalidade, evolucao anual e zona de atendimento.
          </p>
        </div>
        <TransparenciaExportCsvButton fileName="matriculas.csv" rows={csvRows} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <TransparenciaKpiCard label="Total matriculado" value="2.662" />
        <TransparenciaKpiCard label="Vagas disponiveis" value="2.900" />
        <TransparenciaKpiCard label="Taxa de ocupacao" value="91,8%" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border border-slate-200 py-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Total por modalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porModalidade}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="modalidade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#16A34A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 py-0">
          <CardHeader>
            <CardTitle>Urbana x Rural</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={zonaDistribuicao}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {zonaDistribuicao.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Evolucao anual de matriculas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoAnual}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="ano" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#0B4F8A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
