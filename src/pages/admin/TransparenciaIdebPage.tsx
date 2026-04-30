import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  IDEB_FALLBACK,
  deleteIdebYearSafe,
  getIdebAdminData,
  publishIdebData,
  saveIdebDraft,
  type IdebEscolaRow,
  type IdebMunicipalRow,
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
  const [source, setSource] = useState<'database' | 'fallback'>('fallback')
  const [deleteYear, setDeleteYear] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    const data = await getIdebAdminData()
    setMunicipalRows(data.municipal)
    setEscolaRows(data.escolas)
    setSource(data.source)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const years = useMemo(
    () =>
      [...new Set([...municipalRows.map((r) => r.ano), ...escolaRows.map((r) => r.ano)])]
        .sort((a, b) => a - b),
    [municipalRows, escolaRows],
  )
  const currentYear = years.at(-1) ?? 2023

  function addYear() {
    const nextYear = (years.at(-1) ?? 2023) + 2
    const municipio = 'Brotas de Macaúbas'
    const uf = 'BA'
    setMunicipalRows((prev) => [
      ...prev,
      {
        ano: nextYear,
        municipio,
        uf,
        etapa: 'Anos Iniciais',
        ideb: 0,
        matematica: 0,
        portugues: 0,
        fluxo: 0,
        fonte: 'QEdu/INEP',
        publicado: false,
      },
      {
        ano: nextYear,
        municipio,
        uf,
        etapa: 'Anos Finais',
        ideb: 0,
        matematica: 0,
        portugues: 0,
        fluxo: 0,
        fonte: 'QEdu/INEP',
        publicado: false,
      },
      {
        ano: nextYear,
        municipio,
        uf,
        etapa: 'Ensino Médio',
        ideb: 0,
        matematica: 0,
        portugues: 0,
        fluxo: 0,
        fonte: 'QEdu/INEP',
        publicado: false,
      },
    ])
    toast.success(`Ano ${nextYear} criado para edição.`)
  }

  function updateMunicipal(index: number, field: keyof IdebMunicipalRow, value: string) {
    setMunicipalRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row
        if (field === 'ideb' || field === 'matematica' || field === 'portugues') {
          return { ...row, [field]: clampNumber(value, 0, 10) }
        }
        if (field === 'fluxo') return { ...row, [field]: clampNumber(value, 0, 1) }
        return { ...row, [field]: value }
      }),
    )
  }

  function updateEscola(index: number, field: keyof IdebEscolaRow, value: string) {
    setEscolaRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row
        if (field === 'ideb' || field === 'aprendizado') return { ...row, [field]: clampNumber(value, 0, 10) }
        if (field === 'fluxo') return { ...row, [field]: clampNumber(value, 0, 1) }
        if (field === 'posicao') return { ...row, posicao: value ? Number.parseInt(value, 10) : null }
        return { ...row, [field]: value }
      }),
    )
  }

  async function saveDraft() {
    try {
      await saveIdebDraft({ municipal: municipalRows, escolas: escolaRows })
      toast.success('Dados IDEB salvos como rascunho.')
      await load()
    } catch {
      toast.error('Não foi possível salvar os dados IDEB.')
    }
  }

  async function publish() {
    try {
      await publishIdebData()
      toast.success('Dados IDEB publicados no site.')
      await load()
    } catch {
      toast.error('Não foi possível publicar os dados IDEB.')
    }
  }

  async function deleteYearData() {
    if (!deleteYear) return
    try {
      await deleteIdebYearSafe(deleteYear)
      toast.success(`Dados de ${deleteYear} removidos (somente rascunho).`)
      setDeleteYear(null)
      await load()
    } catch {
      toast.error('Não foi possível excluir este ano. Verifique se há dados publicados.')
    }
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
          <Button variant="outline" onClick={() => { setMunicipalRows(IDEB_FALLBACK.municipal); setEscolaRows(IDEB_FALLBACK.escolas) }}>
            Restaurar exemplo
          </Button>
          <Button variant="outline" onClick={() => void load()}>Recarregar dados</Button>
        </div>
      </div>

      <Alert>
        <AlertTitle>Validação automática</AlertTitle>
        <AlertDescription>
          IDEB, aprendizado, matemática e português devem estar entre 0 e 10. Fluxo deve estar entre 0 e 1.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="municipal">IDEB municipal</TabsTrigger>
          <TabsTrigger value="escolas">IDEB por escola</TabsTrigger>
          <TabsTrigger value="preview">Prévia</TabsTrigger>
        </TabsList>

        <TabsContent value="municipal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dados municipais</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={addYear}>Cadastrar novo ano</Button>
                <Select value={String(currentYear)} onValueChange={(value) => setDeleteYear(Number(value))}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Excluir ano..." /></SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => deleteYear && setDeleteYear(deleteYear)} disabled={!deleteYear}>
                  Excluir ano (rascunho)
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead>Município</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>IDEB</TableHead>
                      <TableHead>Matemática</TableHead>
                      <TableHead>Português</TableHead>
                      <TableHead>Fluxo</TableHead>
                      <TableHead>Fonte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {municipalRows.map((row, index) => (
                      <TableRow key={`${row.ano}-${row.etapa}-${index}`}>
                        <TableCell><Input value={String(row.ano)} onChange={(e) => updateMunicipal(index, 'ano', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.municipio} onChange={(e) => updateMunicipal(index, 'municipio', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.uf} onChange={(e) => updateMunicipal(index, 'uf', e.target.value)} /></TableCell>
                        <TableCell>
                          <Select value={row.etapa} onValueChange={(v) => v && updateMunicipal(index, 'etapa', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Anos Iniciais">Anos Iniciais</SelectItem>
                              <SelectItem value="Anos Finais">Anos Finais</SelectItem>
                              <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input value={String(row.ideb)} onChange={(e) => updateMunicipal(index, 'ideb', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.matematica)} onChange={(e) => updateMunicipal(index, 'matematica', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.portugues)} onChange={(e) => updateMunicipal(index, 'portugues', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.fluxo)} onChange={(e) => updateMunicipal(index, 'fluxo', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.fonte} onChange={(e) => updateMunicipal(index, 'fonte', e.target.value)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
                      <TableHead>Fonte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escolaRows.map((row, index) => (
                      <TableRow key={`${row.ano}-${row.escola}-${index}`}>
                        <TableCell><Input value={String(row.ano)} onChange={(e) => updateEscola(index, 'ano', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.escola} onChange={(e) => updateEscola(index, 'escola', e.target.value)} /></TableCell>
                        <TableCell>
                          <Select value={row.etapa} onValueChange={(v) => v && updateEscola(index, 'etapa', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Anos Iniciais">Anos Iniciais</SelectItem>
                              <SelectItem value="Anos Finais">Anos Finais</SelectItem>
                              <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input value={String(row.aprendizado)} onChange={(e) => updateEscola(index, 'aprendizado', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.fluxo)} onChange={(e) => updateEscola(index, 'fluxo', e.target.value)} /></TableCell>
                        <TableCell><Input value={String(row.ideb)} onChange={(e) => updateEscola(index, 'ideb', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.posicao ? String(row.posicao) : ''} onChange={(e) => updateEscola(index, 'posicao', e.target.value)} /></TableCell>
                        <TableCell><Input value={row.fonte} onChange={(e) => updateEscola(index, 'fonte', e.target.value)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader><CardTitle>Pré-visualização de publicação</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {municipalRows.filter((r) => r.ano === currentYear).map((row) => (
                <div key={`${row.ano}-${row.etapa}`} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <p className="font-semibold">{row.etapa}</p>
                  <p>IDEB: {row.ideb.toLocaleString('pt-BR')} | Matemática: {row.matematica.toLocaleString('pt-BR')} | Português: {row.portugues.toLocaleString('pt-BR')} | Fluxo: {row.fluxo.toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <Button onClick={saveDraft}>Salvar rascunho</Button>
        <Button variant="outline" onClick={publish}>Publicar no site</Button>
      </div>

      <Dialog open={deleteYear !== null} onOpenChange={(open) => !open && setDeleteYear(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir ano em rascunho</DialogTitle>
            <DialogDescription>
              Esta ação remove dados não publicados do ano {deleteYear ?? '-'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteYear(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={deleteYearData}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
