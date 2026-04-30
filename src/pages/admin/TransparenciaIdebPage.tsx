import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  deleteIdebRow,
  getIdebAdminData,
  type IdebEscolaRow,
  type IdebIndicadorRow,
  type IdebMunicipalRow,
  setIdebPublished,
  upsertIdebEscola,
  upsertIdebIndicador,
  upsertIdebMunicipal,
} from '@/services/transparencia/idebService'

function clampNumber(value: string, min: number, max: number) {
  const n = Number.parseFloat(value.replace(',', '.'))
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, n))
}

export default function TransparenciaIdebPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('municipal')
  const [municipalRows, setMunicipalRows] = useState<IdebMunicipalRow[]>([])
  const [escolaRows, setEscolaRows] = useState<IdebEscolaRow[]>([])
  const [indicadorRows, setIndicadorRows] = useState<IdebIndicadorRow[]>([])
  const [source, setSource] = useState<'database' | 'fallback'>('fallback')
  const [deleteTarget, setDeleteTarget] = useState<{ entity: 'municipal' | 'escolas' | 'indicadores'; id: string } | null>(null)

  async function load() {
    setLoading(true)
    const data = await getIdebAdminData()
    setMunicipalRows(data.municipal)
    setEscolaRows(data.escolas)
    setIndicadorRows(data.indicadores)
    setSource(data.source)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const anos = useMemo(
    () => Array.from(new Set([...municipalRows, ...escolaRows, ...indicadorRows].map((x) => x.ano ?? 0))).sort((a, b) => b - a),
    [municipalRows, escolaRows, indicadorRows],
  )

  async function persistMunicipal(row: IdebMunicipalRow) {
    if (!row.ano || !row.etapa || !row.fonte) return toast.error('Ano, etapa e fonte são obrigatórios.')
    if (row.ideb !== null) row.ideb = clampNumber(String(row.ideb), 0, 10)
    if (row.matematica !== null && row.matematica !== undefined) row.matematica = clampNumber(String(row.matematica), 0, 10)
    if (row.portugues !== null && row.portugues !== undefined) row.portugues = clampNumber(String(row.portugues), 0, 10)
    if (row.fluxo !== null && row.fluxo !== undefined) row.fluxo = clampNumber(String(row.fluxo), 0, 1)
    if (row.taxa_aprovacao !== null && row.taxa_aprovacao !== undefined) row.taxa_aprovacao = clampNumber(String(row.taxa_aprovacao), 0, 100)
    await upsertIdebMunicipal(row)
  }

  async function persistEscola(row: IdebEscolaRow) {
    if (!row.ano || !row.etapa || !row.escola || !row.fonte) return toast.error('Ano, escola, etapa e fonte são obrigatórios.')
    if (row.ideb !== null) row.ideb = clampNumber(String(row.ideb), 0, 10)
    if (row.aprendizado !== null) row.aprendizado = clampNumber(String(row.aprendizado), 0, 10)
    if (row.fluxo !== null) row.fluxo = clampNumber(String(row.fluxo), 0, 1)
    await upsertIdebEscola(row)
  }

  async function persistIndicador(row: IdebIndicadorRow) {
    if (!row.ano || !row.grupo || !row.indicador || !row.fonte) return toast.error('Ano, grupo, indicador e fonte são obrigatórios.')
    if (row.valor !== null && row.unidade === 'percentual') row.valor = clampNumber(String(row.valor), 0, 100)
    await upsertIdebIndicador(row)
  }

  async function onSave(entity: 'municipal' | 'escolas' | 'indicadores', payload: IdebMunicipalRow | IdebEscolaRow | IdebIndicadorRow) {
    try {
      if (entity === 'municipal') await persistMunicipal(payload as IdebMunicipalRow)
      if (entity === 'escolas') await persistEscola(payload as IdebEscolaRow)
      if (entity === 'indicadores') await persistIndicador(payload as IdebIndicadorRow)
      toast.success('Registro salvo com sucesso.')
      await load()
    } catch {
      toast.error('Erro ao salvar registro.')
    }
  }

  async function onTogglePublished(entity: 'municipal' | 'escolas' | 'indicadores', id: string, publicado: boolean) {
    try {
      await setIdebPublished(entity, id, !publicado)
      toast.success(!publicado ? 'Registro publicado.' : 'Registro despublicado.')
      await load()
    } catch {
      toast.error('Erro ao atualizar publicação.')
    }
  }

  async function onDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deleteIdebRow(deleteTarget.entity, deleteTarget.id)
      toast.success('Registro excluído.')
      setDeleteTarget(null)
      await load()
    } catch {
      toast.error('Erro ao excluir registro.')
    }
  }

  const newMunicipal: IdebMunicipalRow = {
    ano: anos[0] ?? 2023, etapa: 'Anos Iniciais', ideb: null, municipio: 'Brotas de Macaúbas', uf: 'BA', fonte: '', publicado: false,
  }
  const newEscola: IdebEscolaRow = {
    ano: anos[0] ?? 2023, escola: '', etapa: 'Anos Iniciais', ideb: null, aprendizado: null, fluxo: null, fonte: '', publicado: false,
  }
  const newIndicador: IdebIndicadorRow = {
    ano: anos[0] ?? 2023, grupo: '', indicador: '', valor: null, unidade: 'indice', fonte: '', publicado: false,
  }

  async function addNew(entity: 'municipal' | 'escolas' | 'indicadores') {
    if (entity === 'municipal') await onSave(entity, newMunicipal)
    if (entity === 'escolas') await onSave(entity, newEscola)
    if (entity === 'indicadores') await onSave(entity, newIndicador)
  }

  const previewMunicipal = municipalRows.filter((x) => x.publicado).slice(0, 3)
  const previewEscolas = escolaRows.filter((x) => x.publicado).slice(0, 3)

  function parseNum(value: string) {
    if (!value.trim()) return null
    const n = Number.parseFloat(value.replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }

  function updateMunicipalField(index: number, field: keyof IdebMunicipalRow, value: string) {
    setMunicipalRows((prev) => prev.map((row, i) => (i !== index ? row : { ...row, [field]: field === 'ano' ? Number(value) : parseNum(value) ?? value })))
  }
  function updateEscolaField(index: number, field: keyof IdebEscolaRow, value: string) {
    setEscolaRows((prev) => prev.map((row, i) => (i !== index ? row : { ...row, [field]: field === 'ano' ? Number(value) : parseNum(value) ?? value })))
  }
  function updateIndicadorField(index: number, field: keyof IdebIndicadorRow, value: string) {
    setIndicadorRows((prev) => prev.map((row, i) => (i !== index ? row : { ...row, [field]: field === 'ano' ? Number(value) : parseNum(value) ?? value })))
  }

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4">Carregando IDEB...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin {'>'} Transparência {'>'} IDEB</h1>
          <p className="text-sm text-slate-600">Cadastro e publicação de dados do IDEB municipal e por escola.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{source === 'database' ? 'Dados do banco' : 'Dados de exemplo'}</Badge>
          <Button variant="outline" onClick={() => void load()}>Recarregar dados</Button>
        </div>
      </div>

      <Alert>
        <AlertTitle>Validação automática</AlertTitle>
        <AlertDescription>
          IDEB, aprendizado, matemática e português: 0-10. Fluxo: 0-1. Percentuais: 0-100. Ano, etapa e fonte são obrigatórios.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="municipal">IDEB municipal</TabsTrigger>
          <TabsTrigger value="escolas">IDEB por escola</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores complementares</TabsTrigger>
          <TabsTrigger value="preview">Prévia</TabsTrigger>
        </TabsList>

        <TabsContent value="municipal">
          <Card>
            <CardHeader><CardTitle>Dados municipais</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>IDEB</TableHead>
                      <TableHead>Meta</TableHead>
                      <TableHead>Proficiência</TableHead>
                      <TableHead>Aprovação %</TableHead>
                      <TableHead>Fluxo</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Publicado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {municipalRows.map((row, index) => (
                      <TableRow key={row.id ?? `${row.ano}-${row.etapa}-${index}`}>
                        <TableCell><Input value={String(row.ano)} onChange={(e) => updateMunicipalField(index, 'ano', e.target.value)} /></TableCell>
                        <TableCell>
                          <Select value={row.etapa} onValueChange={(v) => v && setMunicipalRows((prev) => prev.map((r, i) => i === index ? { ...r, etapa: v as IdebMunicipalRow['etapa'] } : r))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Anos Iniciais">Anos Iniciais</SelectItem>
                              <SelectItem value="Anos Finais">Anos Finais</SelectItem>
                              <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input value={String(row.ideb ?? '')} onChange={(e) => updateMunicipalField(index, 'ideb', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.meta_projetada ?? '')} onChange={(e) => updateMunicipalField(index, 'meta_projetada', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.proficiencia_media ?? '')} onChange={(e) => updateMunicipalField(index, 'proficiencia_media', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.taxa_aprovacao ?? '')} onChange={(e) => updateMunicipalField(index, 'taxa_aprovacao', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.fluxo ?? '')} onChange={(e) => updateMunicipalField(index, 'fluxo', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.fonte ?? ''} onChange={(e) => updateMunicipalField(index, 'fonte', e.target.value)} /></TableCell>
                        <TableCell><Badge variant={row.publicado ? 'default' : 'outline'}>{row.publicado ? 'Sim' : 'Não'}</Badge></TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" onClick={() => void onSave('municipal', row)}>Salvar</Button>
                          {row.id ? <Button size="sm" variant="outline" onClick={() => void onTogglePublished('municipal', row.id!, row.publicado)}>{row.publicado ? 'Despublicar' : 'Publicar'}</Button> : null}
                          {row.id ? <Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ entity: 'municipal', id: row.id! })}>Excluir</Button> : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3"><Button variant="outline" onClick={() => void addNew('municipal')}>Criar novo registro municipal</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escolas">
          <Card>
            <CardHeader><CardTitle>Dados por escola</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead>Escola</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Aprendizado</TableHead>
                      <TableHead>Fluxo</TableHead>
                      <TableHead>IDEB</TableHead>
                      <TableHead>Posição</TableHead>
                      <TableHead>Leitura técnica</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Publicado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escolaRows.map((row, index) => (
                      <TableRow key={row.id ?? `${row.ano}-${row.escola}-${index}`}>
                        <TableCell><Input value={String(row.ano)} onChange={(e) => updateEscolaField(index, 'ano', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.escola} onChange={(e) => updateEscolaField(index, 'escola', e.target.value)} /></TableCell>
                        <TableCell>
                          <Select value={row.etapa} onValueChange={(v) => v && setEscolaRows((prev) => prev.map((r, i) => i === index ? { ...r, etapa: v as IdebEscolaRow['etapa'] } : r))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Anos Iniciais">Anos Iniciais</SelectItem>
                              <SelectItem value="Anos Finais">Anos Finais</SelectItem>
                              <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input value={String(row.aprendizado ?? '')} onChange={(e) => updateEscolaField(index, 'aprendizado', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.fluxo ?? '')} onChange={(e) => updateEscolaField(index, 'fluxo', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.ideb ?? '')} onChange={(e) => updateEscolaField(index, 'ideb', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.posicao ? String(row.posicao) : ''} onChange={(e) => updateEscolaField(index, 'posicao', e.target.value)} /></TableCell>
                        <TableCell><Textarea value={row.leitura_tecnica ?? ''} onChange={(e) => updateEscolaField(index, 'leitura_tecnica', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.fonte ?? ''} onChange={(e) => updateEscolaField(index, 'fonte', e.target.value)} /></TableCell>
                        <TableCell><Badge variant={row.publicado ? 'default' : 'outline'}>{row.publicado ? 'Sim' : 'Não'}</Badge></TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" onClick={() => void onSave('escolas', row)}>Salvar</Button>
                          {row.id ? <Button size="sm" variant="outline" onClick={() => void onTogglePublished('escolas', row.id!, row.publicado)}>{row.publicado ? 'Despublicar' : 'Publicar'}</Button> : null}
                          {row.id ? <Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ entity: 'escolas', id: row.id! })}>Excluir</Button> : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3"><Button variant="outline" onClick={() => void addNew('escolas')}>Criar novo registro por escola</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicadores">
          <Card>
            <CardHeader><CardTitle>Indicadores complementares</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[1200px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Indicador</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Publicado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicadorRows.map((row, index) => (
                      <TableRow key={row.id ?? `${row.ano}-${row.grupo}-${index}`}>
                        <TableCell><Input value={String(row.ano ?? '')} onChange={(e) => updateIndicadorField(index, 'ano', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.grupo} onChange={(e) => updateIndicadorField(index, 'grupo', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.indicador} onChange={(e) => updateIndicadorField(index, 'indicador', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.etapa ?? ''} onChange={(e) => updateIndicadorField(index, 'etapa', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.valor ?? '')} onChange={(e) => updateIndicadorField(index, 'valor', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.unidade ?? ''} onChange={(e) => updateIndicadorField(index, 'unidade', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.fonte ?? ''} onChange={(e) => updateIndicadorField(index, 'fonte', e.target.value)} /></TableCell>
                        <TableCell><Badge variant={row.publicado ? 'default' : 'outline'}>{row.publicado ? 'Sim' : 'Não'}</Badge></TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" onClick={() => void onSave('indicadores', row)}>Salvar</Button>
                          {row.id ? <Button size="sm" variant="outline" onClick={() => void onTogglePublished('indicadores', row.id!, row.publicado)}>{row.publicado ? 'Despublicar' : 'Publicar'}</Button> : null}
                          {row.id ? <Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ entity: 'indicadores', id: row.id! })}>Excluir</Button> : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3"><Button variant="outline" onClick={() => void addNew('indicadores')}>Criar novo indicador</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader><CardTitle>Pré-visualização de publicação</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {previewMunicipal.map((row) => (
                <div key={`${row.ano}-${row.etapa}`} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <p className="font-semibold">{row.etapa}</p>
                  <p>IDEB: {row.ideb?.toLocaleString('pt-BR') ?? '—'} | Meta: {row.meta_projetada?.toLocaleString('pt-BR') ?? '—'} | Fluxo: {row.fluxo?.toLocaleString('pt-BR') ?? '—'}</p>
                </div>
              ))}
              {previewEscolas.map((row) => (
                <div key={`${row.escola}-${row.ano}`} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <p className="font-semibold">{row.escola}</p>
                  <p>IDEB: {row.ideb?.toLocaleString('pt-BR') ?? '—'} | Aprendizado: {row.aprendizado?.toLocaleString('pt-BR') ?? '—'} | Fluxo: {row.fluxo?.toLocaleString('pt-BR') ?? '—'}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Deseja excluir este registro de IDEB? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => void onDeleteConfirm()}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
