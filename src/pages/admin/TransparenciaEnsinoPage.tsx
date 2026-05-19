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
  getAllEnsinoAdmin, getEnsinoDisciplinas, upsertEnsino, upsertEnsinoDisciplinas, deleteEnsino,
  type EnsinoRow, type EnsinoDisciplinaRow,
} from '@/services/transparencia/ensinoService'

const MODALIDADES = ['Ensino Fundamental I (1º ao 5º ano)', 'Ensino Fundamental II (6º ao 9º ano)', 'Educação Infantil', 'EJA Fundamental']
const EMPTY_DISCIPLINAS = [
  { disciplina: 'Língua Portuguesa', media_nota: 0, ordem: 1, ensino_id: '' },
  { disciplina: 'Matemática', media_nota: 0, ordem: 2, ensino_id: '' },
  { disciplina: 'Ciências', media_nota: 0, ordem: 3, ensino_id: '' },
  { disciplina: 'História', media_nota: 0, ordem: 4, ensino_id: '' },
]

export default function TransparenciaEnsinoPage() {
  const [rows, setRows] = useState<EnsinoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<EnsinoRow> | null>(null)
  const [disciplinas, setDisciplinas] = useState<Partial<EnsinoDisciplinaRow>[]>(EMPTY_DISCIPLINAS)
  const [saving, setSaving] = useState(false)

  async function load() { setLoading(true); setRows(await getAllEnsinoAdmin()); setLoading(false) }
  useEffect(() => { void load() }, [])

  async function openEdit(row?: EnsinoRow) {
    if (row) { const discs = await getEnsinoDisciplinas(row.id); setDisciplinas(discs.length ? discs : EMPTY_DISCIPLINAS); setEditing({ ...row }) }
    else { setDisciplinas(EMPTY_DISCIPLINAS); setEditing({ ano: new Date().getFullYear(), modalidade: MODALIDADES[0], taxa_aprovacao: 0, taxa_reprovacao: 0, taxa_abandono: 0, frequencia_media: 0, total_alunos: 0, fonte: 'INEP/Censo Escolar', publicado: true }) }
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      const id = await upsertEnsino(editing)
      await upsertEnsinoDisciplinas(id, disciplinas.map((d, i) => ({ ...d, ensino_id: id, disciplina: d.disciplina ?? '', media_nota: d.media_nota ?? 0, ordem: i + 1 } as any)))
      toast.success('Salvo!'); setEditing(null); await load()
    } catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-slate-900">Ensino — Fluxo Escolar</h1><p className="text-slate-500 text-sm mt-1">Gerencie taxas de aprovação, reprovação e abandono por modalidade.</p></div>
        <Button onClick={() => openEdit()}><span className="material-symbols-outlined text-lg mr-1">add</span>Novo registro</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Registros de fluxo escolar</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-slate-400 text-sm">Carregando...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Ano</TableHead><TableHead>Modalidade</TableHead><TableHead>Aprovação</TableHead><TableHead>Reprovação</TableHead><TableHead>Abandono</TableHead><TableHead>Alunos</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">{row.ano}</TableCell>
                    <TableCell className="text-sm">{row.modalidade}</TableCell>
                    <TableCell className="text-emerald-700 font-medium">{Number(row.taxa_aprovacao).toFixed(1)}%</TableCell>
                    <TableCell className="text-amber-700 font-medium">{Number(row.taxa_reprovacao).toFixed(1)}%</TableCell>
                    <TableCell className="text-red-700 font-medium">{Number(row.taxa_abandono).toFixed(1)}%</TableCell>
                    <TableCell>{row.total_alunos.toLocaleString('pt-BR')}</TableCell>
                    <TableCell><Badge className={row.publicado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>{row.publicado ? 'Publicado' : 'Rascunho'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={async () => { if(confirm('Excluir?')) { await deleteEnsino(row.id); await load() } }}>Excluir</Button>
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
          <DialogHeader><DialogTitle>{editing?.id ? 'Editar' : 'Novo'} — Fluxo Escolar</DialogTitle></DialogHeader>
          {editing && (
            <div className="flex flex-col gap-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Ano</span><Input type="number" value={editing.ano ?? ''} onChange={e => setEditing(p => ({ ...p!, ano: Number(e.target.value) }))} /></label>
                <label className="flex flex-col gap-1"><span className="text-xs font-bold text-slate-500 uppercase">Modalidade</span>
                  <Select value={editing.modalidade ?? MODALIDADES[0]} onValueChange={v => setEditing(p => p ? { ...p, modalidade: v } as Partial<EnsinoRow> : p)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MODALIDADES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </label>
                {[
                  { label: 'Taxa Aprovação (%)', key: 'taxa_aprovacao' },
                  { label: 'Taxa Reprovação (%)', key: 'taxa_reprovacao' },
                  { label: 'Taxa Abandono (%)', key: 'taxa_abandono' },
                  { label: 'Frequência Média (%)', key: 'frequencia_media' },
                  { label: 'Total Alunos', key: 'total_alunos' },
                  { label: 'Fonte', key: 'fonte' },
                ].map(f => (
                  <label key={f.key} className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">{f.label}</span>
                    <Input type={f.key === 'fonte' ? 'text' : 'number'} value={(editing as any)[f.key] ?? ''} onChange={e => setEditing(p => ({ ...p!, [f.key]: f.key === 'fonte' ? e.target.value : Number(e.target.value) }))} />
                  </label>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Médias por disciplina</p>
                <div className="flex flex-col gap-2">
                  {disciplinas.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input className="flex-1" value={d.disciplina ?? ''} onChange={ev => setDisciplinas(prev => prev.map((x, xi) => xi === i ? { ...x, disciplina: ev.target.value } : x))} placeholder="Disciplina" />
                      <Input className="w-28" type="number" step="0.1" value={d.media_nota ?? 0} onChange={ev => setDisciplinas(prev => prev.map((x, xi) => xi === i ? { ...x, media_nota: Number(ev.target.value) } : x))} placeholder="Média" />
                      <Button size="sm" variant="outline" onClick={() => setDisciplinas(prev => prev.filter((_, xi) => xi !== i))}>✕</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="self-start" onClick={() => setDisciplinas(p => [...p, { disciplina: '', media_nota: 0, ordem: p.length + 1, ensino_id: '' }])}>+ Disciplina</Button>
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
