import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, CircleCheck, TriangleAlert } from 'lucide-react'

import {
  buildMatriculasAutoFillResult,
  getMatriculasCsvTemplate,
  validateMatriculasCsv,
  type MatriculasCsvRow,
  type MatriculasCsvValidationResult,
} from './matriculasCsv'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const PREVIEW_LIMIT = 10

interface MatriculasCsvImportBlockProps {
  onValidRowsReady: (validRows: MatriculasCsvRow[]) => void
  onValidationError: () => void
}

export function MatriculasCsvImportBlock({ onValidRowsReady, onValidationError }: MatriculasCsvImportBlockProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<MatriculasCsvValidationResult | null>(null)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  const previewRows = useMemo(() => validationResult?.rows.slice(0, PREVIEW_LIMIT) ?? [], [validationResult])

  const csvValidatedOk = Boolean(
    validationResult && validationResult.errors.length === 0 && validationResult.totalRows > 0,
  )

  const validationSuccessSummary = useMemo(() => {
    if (!csvValidatedOk || !validationResult) return null
    const autoFill = buildMatriculasAutoFillResult(validationResult.validRows)
    return {
      totalLinhas: String(validationResult.totalRows),
      totalGeral: autoFill.resumo.totalGeralImportado,
      ano: autoFill.fonte.anoReferencia,
      fonte: autoFill.fonte.fonte,
    }
  }, [csvValidatedOk, validationResult])

  const validationWarnings = useMemo(() => {
    if (!csvValidatedOk || !validationResult) return []
    const autoFill = buildMatriculasAutoFillResult(validationResult.validRows)
    return autoFill.supportNotes
  }, [csvValidatedOk, validationResult])

  async function handleValidateCsv() {
    if (!selectedFile) {
      setValidationResult({
        rows: [],
        validRows: [],
        errors: [{ line: 0, messages: ['Selecione um arquivo CSV antes de validar.'] }],
        totalRows: 0,
        totalMatriculas: 0,
        anoIdentificado: '-',
        fonteIdentificada: '-',
      })
      onValidationError()
      return
    }

    const fileContent = await selectedFile.text()
    const result = validateMatriculasCsv(fileContent)
    setValidationResult(result)

    if (result.errors.length === 0 && result.totalRows > 0) {
      onValidRowsReady(result.validRows)
      setSuccessDialogOpen(true)
    } else {
      onValidationError()
    }
  }

  function handleDownloadTemplate() {
    const template = getMatriculasCsvTemplate()
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = 'modelo-matriculas.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  }

  const hasBlockingErrors = Boolean(validationResult && validationResult.errors.length > 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-slate-700">upload_file</span>
        <h4 className="text-base font-black text-slate-900">Importar dados de Matrículas do Censo Escolar</h4>
      </div>
      <p className="text-sm text-slate-600">
        Use esta área para importar uma planilha CSV com dados de matrículas do Censo Escolar/Inep ou QEdu.
      </p>
      <p className="text-xs text-slate-500 mt-2">
        Código IBGE de referência: <span className="font-bold">2904506</span>. Após validar sem erros, o salvamento no banco será liberado.
      </p>
      <p className="text-xs text-slate-500 mt-1">
        Fluxo: selecionar arquivo CSV - validar CSV - conferir resumo - conferir campos preenchidos.
      </p>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{selectedFile ? `Arquivo: ${selectedFile.name}` : 'Nenhum arquivo selecionado'}</span>
            <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
              Baixar modelo CSV
            </Button>
          </div>
          <label className="h-10 inline-flex items-center justify-center px-4 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-bold hover:bg-slate-100 cursor-pointer">
            Selecionar arquivo CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null
                setSelectedFile(nextFile)
                setValidationResult(null)
              }}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="lg" onClick={handleValidateCsv}>
              Validar CSV
            </Button>
            {csvValidatedOk ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                <CircleCheck className="size-3.5 shrink-0" aria-hidden />
                Planilha validada
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Colunas esperadas</p>
          <code className="text-xs text-slate-700 break-all">
            ano,tipo_registro,etapa,modalidade,escola,localizacao,dependencia,quantidade,fonte,data_atualizacao
          </code>
          <ul className="mt-3 text-xs text-slate-600 list-disc pl-4 space-y-1">
            <li>Campos obrigatórios: ano, tipo_registro, quantidade, fonte e data_atualizacao.</li>
            <li>Preencher ao menos um entre etapa, modalidade ou escola.</li>
            <li>Linhas totalmente vazias são ignoradas automaticamente.</li>
          </ul>
        </div>
      </div>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden" showCloseButton>
          <div className="p-5 space-y-4">
            <DialogHeader className="space-y-2">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-emerald-200/90 bg-emerald-50 text-emerald-700"
                  aria-hidden
                >
                  <CheckCircle2 className="size-5" />
                </span>
                <div className="space-y-1">
                  <DialogTitle className="text-slate-900">CSV validado com sucesso</DialogTitle>
                  <DialogDescription className="text-slate-700">
                    As informações da planilha foram conferidas e os campos foram preenchidos automaticamente para revisão.
                  </DialogDescription>
                  <p className="text-sm font-medium text-slate-600">
                    Revise os dados antes de salvar a importação como rascunho no banco.
                  </p>
                </div>
              </div>
            </DialogHeader>

            {validationSuccessSummary ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SummaryItem label="Total de linhas" value={validationSuccessSummary.totalLinhas} />
                <SummaryItem label="Total geral importado" value={validationSuccessSummary.totalGeral} />
                <SummaryItem label="Ano" value={validationSuccessSummary.ano} />
                <SummaryItem label="Fonte" value={validationSuccessSummary.fonte} />
              </div>
            ) : null}

            {validationWarnings.length > 0 ? (
              <Alert className="border-amber-200 bg-amber-50/80 text-amber-950">
                <TriangleAlert className="size-4" aria-hidden />
                <AlertTitle>Avisos da validação</AlertTitle>
                <AlertDescription className="text-amber-900">
                  <ul className="list-disc pl-4">
                    {validationWarnings.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
          <DialogFooter className="sm:justify-end">
            <Button type="button" onClick={() => setSuccessDialogOpen(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {validationResult && (
        <div className="mt-5 flex flex-col gap-4">
          {hasBlockingErrors ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" aria-hidden />
              <AlertTitle>Não foi possível validar o CSV</AlertTitle>
              <AlertDescription>
                <p>Corrija os pontos indicados no CSV e clique em &quot;Validar CSV&quot; novamente.</p>
                {validationResult.errors.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {validationResult.errors.map((error) => (
                      <li key={`${error.line}-${error.messages.join('|')}`} className="leading-snug">
                        {error.line > 0 ? <span className="font-semibold">Linha {error.line}: </span> : null}
                        {error.messages.join('; ')}.
                      </li>
                    ))}
                  </ul>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
            <h5 className="text-sm font-black text-slate-900 mb-3">Resumo da importação</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <SummaryItem label="Total de linhas" value={String(validationResult.totalRows)} />
              <SummaryItem label="Total de matrículas somadas" value={String(validationResult.totalMatriculas)} />
              <SummaryItem label="Ano identificado" value={validationResult.anoIdentificado} />
              <SummaryItem label="Fonte identificada" value={validationResult.fonteIdentificada} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Este total soma todas as linhas válidas do CSV importado.</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 bg-white overflow-x-auto">
            <h5 className="text-sm font-black text-slate-900 mb-3">Pré-visualização das linhas importadas</h5>
            {previewRows.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma linha para pré-visualização.</p>
            ) : (
              <table className="min-w-full text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <TableHeader>ano</TableHeader>
                    <TableHeader>tipo_registro</TableHeader>
                    <TableHeader>etapa</TableHeader>
                    <TableHeader>modalidade</TableHeader>
                    <TableHeader>escola</TableHeader>
                    <TableHeader>localizacao</TableHeader>
                    <TableHeader>dependencia</TableHeader>
                    <TableHeader>quantidade</TableHeader>
                    <TableHeader>fonte</TableHeader>
                    <TableHeader>data_atualizacao</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr key={`${row.ano}-${row.etapa}-${row.modalidade}-${row.escola}-${index}`} className="border-t border-slate-200">
                      <TableCell>{row.ano}</TableCell>
                      <TableCell>{row.tipo_registro}</TableCell>
                      <TableCell>{row.etapa}</TableCell>
                      <TableCell>{row.modalidade}</TableCell>
                      <TableCell>{row.escola}</TableCell>
                      <TableCell>{row.localizacao}</TableCell>
                      <TableCell>{row.dependencia}</TableCell>
                      <TableCell>{row.quantidade}</TableCell>
                      <TableCell>{row.fonte}</TableCell>
                      <TableCell>{row.data_atualizacao}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {validationResult.rows.length > PREVIEW_LIMIT && (
              <p className="mt-2 text-xs text-slate-500">
                Mostrando {PREVIEW_LIMIT} de {validationResult.rows.length} linhas.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
      <p className="text-sm text-slate-900 font-black mt-1 break-words">{value || '-'}</p>
    </div>
  )
}

function TableHeader({ children }: { children: string }) {
  return <th className="px-2 py-2 text-left font-bold whitespace-nowrap">{children}</th>
}

function TableCell({ children }: { children: string }) {
  return <td className="px-2 py-2 text-slate-700 whitespace-nowrap">{children || '-'}</td>
}
