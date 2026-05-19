import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  getAllAlimentacaoAdmin, getAlimentacaoEscolas, upsertAlimentacao, upsertAlimentacaoEscolas, deleteAlimentacao,
  type AlimentacaoRow, type AlimentacaoEscolaRow,
} from '@/services/transparencia/alimentacaoService'

const EMPTY_ESCOLAS = [
  { escola: 'E.M. Centro (Sede)', refeicoes_mes: 0, ordem: 1 },
  { escola: 'E.M. Lagoa Grande', refeicoes_mes: 0, ordem: 2 },
  { escola: 'E.M. Serra do Canto', refeicoes_mes: 0, ordem: 3 },
  { escola: 'E.M. Zona Rural I', refeicoes_mes: 0, ordem: 4 },
  { escola: 'E.M. Zona Rural II', refeicoes_mes: 0, ordem: 5 },
  { escola: 'E.M. Correntina', refeicoes_mes: 0, ordem: 6 },
  { escola: 'E.M. Quilombola', refeicoes_mes: 0, ordem: 7 },
]

export default function TransparenciaAlimentacaoPage() {
  const [rows, setRows] = useState<AlimentacaoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<AlimentacaoRow> | null>(null)
  const [escolas, setEscolas] = useState<Partial<AlimentacaoEscolaRow>[]>(EMPTY_ESCOLAS)
  const [saving, setSaving] = useState(false)

  async function load() { setLoading(true); setRows(await getAllAlimentacaoAdmin()); setLoading(false) }
  useEffect(() => { void load() }, [])

  async function openEdit(row?: AlimentacaoRow) {
    if (row) {
      const esc = await getAlimentacaoEscolas(row.id)
      setEscolas(esc.length ? esc : EMPTY_ESCOLAS)
      setEditing({ ...row })
    } else {
      setEscolas(EMPTY_ESCOLAS)
      setEditing({ ano: new Date().getFullYear(), refeicoes_dia: 0, percentual_af: 0, investimento_mes: 0, total_alunos: 0, fonte: 'FNDE/PNAE', publicado: true })
    }
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      const id = await upsertAlimentacao(editing)
      await upsertAlimentacaoEscolas(id, escolas.map((e, i) => ({ ...e, alimentacao_id: id, escola: e.escola ?? '', refeicoes_mes: e.refeicoes_mes ?? 0, ordem: i + 1 } as any)))
      toast.success('Salvo com sucesso!'); setEditing(null); await load()
    } catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  function fmt(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v) }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-slate-900">Alimentação Escolar</h1><p className="text-slate-500 text-sm mt-1">Gerencie refeições, investimentos e dados por escola.</p></div>
        <Button onClick={() => openEdit()}><span className="material-symbols-outlined text-lg mr-1">add</span>Novo registro</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Registros por ano</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-slate-400 text-sm">Carregando...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Ano</TableHead><TableHead>Refeições/dia</TableHead><TableHead>% AF</TableHead><TableHead>Investimento/mês</TableHead><TableHead>Alunos</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">{row.ano}</TableCell>
                    <TableCell>{row.refeicoes_dia.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{Number(row.percentual_af).toFixed(1)}%</TableCell>
                    <TableCell>{fmt(row.investimento_mes)}</TableCell>
                    <TableCell>{row.total_alunos.toLocaleString('pt-BR')}</TableCell>
                    <TableCell><Badge className={row.publicado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>{row.publicado ? 'Publicado' : 'Rascunho'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={async () => { if(confirm('Excluir?')) { await deleteAlimentacao(row.id); await load() } }}>Excluir</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? 'Editar' : 'Novo'} — Alimentação Escolar</DialogTitle></DialogHeader>
          {editing && (
            <div className="flex flex-col gap-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Ano', key: 'ano', type: 'number' },
                  { label: 'Refeições/dia', key: 'refeicoes_dia', type: 'number' },
                  { label: '% Agricultura Familiar', key: 'percentual_af', type: 'number' },
                  { label: 'Investimento mensal (R$)', key: 'investimento_mes', type: 'number' },
                  { label: 'Total alunos', key: 'total_alunos', type: 'number' },
                  { label: 'Fonte', key: 'fonte', type: 'text' },
                ].map(f => (
                  <label key={f.key} className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{f.label}</span>
                    <Input type={f.type} value={(editing as any)[f.key] ?? ''} onChange={e => setEditing(p => ({ ...p!, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} />
                  </label>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Refeições por escola (mês)</p>
                <div className="flex flex-col gap-2">
                  {escolas.map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input className="flex-1" value={e.escola ?? ''} onChange={ev => setEscolas(prev => prev.map((x, xi) => xi === i ? { ...x, escola: ev.target.value } : x))} placeholder="Nome da escola" />
                      <Input className="w-32" type="number" value={e.refeicoes_mes ?? 0} onChange={ev => setEscolas(prev => prev.map((x, xi) => xi === i ? { ...x, refeicoes_mes: Number(ev.target.value) } : x))} placeholder="Refeições" />
                      <Button size="sm" variant="outline" onClick={() => setEscolas(prev => prev.filter((_, xi) => xi !== i))}>✕</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="self-start" onClick={() => setEscolas(p => [...p, { escola: '', refeicoes_mes: 0, ordem: p.length + 1 }])}>+ Adicionar escola</Button>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.publicado ?? true} onChange={e => setEditing(p => ({ ...p!, publicado: e.target.checked }))} className="w-4 h-4" />
                <span className="text-sm font-medium text-slate-700">Publicar no site público</span>
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
