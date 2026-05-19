import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  getAllLicitacoesAdmin, upsertLicitacao, deleteLicitacao, toggleLicitacaoPublicado,
  LICITACAO_STATUS, LICITACAO_MODALIDADES, type LicitacaoRow,
} from '@/services/transparencia/licitacoesService'

const EMPTY: Partial<LicitacaoRow> = {
  numero: '', objeto: '', modalidade: 'Pregão Eletrônico', valor_estimado: 0,
  status: 'Aberta', publicado: true, ativo: true,
}

function fmt(v: number | null | undefined) {
  if (v == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function fmtDate(v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('pt-BR')
}

function statusClass(s: string) {
  if (s === 'Aberta') return 'bg-emerald-100 text-emerald-700'
  if (s === 'Em andamento') return 'bg-amber-100 text-amber-700'
  if (s === 'Homologada') return 'bg-blue-100 text-blue-700'
  return 'bg-slate-100 text-slate-500'
}

export default function TransparenciaLicitacoesPage() {
  const [rows, setRows] = useState<LicitacaoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<LicitacaoRow> | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() { setLoading(true); setRows(await getAllLicitacoesAdmin()); setLoading(false) }
  useEffect(() => { void load() }, [])

  async function handleSave() {
    if (!editing?.numero || !editing?.objeto) { toast.error('Número e objeto são obrigatórios.'); return }
    setSaving(true)
    try { await upsertLicitacao(editing); toast.success('Licitação salva!'); setEditing(null); await load() }
    catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-slate-900">Licitações</h1><p className="text-slate-500 text-sm mt-1">Gerencie os processos licitatórios educacionais.</p></div>
        <Button onClick={() => setEditing({ ...EMPTY })}><span className="material-symbols-outlined text-lg mr-1">add</span>Nova licitação</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Processos licitatórios</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-slate-400 text-sm">Carregando...</p> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Objeto</TableHead><TableHead>Modalidade</TableHead><TableHead>Valor Est.</TableHead><TableHead>Status</TableHead><TableHead>Abertura</TableHead><TableHead>Pub.</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold whitespace-nowrap">{row.numero}</TableCell>
                      <TableCell className="max-w-[200px] text-sm">{row.objeto}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{row.modalidade}</TableCell>
                      <TableCell className="whitespace-nowrap">{fmt(row.valor_estimado)}</TableCell>
                      <TableCell><Badge className={statusClass(row.status)}>{row.status}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap">{fmtDate(row.data_abertura)}</TableCell>
                      <TableCell><Badge className={row.publicado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>{row.publicado ? 'Sim' : 'Não'}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => setEditing({ ...row })}>Editar</Button>
                          <Button size="sm" variant="outline" onClick={async () => { await toggleLicitacaoPublicado(row.id, !row.publicado); await load() }}>{row.publicado ? 'Ocultar' : 'Publicar'}</Button>
                          <Button size="sm" variant="destructive" onClick={async () => { if(confirm('Excluir?')) { await deleteLicitacao(row.id); await load() } }}>Excluir</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? 'Editar' : 'Nova'} Licitação</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Nº Processo</span><Input value={editing.numero ?? ''} onChange={e => setEditing(p => ({ ...p!, numero: e.target.value }))} /></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                <Select value={editing.status ?? 'Aberta'} onValueChange={v => setEditing(p => p ? { ...p, status: v } as Partial<LicitacaoRow> : p)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LICITACAO_STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </label>
              <label className="col-span-2 flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Objeto</span><Input value={editing.objeto ?? ''} onChange={e => setEditing(p => ({ ...p!, objeto: e.target.value }))} /></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Modalidade</span>
                <Select value={editing.modalidade ?? LICITACAO_MODALIDADES[0]} onValueChange={v => setEditing(p => p ? { ...p, modalidade: v } as Partial<LicitacaoRow> : p)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LICITACAO_MODALIDADES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Valor Estimado (R$)</span><Input type="number" value={editing.valor_estimado ?? 0} onChange={e => setEditing(p => ({ ...p!, valor_estimado: Number(e.target.value) }))} /></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Valor Homologado (R$)</span><Input type="number" value={editing.valor_homologado ?? ''} onChange={e => setEditing(p => ({ ...p!, valor_homologado: e.target.value ? Number(e.target.value) : null }))} /></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Data Abertura</span><Input type="date" value={editing.data_abertura ?? ''} onChange={e => setEditing(p => ({ ...p!, data_abertura: e.target.value || null }))} /></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Data Homologação</span><Input type="date" value={editing.data_homologacao ?? ''} onChange={e => setEditing(p => ({ ...p!, data_homologacao: e.target.value || null }))} /></label>
              <label className="col-span-2 flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Empresa Vencedora</span><Input value={editing.vencedor ?? ''} onChange={e => setEditing(p => ({ ...p!, vencedor: e.target.value || null }))} /></label>
              <label className="col-span-2 flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Link do Edital</span><Input value={editing.link_edital ?? ''} onChange={e => setEditing(p => ({ ...p!, link_edital: e.target.value || null }))} /></label>
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
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
