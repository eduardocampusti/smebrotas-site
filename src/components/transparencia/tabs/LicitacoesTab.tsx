import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaExportCsvButton } from '../TransparenciaExportCsvButton'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'

const licitacoes = [
  {
    numero: '012/2026',
    objeto: 'Genero alimenticio para merenda',
    modalidade: 'Pregao',
    valor: 'R$ 420.000,00',
    status: 'Homologada',
    data: '12/03/2026',
  },
  {
    numero: '018/2026',
    objeto: 'Transporte escolar zona rural',
    modalidade: 'Concorrencia',
    valor: 'R$ 1.240.000,00',
    status: 'Em andamento',
    data: '01/04/2026',
  },
  {
    numero: '021/2026',
    objeto: 'Manutencao predial de unidades',
    modalidade: 'Tomada de precos',
    valor: 'R$ 610.000,00',
    status: 'Aberta',
    data: '22/04/2026',
  },
]

function statusClass(status: string) {
  if (status === 'Aberta') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Em andamento') return 'bg-amber-100 text-amber-700'
  if (status === 'Homologada') return 'bg-blue-100 text-blue-700'
  return 'bg-red-100 text-red-700'
}

export function LicitacoesTab() {
  if (!licitacoes.length) {
    return <TransparenciaEmptyState />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Licitacoes</h3>
          <p className="text-sm text-slate-600">
            Consulta publica dos processos licitatorios educacionais.
          </p>
        </div>
        <TransparenciaExportCsvButton fileName="licitacoes.csv" rows={licitacoes} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <TransparenciaKpiCard label="Total licitacoes" value="3" />
        <TransparenciaKpiCard label="Em aberto" value="2" />
        <TransparenciaKpiCard label="Valor homologado" value="R$ 420 mil" />
      </div>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Painel de processos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº processo</TableHead>
                <TableHead>Objeto</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licitacoes.map((item) => (
                <TableRow key={item.numero}>
                  <TableCell className="font-semibold">{item.numero}</TableCell>
                  <TableCell>{item.objeto}</TableCell>
                  <TableCell>{item.modalidade}</TableCell>
                  <TableCell>{item.valor}</TableCell>
                  <TableCell>
                    <Badge className={statusClass(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>{item.data}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
