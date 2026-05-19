import { useEffect, useState } from 'react'
import { getLicitacoesPublic, type LicitacaoRow } from '@/services/transparencia/licitacoesService'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaExportCsvButton } from '../TransparenciaExportCsvButton'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'

function statusClass(status: string) {
  if (status === 'Aberta') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Em andamento') return 'bg-amber-100 text-amber-700'
  if (status === 'Homologada') return 'bg-blue-100 text-blue-700'
  if (status === 'Deserta') return 'bg-slate-100 text-slate-600'
  return 'bg-red-100 text-red-700'
}

function formatCurrency(val: number | null | undefined) {
  if (val == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

function formatDate(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('pt-BR')
}

export function LicitacoesTab() {
  const [licitacoes, setLicitacoes] = useState<LicitacaoRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLicitacoesPublic()
      .then(setLicitacoes)
      .catch(() => setLicitacoes([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TransparenciaTabSkeleton />
  if (!licitacoes.length) return <TransparenciaEmptyState />

  const emAberto = licitacoes.filter(l => ['Aberta', 'Em andamento'].includes(l.status)).length
  const totalHomologado = licitacoes.filter(l => l.status === 'Homologada').reduce((acc, l) => acc + (l.valor_homologado ?? 0), 0)

  const csvRows = licitacoes.map(l => ({
    'Nº Processo': l.numero, Objeto: l.objeto, Modalidade: l.modalidade,
    'Valor Estimado': formatCurrency(l.valor_estimado), Status: l.status, 'Data Abertura': formatDate(l.data_abertura),
  }))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Licitações</h3>
          <p className="text-sm text-slate-600">Consulta pública dos processos licitatórios educacionais.</p>
        </div>
        <TransparenciaExportCsvButton fileName="licitacoes.csv" rows={csvRows} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <TransparenciaKpiCard label="Total processos" value={String(licitacoes.length)} />
        <TransparenciaKpiCard label="Em aberto" value={String(emAberto)} />
        <TransparenciaKpiCard label="Valor homologado" value={formatCurrency(totalHomologado)} />
      </div>

      <Card className="border border-slate-200 py-0">
        <CardHeader><CardTitle>Painel de processos</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Processo</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Valor Estimado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Abertura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licitacoes.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold whitespace-nowrap">
                      {item.link_edital
                        ? <a href={item.link_edital} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.numero}</a>
                        : item.numero}
                    </TableCell>
                    <TableCell className="max-w-[240px]">{item.objeto}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.modalidade}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatCurrency(item.valor_estimado)}</TableCell>
                    <TableCell><Badge className={statusClass(item.status)}>{item.status}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(item.data_abertura)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
