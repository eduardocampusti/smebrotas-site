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

const cardapioSemanal = [
  { dia: 'Segunda', cafe: 'Pao com queijo', almoco: 'Arroz, feijao e frango', lanche: 'Fruta' },
  { dia: 'Terca', cafe: 'Cuscuz e leite', almoco: 'Macarrao com carne', lanche: 'Bolo de milho' },
  { dia: 'Quarta', cafe: 'Vitamina de banana', almoco: 'Arroz, feijao e ovos', lanche: 'Iogurte' },
  { dia: 'Quinta', cafe: 'Pao integral', almoco: 'Ensopado de legumes', lanche: 'Fruta' },
  { dia: 'Sexta', cafe: 'Tapioca', almoco: 'Arroz, feijao e peixe', lanche: 'Suco natural' },
]

export function CardapioTab() {
  if (!cardapioSemanal.length) {
    return <TransparenciaEmptyState />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Cardapio</h3>
          <p className="text-sm text-slate-600">
            Grade semanal de refeicoes da rede municipal.
          </p>
        </div>
        <TransparenciaExportCsvButton fileName="cardapio.csv" rows={cardapioSemanal} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <TransparenciaKpiCard label="Semana ativa" value="22/2026" />
        <TransparenciaKpiCard label="Escolas atendidas" value="12" />
        <TransparenciaKpiCard label="Faixas etarias" value="3 grupos" />
      </div>

      <Card className="border border-slate-200 py-0">
        <CardHeader>
          <CardTitle>Tabela semanal (Seg a Sex)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Cafe</TableHead>
                <TableHead>Almoco</TableHead>
                <TableHead>Lanche</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cardapioSemanal.map((item) => (
                <TableRow key={item.dia}>
                  <TableCell className="font-semibold">{item.dia}</TableCell>
                  <TableCell>{item.cafe}</TableCell>
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
