import { useEffect, useState } from 'react'
import { getCardapioAtivoPublic, type CardapioRow, type CardapioItemRow } from '@/services/transparencia/cardapioService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TransparenciaEmptyState } from '../TransparenciaEmptyState'
import { TransparenciaExportCsvButton } from '../TransparenciaExportCsvButton'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'

export function CardapioTab() {
  const [cardapio, setCardapio] = useState<CardapioRow | null>(null)
  const [itens, setItens] = useState<CardapioItemRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCardapioAtivoPublic()
      .then(res => { if (res) { setCardapio(res.cardapio); setItens(res.itens) } })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <TransparenciaTabSkeleton />
  if (!cardapio || !itens.length) return <TransparenciaEmptyState />

  const csvRows = itens.map(i => ({ Dia: i.dia_semana, 'Café da Manhã': i.cafe_manha, Almoço: i.almoco, Lanche: i.lanche }))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Cardápio Escolar</h3>
          <p className="text-sm text-slate-600">Grade semanal de refeições da rede municipal de ensino.</p>
        </div>
        <TransparenciaExportCsvButton fileName="cardapio.csv" rows={csvRows} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <TransparenciaKpiCard label="Semana ativa" value={cardapio.semana_ref} />
        <TransparenciaKpiCard label="Escolas atendidas" value={String(cardapio.escolas_atendidas)} />
        <TransparenciaKpiCard label="Faixas etárias" value={`${cardapio.faixas_etarias} grupos`} />
      </div>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Tabela semanal (Segunda a Sexta)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Café da Manhã</TableHead>
                <TableHead>Almoço</TableHead>
                <TableHead>Lanche</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold whitespace-nowrap">{item.dia_semana}</TableCell>
                  <TableCell>{item.cafe_manha}</TableCell>
                  <TableCell>{item.almoco}</TableCell>
                  <TableCell>{item.lanche}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
