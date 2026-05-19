import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  getAgriculturaAdmin, upsertAgricultura, deleteAgricultura, toggleAgriculturaPublicado,
  type AgriculturaRow,
} from '@/services/transparencia/agriculturaService'

const EMPTY: Partial<AgriculturaRow> = {
  ano: new Date().getFullYear(), mes: 'Anual', percentual_af: 0, meta_pnae: 30,
  num_fornecedores: 0, valor_total: 0, valor_af: 0, fonte: 'FNDE/PNAE', publicado: true,
}

export default function TransparenciaAgriculturaPage() {
  const [rows, setRows] = useState<AgriculturaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<AgriculturaRow> | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await getAgriculturaAdmin()
    setRows(data)
    setLoading(false)
  }
  useEffect(() => { void load() }, [])

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      await upsertAgricultura(editing)
      toast.success('Registro salvo com sucesso!')
      setEditing(null)
      await load()
    } catch { toast.error('Erro ao salvar registro.') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este registro?')) return
    try { await deleteAgricultura(id); toast.success('Excluído.'); await load() }
    catch { toast.error('Erro ao excluir.') }
  }

  async function handleToggle(row: AgriculturaRow) {
    try { await toggleAgriculturaPublicado(row.id, !row.publicado); await load() }
    catch { toast.error('Erro ao alterar status.') }
  }

  function fmt(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Agricultura Familiar</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os dados do PNAE e fornecedores locais.</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <span className="material-symbols-outlined text-lg mr-1">add</span> Novo registro
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Registros por ano</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-slate-400 text-sm">Carregando...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead><TableHead>% AF</TableHead><TableHead>Meta PNAE</TableHead>
                  <TableHead>Fornecedores</TableHead><TableHead>Valor Total</TableHead><TableHead>Valor AF</TableHead>
                  <TableHead>Status</TableHead><TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">{row.ano}</TableCell>
                    <TableCell>{Number(row.percentual_af).toFixed(1)}%</TableCell>
                    <TableCell>{Number(row.meta_pnae).toFixed(0)}%</TableCell>
                    <TableCell>{row.num_fornecedores}</TableCell>
                    <TableCell>{fmt(row.valor_total)}</TableCell>
                    <TableCell>{fmt(row.valor_af)}</TableCell>
                    <TableCell>
                      <Badge className={row.publicado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                        {row.publicado ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing({ ...row })}>Editar</Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggle(row)}>{row.publicado ? 'Ocultar' : 'Publicar'}</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>Excluir</Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? 'Editar' : 'Novo'} Registro — Agricultura Familiar</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 py-2">
              {[
                { label: 'Ano', key: 'ano', type: 'number' },
                { label: 'Período', key: 'mes', type: 'text' },
                { label: '% Agricultura Familiar', key: 'percentual_af', type: 'number' },
                { label: 'Meta PNAE (%)', key: 'meta_pnae', type: 'number' },
                { label: 'Nº Fornecedores', key: 'num_fornecedores', type: 'number' },
                { label: 'Valor Total (R$)', key: 'valor_total', type: 'number' },
                { label: 'Valor Agricultura Familiar (R$)', key: 'valor_af', type: 'number' },
                { label: 'Fonte', key: 'fonte', type: 'text' },
              ].map(f => (
                <label key={f.key} className={`flex flex-col gap-1 ${f.key === 'fonte' ? 'col-span-2' : ''}`}>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{f.label}</span>
                  <Input type={f.type} value={(editing as any)[f.key] ?? ''} onChange={e => setEditing(prev => ({ ...prev!, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} />
                </label>
              ))}
              <label className="flex items-center gap-2 col-span-2 cursor-pointer">
                <input type="checkbox" checked={editing.publicado ?? true} onChange={e => setEditing(prev => ({ ...prev!, publicado: e.target.checked }))} className="w-4 h-4" />
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
