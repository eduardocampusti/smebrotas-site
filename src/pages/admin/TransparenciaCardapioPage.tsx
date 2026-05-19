import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  getAllCardapiosAdmin, getCardapioItens, upsertCardapio, upsertCardapioItens, deleteCardapio, setCardapioAtivo,
  type CardapioRow, type CardapioItemRow,
} from '@/services/transparencia/cardapioService'

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira']
const EMPTY_ITENS = DIAS_SEMANA.map((dia, i) => ({ dia_semana: dia, ordem_dia: i + 1, cafe_manha: '', almoco: '', lanche: '', cardapio_id: '' }))

export default function TransparenciaCardapioPage() {
  const [cardapios, setCardapios] = useState<CardapioRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<CardapioRow> | null>(null)
  const [itens, setItens] = useState<Partial<CardapioItemRow>[]>(EMPTY_ITENS)
  const [saving, setSaving] = useState(false)

  async function load() { setLoading(true); setCardapios(await getAllCardapiosAdmin()); setLoading(false) }
  useEffect(() => { void load() }, [])

  async function openEdit(row?: CardapioRow) {
    if (row) { const its = await getCardapioItens(row.id); setItens(its.length ? its : EMPTY_ITENS); setEditing({ ...row }) }
    else { setItens(EMPTY_ITENS); setEditing({ semana_ref: '', escolas_atendidas: 7, faixas_etarias: 3, ativo: false, publicado: true }) }
  }

  async function handleSave() {
    if (!editing || !editing.semana_ref) { toast.error('Informe a semana de referência.'); return }
    setSaving(true)
    try {
      const id = await upsertCardapio(editing)
      await upsertCardapioItens(id, itens.map((it, i) => ({ ...it, cardapio_id: id, dia_semana: it.dia_semana ?? '', ordem_dia: i + 1, cafe_manha: it.cafe_manha ?? '', almoco: it.almoco ?? '', lanche: it.lanche ?? '' } as any)))
      toast.success('Cardápio salvo!'); setEditing(null); await load()
    } catch { toast.error('Erro ao salvar cardápio.') }
    finally { setSaving(false) }
  }

  async function handleSetAtivo(id: string) {
    try { await setCardapioAtivo(id); toast.success('Cardápio definido como ativo!'); await load() }
    catch { toast.error('Erro ao ativar cardápio.') }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-slate-900">Cardápio Escolar</h1><p className="text-slate-500 text-sm mt-1">Gerencie as grades semanais de refeições.</p></div>
        <Button onClick={() => openEdit()}><span className="material-symbols-outlined text-lg mr-1">add</span>Novo cardápio</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Cardápios cadastrados</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-slate-400 text-sm">Carregando...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Semana</TableHead><TableHead>Período</TableHead><TableHead>Escolas</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {cardapios.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold">{c.semana_ref}</TableCell>
                    <TableCell className="text-sm text-slate-500">{c.data_inicio ? new Date(c.data_inicio).toLocaleDateString('pt-BR') : '—'} a {c.data_fim ? new Date(c.data_fim).toLocaleDateString('pt-BR') : '—'}</TableCell>
                    <TableCell>{c.escolas_atendidas}</TableCell>
                    <TableCell className="flex gap-1.5">
                      {c.ativo && <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>}
                      <Badge className={c.publicado ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}>{c.publicado ? 'Publicado' : 'Rascunho'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Editar</Button>
                        {!c.ativo && <Button size="sm" variant="outline" onClick={() => handleSetAtivo(c.id)}>Definir ativo</Button>}
                        <Button size="sm" variant="destructive" onClick={async () => { if(confirm('Excluir?')) { await deleteCardapio(c.id); await load() } }}>Excluir</Button>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? 'Editar' : 'Novo'} Cardápio</DialogTitle></DialogHeader>
          {editing && (
            <div className="flex flex-col gap-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Semana (ex: 22/2026)</span><Input value={editing.semana_ref ?? ''} onChange={e => setEditing(p => ({ ...p!, semana_ref: e.target.value }))} /></label>
                <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Escolas atendidas</span><Input type="number" value={editing.escolas_atendidas ?? 7} onChange={e => setEditing(p => ({ ...p!, escolas_atendidas: Number(e.target.value) }))} /></label>
                <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Data início</span><Input type="date" value={editing.data_inicio ?? ''} onChange={e => setEditing(p => ({ ...p!, data_inicio: e.target.value }))} /></label>
                <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Data fim</span><Input type="date" value={editing.data_fim ?? ''} onChange={e => setEditing(p => ({ ...p!, data_fim: e.target.value }))} /></label>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Refeições por dia da semana</p>
                <div className="flex flex-col gap-3">
                  {itens.map((item, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-slate-600 uppercase mb-2">{item.dia_semana}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[{ label: 'Café da Manhã', key: 'cafe_manha' }, { label: 'Almoço', key: 'almoco' }, { label: 'Lanche', key: 'lanche' }].map(f => (
                          <label key={f.key} className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">{f.label}</span>
                            <Input value={(item as any)[f.key] ?? ''} onChange={ev => setItens(prev => prev.map((x, xi) => xi === i ? { ...x, [f.key]: ev.target.value } : x))} />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
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
