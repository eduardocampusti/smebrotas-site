import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  getAllTransporteAdmin, getTransporteRotas, upsertTransporte, upsertTransporteRotas, deleteTransporte,
  type TransporteRow, type TransporteRotaRow,
} from '@/services/transparencia/transporteService'

const EMPTY_ROTAS = [
  { zona: 'Zona Centro / Sede', total_alunos: 0, ordem: 1, transporte_id: '' },
  { zona: 'Região Norte', total_alunos: 0, ordem: 2, transporte_id: '' },
  { zona: 'Região Sul', total_alunos: 0, ordem: 3, transporte_id: '' },
  { zona: 'Zona Rural / Sertão', total_alunos: 0, ordem: 4, transporte_id: '' },
]

export default function TransparenciaTransportePage() {
  const [rows, setRows] = useState<TransporteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<TransporteRow> | null>(null)
  const [rotas, setRotas] = useState<Partial<TransporteRotaRow>[]>(EMPTY_ROTAS)
  const [saving, setSaving] = useState(false)

  async function load() { setLoading(true); setRows(await getAllTransporteAdmin()); setLoading(false) }
  useEffect(() => { void load() }, [])

  async function openEdit(row?: TransporteRow) {
    if (row) { const rts = await getTransporteRotas(row.id); setRotas(rts.length ? rts : EMPTY_ROTAS); setEditing({ ...row }) }
    else { setRotas(EMPTY_ROTAS); setEditing({ ano: new Date().getFullYear(), total_alunos: 0, rotas_ativas: 0, km_dia: 0, num_veiculos: 0, valor_contrato: 0, fonte: 'SME Brotas de Macaúbas', publicado: true }) }
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      const id = await upsertTransporte(editing)
      await upsertTransporteRotas(id, rotas.map((r, i) => ({ ...r, transporte_id: id, zona: r.zona ?? '', total_alunos: r.total_alunos ?? 0, ordem: i + 1 } as any)))
      toast.success('Salvo!'); setEditing(null); await load()
    } catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  function fmt(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v) }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-slate-900">Transporte Escolar</h1><p className="text-slate-500 text-sm mt-1">Gerencie dados de rotas, alunos atendidos e frota.</p></div>
        <Button onClick={() => openEdit()}><span className="material-symbols-outlined text-lg mr-1">add</span>Novo registro</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Registros por ano</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-slate-400 text-sm">Carregando...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Ano</TableHead><TableHead>Total alunos</TableHead><TableHead>Rotas</TableHead><TableHead>Km/dia</TableHead><TableHead>Veículos</TableHead><TableHead>Contrato</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">{row.ano}</TableCell>
                    <TableCell>{row.total_alunos.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{row.rotas_ativas}</TableCell>
                    <TableCell>{row.km_dia.toLocaleString('pt-BR')} km</TableCell>
                    <TableCell>{row.num_veiculos}</TableCell>
                    <TableCell>{fmt(row.valor_contrato)}</TableCell>
                    <TableCell><Badge className={row.publicado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>{row.publicado ? 'Publicado' : 'Rascunho'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={async () => { if(confirm('Excluir?')) { await deleteTransporte(row.id); await load() } }}>Excluir</Button>
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
          <DialogHeader><DialogTitle>{editing?.id ? 'Editar' : 'Novo'} — Transporte Escolar</DialogTitle></DialogHeader>
          {editing && (
            <div className="flex flex-col gap-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Ano', key: 'ano', type: 'number' },
                  { label: 'Total de alunos', key: 'total_alunos', type: 'number' },
                  { label: 'Rotas ativas', key: 'rotas_ativas', type: 'number' },
                  { label: 'Km por dia', key: 'km_dia', type: 'number' },
                  { label: 'Nº de veículos', key: 'num_veiculos', type: 'number' },
                  { label: 'Valor do contrato (R$)', key: 'valor_contrato', type: 'number' },
                  { label: 'Fonte', key: 'fonte', type: 'text' },
                ].map(f => (
                  <label key={f.key} className={`flex flex-col gap-1 ${f.key === 'fonte' ? 'col-span-2' : ''}`}>
                    <span className="text-xs font-bold text-slate-500 uppercase">{f.label}</span>
                    <Input type={f.type} value={(editing as any)[f.key] ?? ''} onChange={e => setEditing(p => ({ ...p!, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} />
                  </label>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Alunos por zona/rota</p>
                <div className="flex flex-col gap-2">
                  {rotas.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input className="flex-1" value={r.zona ?? ''} onChange={ev => setRotas(prev => prev.map((x, xi) => xi === i ? { ...x, zona: ev.target.value } : x))} placeholder="Nome da zona/rota" />
                      <Input className="w-28" type="number" value={r.total_alunos ?? 0} onChange={ev => setRotas(prev => prev.map((x, xi) => xi === i ? { ...x, total_alunos: Number(ev.target.value) } : x))} placeholder="Alunos" />
                      <Button size="sm" variant="outline" onClick={() => setRotas(prev => prev.filter((_, xi) => xi !== i))}>✕</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="self-start" onClick={() => setRotas(p => [...p, { zona: '', total_alunos: 0, ordem: p.length + 1, transporte_id: '' }])}>+ Adicionar rota</Button>
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
