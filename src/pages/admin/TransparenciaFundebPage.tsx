import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  FUNDEB_DEFAULT_DATASET,
  getFundebAdminData,
  parseFundebCsv,
  publishFundebData,
  saveFundebDraft,
  type FundebCsvPreviewRow,
  type FundebDataset,
} from '@/services/transparencia/fundebService'
import { formatCurrencyBRL, parseCurrencyInput, parsePercentInput } from '@/services/transparencia/fundebFormatters'

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan seg.']
const CRONOGRAMA_TOLERANCIA = 0.05

export default function TransparenciaFundebPage() {
  const [data, setData] = useState<FundebDataset | null>(null)
  const [loadedSource, setLoadedSource] = useState<'database' | 'fallback'>('database')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [selectedYear, setSelectedYear] = useState<number>(2025)
  const [isDirty, setIsDirty] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [csvPreview, setCsvPreview] = useState<FundebCsvPreviewRow[]>([])

  async function reloadData() {
    setLoading(true)
    setErrorMessage(null)
    const loaded = await getFundebAdminData()
    setData(loaded.dataset)
    setLoadedSource(loaded.source)
    setErrorMessage(loaded.errorMessage)
    const maxYear = Math.max(...loaded.dataset.annual.map((item) => item.year))
    setSelectedYear(maxYear)
    setLoading(false)
    setIsDirty(false)
    setCsvPreview([])
  }

  useEffect(() => {
    void reloadData()
  }, [])

  const validation = useMemo(() => {
    if (!data) return { warnings: [], blockingErrors: [] }
    const warnings: string[] = []
    const blockingErrors: string[] = []
    for (const annual of data.annual) {
      if (annual.year <= 0) blockingErrors.push('Ano obrigatório.')
      if (annual.total_fundeb_previsto <= 0) blockingErrors.push('total_fundeb_previsto deve ser maior que zero.')
      const sum = annual.complementacao_vaaf + annual.complementacao_vaat + annual.complementacao_vaar
      if (Math.abs(sum - annual.complementacao_uniao_total) > CRONOGRAMA_TOLERANCIA) {
        warnings.push('A soma das complementações não confere com o total da Complementação da União.')
      }
      const scheduleYearRows = data.vaatSchedule.filter((x) => x.year === annual.year)
      if (scheduleYearRows.length !== 13) {
        blockingErrors.push(`Cronograma VAAT do ano ${annual.year} deve conter 13 meses.`)
      }
      const scheduleTotal = scheduleYearRows.reduce((acc, item) => acc + item.value, 0)
      if (Math.abs(scheduleTotal - annual.complementacao_vaat) > CRONOGRAMA_TOLERANCIA) {
        blockingErrors.push('A soma do cronograma VAAT não confere com a complementação VAAT anual.')
      }
    }
    return {
      warnings: [...new Set(warnings)],
      blockingErrors: [...new Set(blockingErrors)],
    }
  }, [data])

  const updateAnnual = (year: number, field: string, value: string) => {
    if (!data) return
    setIsDirty(true)
    setData({
      ...data,
      annual: data.annual.map((row) => (row.year === year ? { ...row, [field]: parseCurrencyInput(value) } : row)),
    })
  }

  const updateIndicator = (year: number, field: string, value: string) => {
    if (!data) return
    setIsDirty(true)
    setData({
      ...data,
      vaatIndicators: data.vaatIndicators.map((row) =>
        row.year === year ? { ...row, [field]: field === 'iei_percentual' ? parsePercentInput(value) : parseCurrencyInput(value) } : row,
      ),
    })
  }

  const updateSchedule = (year: number, month_order: number, value: string) => {
    if (!data) return
    setIsDirty(true)
    setData({
      ...data,
      vaatSchedule: data.vaatSchedule.map((row) =>
        row.year === year && row.month_order === month_order ? { ...row, value: parseCurrencyInput(value) } : row,
      ),
    })
  }

  const addYear = () => {
    if (!data) return
    const nextYear = Math.max(...data.annual.map((x) => x.year)) + 1
    if (data.annual.some((x) => x.year === nextYear)) {
      toast.error('O ano informado já existe. Edite o registro existente ou escolha outro ano.')
      return
    }
    setData({
      ...data,
      annual: [...data.annual, { year: nextYear, receita_contribuicao_estados_municipios: 0, complementacao_vaaf: 0, complementacao_vaat: 0, complementacao_vaar: 0, complementacao_uniao_total: 0, total_fundeb_previsto: 0 }],
      vaatIndicators: [...data.vaatIndicators, { year: nextYear, vaat_antes_complementacao: 0, vaat_com_complementacao: 0, complementacao_vaat: 0, iei_percentual: 0 }],
      vaatSchedule: [
        ...data.vaatSchedule,
        ...monthLabels.map((label, idx) => ({ year: nextYear, month_order: idx + 1, month_label: label, value: 0, is_next_year_month: label === 'Jan seg.' })),
      ],
    })
    setSelectedYear(nextYear)
    setIsDirty(true)
  }

  const onSave = async () => {
    if (!data) return
    try {
      await saveFundebDraft({ annual: data.annual, vaatIndicators: data.vaatIndicators, vaatSchedule: data.vaatSchedule, settings: data.settings })
      toast.success('Dados do FUNDEB salvos com sucesso.')
      setIsDirty(false)
    } catch {
      toast.error('Não foi possível salvar os dados do FUNDEB. Verifique os campos obrigatórios.')
    }
  }

  const onPublish = async () => {
    if (validation.blockingErrors.length > 0) {
      if (validation.blockingErrors.some((w) => w.includes('cronograma'))) {
        toast.error('A soma do cronograma VAAT não confere com a complementação VAAT anual. Revise os valores antes de publicar.')
      } else {
        toast.error(validation.blockingErrors[0])
      }
      return
    }
    try {
      await publishFundebData()
      toast.success('Dados do FUNDEB publicados no site.')
    } catch {
      toast.error('Não foi possível salvar os dados do FUNDEB. Verifique os campos obrigatórios.')
    }
  }

  const filteredAnnual = data?.annual.filter((row) => row.year === selectedYear) ?? []
  const filteredIndicators = data?.vaatIndicators.filter((row) => row.year === selectedYear) ?? []
  const filteredSchedule = data?.vaatSchedule.filter((row) => row.year === selectedYear) ?? []

  function applyCsvRows() {
    if (!data) return
    const existingYears = data.annual.map((item) => item.year)
    const parsed = parseFundebCsv(csvText, existingYears)
    if (parsed.globalErrors.length > 0) {
      toast.error(parsed.globalErrors[0])
      setCsvPreview([])
      return
    }
    setCsvPreview(parsed.preview)
    const hasErrors = parsed.preview.some((row) => row.status === 'erro')
    if (hasErrors) {
      toast.error('CSV com erros. Corrija as linhas inválidas antes de importar.')
      return
    }
    const rowMap = new Map(data.annual.map((row) => [row.year, row]))
    for (const row of parsed.validRows) {
      rowMap.set(row.year, row)
    }
    const mergedAnnual = [...rowMap.values()].sort((a, b) => a.year - b.year)
    setData({ ...data, annual: mergedAnnual })
    setIsDirty(true)
    toast.success('CSV importado com sucesso. Revise os dados antes de publicar.')
  }

  function restoreOfficialDataset() {
    if (!window.confirm('Deseja restaurar os dados oficiais de exemplo? As alterações não salvas serão perdidas.')) {
      return
    }
    setData(FUNDEB_DEFAULT_DATASET)
    setLoadedSource('fallback')
    setSelectedYear(2025)
    setIsDirty(true)
    toast.success('Dados oficiais de exemplo restaurados.')
  }

  if (loading || !data) return <div className="rounded-xl border border-slate-200 bg-white p-4">Carregando FUNDEB...</div>

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Admin &gt; Transparência &gt; FUNDEB</h1>
        <p className="text-sm text-slate-600">Preencha os valores exatamente como constam nas publicações oficiais do FNDE/MEC. Os campos monetários podem ser digitados em reais com vírgula ou ponto. O sistema fará a conversão automática para o formato numérico.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{loadedSource === 'database' ? 'Editando rascunho (banco)' : 'Editando dados de exemplo'}</Badge>
        <Badge variant={isDirty ? 'default' : 'outline'}>{isDirty ? 'Alterações não salvas' : 'Sem alterações pendentes'}</Badge>
        <Button variant="outline" onClick={() => void reloadData()}>Recarregar dados</Button>
        <Button variant="outline" onClick={restoreOfficialDataset}>Restaurar dados oficiais de exemplo</Button>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Falha ao carregar dados do banco</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {validation.warnings.length > 0 ? (
        <Alert variant="destructive">
          <AlertTitle>Alertas de consistência</AlertTitle>
          <AlertDescription>{validation.warnings[0]}</AlertDescription>
        </Alert>
      ) : null}

      {validation.blockingErrors.length > 0 ? (
        <Alert variant="destructive">
          <AlertTitle>Erros bloqueantes para publicação</AlertTitle>
          <AlertDescription>{validation.blockingErrors[0]}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">Ano em edição</span>
        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data.annual.map((row) => (
              <SelectItem key={row.year} value={String(row.year)}>
                {row.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="dados-anuais">Dados anuais</TabsTrigger>
          <TabsTrigger value="indicadores-vaat">Indicadores VAAT</TabsTrigger>
          <TabsTrigger value="cronograma-vaat">Cronograma VAAT</TabsTrigger>
          <TabsTrigger value="fontes">Fontes e observações</TabsTrigger>
          <TabsTrigger value="csv">Importar CSV</TabsTrigger>
          <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-3">
          <Card><CardHeader><CardTitle>Visão geral</CardTitle></CardHeader><CardContent className="space-y-2">
            <p className="text-sm">Anos cadastrados: {data.annual.length}</p>
            <Button onClick={addYear}>Cadastrar novo ano</Button>
            <p className="text-xs text-slate-500">Status desta aba: {isDirty ? 'Rascunho em edição' : 'Sem alterações pendentes'}</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="dados-anuais" className="space-y-3">
          {filteredAnnual.map((row) => (
            <Card key={row.year}>
              <CardHeader><CardTitle>{row.year}</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input value={String(row.receita_contribuicao_estados_municipios)} onChange={(e) => updateAnnual(row.year, 'receita_contribuicao_estados_municipios', e.target.value)} placeholder="Receita contribuição Estados/Municípios" />
                <Input value={String(row.complementacao_vaaf)} onChange={(e) => updateAnnual(row.year, 'complementacao_vaaf', e.target.value)} placeholder="VAAF" />
                <Input value={String(row.complementacao_vaat)} onChange={(e) => updateAnnual(row.year, 'complementacao_vaat', e.target.value)} placeholder="VAAT" />
                <Input value={String(row.complementacao_vaar)} onChange={(e) => updateAnnual(row.year, 'complementacao_vaar', e.target.value)} placeholder="VAAR" />
                <Input value={String(row.complementacao_uniao_total)} onChange={(e) => updateAnnual(row.year, 'complementacao_uniao_total', e.target.value)} placeholder="Complementação União total" />
                <Input value={String(row.total_fundeb_previsto)} onChange={(e) => updateAnnual(row.year, 'total_fundeb_previsto', e.target.value)} placeholder="Receita total prevista/estimada" />
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-slate-500">Status desta aba: {isDirty ? 'Rascunho em edição' : 'Sem alterações pendentes'}</p>
        </TabsContent>

        <TabsContent value="indicadores-vaat" className="space-y-3">
          {filteredIndicators.map((row) => (
            <Card key={row.year}>
              <CardHeader><CardTitle>{row.year}</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input value={String(row.vaat_antes_complementacao)} onChange={(e) => updateIndicator(row.year, 'vaat_antes_complementacao', e.target.value)} placeholder="VAAT antes da complementação" />
                <Input value={String(row.vaat_com_complementacao)} onChange={(e) => updateIndicator(row.year, 'vaat_com_complementacao', e.target.value)} placeholder="VAAT com complementação" />
                <Input value={String(row.complementacao_vaat)} onChange={(e) => updateIndicator(row.year, 'complementacao_vaat', e.target.value)} placeholder="Complementação VAAT" />
                <Input value={String(row.iei_percentual)} onChange={(e) => updateIndicator(row.year, 'iei_percentual', e.target.value)} placeholder="IEI (%)" />
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-slate-500">Status desta aba: {isDirty ? 'Rascunho em edição' : 'Sem alterações pendentes'}</p>
        </TabsContent>

        <TabsContent value="cronograma-vaat" className="space-y-3">
            <Card>
              <CardHeader><CardTitle>Cronograma {selectedYear}</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {filteredSchedule.map((row) => (
                  <Input key={`${row.year}-${row.month_order}`} value={String(row.value)} onChange={(e) => updateSchedule(row.year, row.month_order, e.target.value)} placeholder={row.month_label} />
                ))}
              </CardContent>
            </Card>
          {validation.blockingErrors.some((message) => message.includes('cronograma')) ? (
            <p className="text-sm text-amber-700">A soma do cronograma VAAT não confere com a complementação VAAT anual. Revise os valores antes de publicar.</p>
          ) : null}
          <p className="text-xs text-slate-500">Status desta aba: {isDirty ? 'Rascunho em edição' : 'Sem alterações pendentes'}</p>
        </TabsContent>

        <TabsContent value="fontes">
          <Card><CardHeader><CardTitle>Fontes e observações</CardTitle></CardHeader><CardContent className="space-y-2">
            <Input value={data.settings.title} onChange={(e) => { setData({ ...data, settings: { ...data.settings, title: e.target.value } }); setIsDirty(true) }} />
            <Input value={data.settings.subtitle} onChange={(e) => { setData({ ...data, settings: { ...data.settings, subtitle: e.target.value } }); setIsDirty(true) }} />
            <Textarea value={data.settings.observation_text} onChange={(e) => { setData({ ...data, settings: { ...data.settings, observation_text: e.target.value } }); setIsDirty(true) }} />
            <Textarea value={data.settings.footer_text} onChange={(e) => { setData({ ...data, settings: { ...data.settings, footer_text: e.target.value } }); setIsDirty(true) }} />
            <p className="text-xs text-slate-500">Status desta aba: {isDirty ? 'Rascunho em edição' : 'Sem alterações pendentes'}</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="csv">
          <Card><CardHeader><CardTitle>Importar CSV</CardTitle></CardHeader><CardContent className="space-y-3">
            <Textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="Cole aqui o conteúdo CSV com separador ponto e vírgula." />
            <Button variant="outline" onClick={applyCsvRows}>Importar CSV</Button>
            {csvPreview.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linha</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Total previsto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvPreview.map((row) => (
                      <TableRow key={row.lineNumber}>
                        <TableCell>{row.lineNumber}</TableCell>
                        <TableCell>{row.ano}</TableCell>
                        <TableCell>{row.totalPrevisto}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{[...row.errors, ...row.warnings].join(' | ') || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card><CardHeader><CardTitle>Pré-visualização</CardTitle></CardHeader><CardContent className="space-y-2">
            {data.annual.map((row) => (
              <div key={row.year} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-semibold">{row.year}</p>
                <p>Receita total prevista/estimada do Fundeb: {formatCurrencyBRL(row.total_fundeb_previsto)}</p>
                <p>Complementação da União: {formatCurrencyBRL(row.complementacao_uniao_total)}</p>
              </div>
            ))}
            <Button variant="outline">Pré-visualizar gráficos</Button>
            <p className="text-xs text-slate-500">Status desta aba: {isDirty ? 'Rascunho em edição' : 'Sem alterações pendentes'}</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onSave}>Salvar rascunho</Button>
        <Button variant="outline" onClick={onPublish}>Publicar no site</Button>
        <Button variant="outline">Pré-visualizar gráficos</Button>
      </div>
    </div>
  )
}
