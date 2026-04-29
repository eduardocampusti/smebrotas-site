import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AdminDashboardIndicator, IndicatorDataBlock } from './types'
import { IndicatorSelector } from './IndicatorSelector'
import { IndicatorDataEditor } from './IndicatorDataEditor'
import { MatriculasCsvImportBlock } from './MatriculasCsvImportBlock'
import { EjaIndicatorDataEditor } from './EjaIndicatorDataEditor'
import { MatriculasIndicatorDataEditor } from './MatriculasIndicatorDataEditor'
import { MatriculasImportFeedbackCard } from './MatriculasImportFeedbackCard'
import { MatriculasImportStatusCard, type MatriculasImportStatusSource } from './MatriculasImportStatusCard'
import { MatriculasSavedImportsList } from './MatriculasSavedImportsList'
import { buildMatriculasAutoFillResult, type MatriculasCsvRow } from './matriculasCsv'
import { buildMatriculasDataBlockFromAutoFill } from './matriculasAdminFill'
import {
  getUltimaImportacaoEjaAdmin,
  publishEjaImportacao,
  saveEjaImportacaoDraft,
  type EjaEvolucaoManualRowInput,
  type EjaPublicadaComLinhas,
} from '@/services/transparencia/ejaImportacaoService'
import {
  getMatriculasImportacaoById,
  getUltimaImportacaoMatriculasAdmin,
  matriculaLinhasToCsvRows,
  publishMatriculasImportacao,
  saveMatriculasEvolucaoManual,
  saveMatriculasImportacaoDraft,
  type MatriculasEvolucaoManualRowInput,
  type MatriculasPublicadaComLinhas,
} from '@/services/transparencia/matriculasImportacaoService'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminTransparenciaIndicatorDataTabProps {
  indicators: AdminDashboardIndicator[]
  selectedIndicatorId: string
  onSelectIndicator: (id: string) => void
  indicatorDataMap: Record<string, IndicatorDataBlock>
  onUpdateData: (id: string, next: IndicatorDataBlock) => void
}

type MatriculasDbLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'success' }

function formatIsoDateTimeBr(iso: string | null | undefined) {
  if (!iso?.trim()) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso.trim()
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(t))
}

function formatIntegerPtBr(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function AdminTransparenciaIndicatorDataTab({
  indicators,
  selectedIndicatorId,
  onSelectIndicator,
  indicatorDataMap,
  onUpdateData,
}: AdminTransparenciaIndicatorDataTabProps) {
  const [matriculasValidRows, setMatriculasValidRows] = useState<MatriculasCsvRow[]>([])
  const [savedImportacaoId, setSavedImportacaoId] = useState<string | null>(null)
  const [savedImportacaoStatus, setSavedImportacaoStatus] = useState<'rascunho' | 'publicado' | null>(null)
  const [draftSavedForCurrentCsv, setDraftSavedForCurrentCsv] = useState(false)
  const [statusCardSource, setStatusCardSource] = useState<MatriculasImportStatusSource>('session-save')
  const [statusCardUpdatedAtLabel, setStatusCardUpdatedAtLabel] = useState<string | null>(null)
  const [matriculasDbLoad, setMatriculasDbLoad] = useState<MatriculasDbLoadState>({ status: 'idle' })
  const [persistMessage, setPersistMessage] = useState<{
    tone: 'success' | 'error'
    title: string
    text: string
    summaryLines?: { label: string; value: string }[]
  } | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [savingManualEvolucao, setSavingManualEvolucao] = useState(false)
  const [manualEvolucaoError, setManualEvolucaoError] = useState<string | null>(null)

  const indicatorDataMapRef = useRef(indicatorDataMap)
  indicatorDataMapRef.current = indicatorDataMap

  const onUpdateDataRef = useRef(onUpdateData)
  onUpdateDataRef.current = onUpdateData

  const selectedIndicator = indicators.find((item) => item.id === selectedIndicatorId) || indicators[0]
  const selectedData = selectedIndicator ? indicatorDataMap[selectedIndicator.id] : undefined
  const isMatriculas = selectedIndicator?.titulo === 'Matrículas'
  const isEja = selectedIndicator?.titulo === 'EJA'
  const matriculasIndicatorId = useMemo(
    () => indicators.find((item) => item.titulo === 'Matrículas')?.id ?? null,
    [indicators],
  )
  const ejaIndicatorId = useMemo(() => indicators.find((item) => item.titulo === 'EJA')?.id ?? null, [indicators])
  const [ejaSavedImportacaoId, setEjaSavedImportacaoId] = useState<string | null>(null)
  const [ejaSaving, setEjaSaving] = useState(false)
  const [ejaPublishing, setEjaPublishing] = useState(false)
  const [ejaMessage, setEjaMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const matriculasSummary = useMemo(() => {
    if (matriculasValidRows.length === 0) return null
    const autoFill = buildMatriculasAutoFillResult(matriculasValidRows)
    return {
      anoReferencia: autoFill.fonte.anoReferencia,
      totalGeralImportado: autoFill.resumo.totalGeralImportado,
      fonteResumo: autoFill.fonte.fonte,
    }
  }, [matriculasValidRows])

  const applyMatriculasImportToForm = useCallback(
    (full: MatriculasPublicadaComLinhas, cardSource: MatriculasImportStatusSource) => {
      const mid = matriculasIndicatorId
      if (!mid) return
      const block = indicatorDataMapRef.current[mid]
      if (!block) return

      const rows = matriculaLinhasToCsvRows(full.linhas)
      const hasRows = rows.length > 0
      const autoFill = hasRows
        ? buildMatriculasAutoFillResult(rows)
        : {
            resumo: {
              totalGeralImportado: String(full.importacao.total_geral_importado ?? 0),
              totalInfantilFundamental: String(full.importacao.total_infantil_fundamental ?? 0),
              totalEja: String(full.importacao.total_eja ?? 0),
              totalAeeEducacaoEspecial: String(full.importacao.total_aee_educacao_especial ?? 0),
              matriculasEducacaoEspecial: String(full.importacao.total_aee_educacao_especial ?? 0),
              anoReferencia: String(full.importacao.ano_referencia ?? 'Não informado'),
              fonteDados: full.importacao.fonte_resumo?.trim() || 'Não informado',
              dataAtualizacao: full.importacao.data_atualizacao?.trim() || 'Não informado',
            },
            etapas: {
              creche: 'Não informado',
              preEscola: 'Não informado',
              anosIniciais: 'Não informado',
              anosFinais: 'Não informado',
              eja: String(full.importacao.total_eja ?? 0),
              educacaoEspecial: String(full.importacao.total_aee_educacao_especial ?? 0),
            },
            evolucao: [{ ano: String(full.importacao.ano_referencia ?? ''), total: String(full.importacao.total_geral_importado ?? 0) }],
            localizacao: {
              urbana: 'Não informado',
              rural: 'Não informado',
              hasLocationData: Boolean(full.importacao.possui_localizacao),
            },
            fonte: {
              fonte: full.importacao.fonte_resumo?.trim() || 'Não informado',
              anoReferencia: String(full.importacao.ano_referencia ?? 'Não informado'),
              dataAtualizacao: full.importacao.data_atualizacao?.trim() || 'Não informado',
              link: 'Link da fonte não informado',
            },
            supportNotes: [
              'Importação carregada sem linhas detalhadas visíveis. Resumo preenchido a partir dos totais salvos no banco.',
            ],
          }
      const nextMatriculas = buildMatriculasDataBlockFromAutoFill(block.matriculas, autoFill)
      const evolucaoManual = buildManualEvolucaoRowsFromLinhas(full.linhas)

      onUpdateDataRef.current(mid, {
        ...block,
        matriculas: {
          ...nextMatriculas,
          evolucaoManual,
        },
        textoApoio: autoFill.supportNotes.join('\n'),
      })
      setMatriculasValidRows(rows)
      setSavedImportacaoId(full.importacao.id)
      setSavedImportacaoStatus(full.importacao.status_publicacao)
      setDraftSavedForCurrentCsv(full.importacao.status_publicacao === 'rascunho' && hasRows)
      setStatusCardSource(cardSource)
      setStatusCardUpdatedAtLabel(formatIsoDateTimeBr(full.importacao.updated_at))

      if (!hasRows) {
        setPersistMessage({
          tone: 'success',
          title: 'Importação carregada',
          text: 'Os totais salvos no banco foram carregados. As linhas detalhadas não vieram nesta leitura, então alguns blocos podem permanecer sem detalhamento.',
          summaryLines: [
            { label: 'Status', value: full.importacao.status_publicacao === 'publicado' ? 'Publicado' : 'Rascunho' },
            { label: 'Ano', value: String(full.importacao.ano_referencia) },
            { label: 'Total geral importado', value: formatIntegerPtBr(full.importacao.total_geral_importado ?? 0) },
          ],
        })
      }
    },
    [matriculasIndicatorId],
  )

  useEffect(() => {
    if (!isMatriculas) return
    setPersistMessage(null)
  }, [selectedIndicator?.id, isMatriculas])

  const applyEjaImportToForm = useCallback(
    (full: EjaPublicadaComLinhas) => {
      const eid = ejaIndicatorId
      if (!eid) return
      const block = indicatorDataMapRef.current[eid]
      if (!block) return
      const rowsMap = new Map<string, { urbana: number; rural: number }>()
      for (const linha of full.linhas) {
        const ano = String(linha.ano)
        const item = rowsMap.get(ano) ?? { urbana: 0, rural: 0 }
        if ((linha.localizacao ?? '').toLowerCase() === 'urbana') item.urbana += linha.quantidade
        if ((linha.localizacao ?? '').toLowerCase() === 'rural') item.rural += linha.quantidade
        rowsMap.set(ano, item)
      }
      const evolucaoManual = [...rowsMap.entries()]
        .map(([ano, row]) => ({
          id: crypto.randomUUID(),
          ano,
          urbana: String(row.urbana),
          rural: String(row.rural),
        }))
        .sort((a, b) => Number(a.ano) - Number(b.ano))

      onUpdateDataRef.current(eid, {
        ...block,
        eja: {
          evolucaoManual,
          fonte: {
            fonte: full.importacao.fonte_resumo ?? 'Não informado',
            anoReferencia: String(full.importacao.ano_referencia ?? ''),
            dataAtualizacao: full.importacao.data_atualizacao ?? '',
            link: '',
          },
        },
      })
      setEjaSavedImportacaoId(full.importacao.id)
    },
    [ejaIndicatorId],
  )

  useEffect(() => {
    if (!ejaIndicatorId || selectedIndicatorId !== ejaIndicatorId) return
    let cancelled = false
    ;(async () => {
      try {
        const ultima = await getUltimaImportacaoEjaAdmin()
        if (!cancelled && ultima) applyEjaImportToForm(ultima)
      } catch {
        if (!cancelled) {
          setEjaMessage({ tone: 'error', text: 'Não foi possível carregar os dados da EJA salvos no banco.' })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ejaIndicatorId, selectedIndicatorId, applyEjaImportToForm])

  useEffect(() => {
    if (!matriculasIndicatorId || selectedIndicatorId !== matriculasIndicatorId) {
      setMatriculasDbLoad({ status: 'idle' })
      return
    }

    let cancelled = false
    setMatriculasDbLoad({ status: 'loading' })

    ;(async () => {
      try {
        const ultima = await getUltimaImportacaoMatriculasAdmin()
        if (cancelled) return
        if (!ultima) {
          setMatriculasDbLoad({ status: 'empty' })
          return
        }
        applyMatriculasImportToForm(ultima, 'loaded-from-database')
        if (!cancelled) setMatriculasDbLoad({ status: 'success' })
      } catch {
        if (!cancelled) {
          setMatriculasDbLoad({
            status: 'error',
            message: 'Não foi possível carregar a importação salva. Verifique sua conexão e permissões de administrador.',
          })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [matriculasIndicatorId, selectedIndicatorId, applyMatriculasImportToForm])

  const handleLoadImportacaoById = useCallback(
    async (importacaoId: string) => {
      const full = await getMatriculasImportacaoById(importacaoId)
      if (full) applyMatriculasImportToForm(full, 'loaded-from-database')
    },
    [applyMatriculasImportToForm],
  )

  const handleAfterPublishFromList = useCallback(async () => {
    const ultima = await getUltimaImportacaoMatriculasAdmin()
    if (ultima) applyMatriculasImportToForm(ultima, 'loaded-from-database')
  }, [applyMatriculasImportToForm])

  async function handleSaveMatriculasDraft() {
    if (!isMatriculas || !matriculasIndicatorId || matriculasValidRows.length === 0 || savingDraft || publishing) return

    setPersistMessage(null)
    setSavingDraft(true)
    try {
      const draftPayload = buildSaveDraftPayload(matriculasValidRows)
      const savedImportacao = await saveMatriculasImportacaoDraft(draftPayload, matriculasValidRows)
      setSavedImportacaoId(savedImportacao.id)
      setSavedImportacaoStatus(savedImportacao.status_publicacao)
      setDraftSavedForCurrentCsv(true)
      setStatusCardSource('session-save')
      setStatusCardUpdatedAtLabel(formatIsoDateTimeBr(savedImportacao.updated_at))
      setPersistMessage(null)
    } catch (error) {
      setPersistMessage({
        tone: 'error',
        title: 'Não foi possível concluir a ação',
        text: getMatriculasFriendlyErrorMessage(error, 'save'),
      })
    } finally {
      setSavingDraft(false)
    }
  }

  async function handleSaveManualEvolucao() {
    if (!matriculasIndicatorId || !savedImportacaoId || savingManualEvolucao || savingDraft || publishing) return

    setManualEvolucaoError(null)
    setPersistMessage(null)

    const block = indicatorDataMapRef.current[matriculasIndicatorId]
    const rows = sortManualEvolucaoRows(block?.matriculas?.evolucaoManual ?? [])
    if (block?.matriculas?.evolucaoManual) {
      onUpdateDataRef.current(matriculasIndicatorId, {
        ...block,
        matriculas: {
          ...block.matriculas,
          evolucaoManual: rows,
        },
      })
    }
    const parsed = parseAndValidateManualEvolucao(rows)
    if (!parsed.ok) {
      setManualEvolucaoError(parsed.message)
      return
    }

    setSavingManualEvolucao(true)
    try {
      await saveMatriculasEvolucaoManual(savedImportacaoId, parsed.value)
      setPersistMessage({
        tone: 'success',
        title: 'Dados de evolução anual salvos com sucesso.',
        text: 'Dados de evolução anual salvos com sucesso.',
      })
      const fullAtualizada = await getMatriculasImportacaoById(savedImportacaoId)
      if (fullAtualizada) {
        applyMatriculasImportToForm(fullAtualizada, 'session-save')
      }
    } catch (error) {
      if (error && typeof error === 'object') {
        const maybeError = error as { message?: string; details?: string; hint?: string; code?: string }
        console.error('[Matrículas][Evolução manual] Falha ao salvar', {
          message: maybeError.message ?? null,
          details: maybeError.details ?? null,
          hint: maybeError.hint ?? null,
          code: maybeError.code ?? null,
        })
      } else {
        console.error('[Matrículas][Evolução manual] Falha ao salvar', { error })
      }
      setPersistMessage({
        tone: 'error',
        title: 'Não foi possível salvar os dados de evolução anual.',
        text: 'Não foi possível salvar os dados de evolução anual.',
      })
    } finally {
      setSavingManualEvolucao(false)
    }
  }

  async function handlePublishMatriculas() {
    if (!savedImportacaoId || publishing || savingDraft) return

    setPersistMessage(null)
    setPublishing(true)
    try {
      const publishedImportacao = await publishMatriculasImportacao(savedImportacaoId)
      setSavedImportacaoStatus(publishedImportacao.status_publicacao)
      setDraftSavedForCurrentCsv(false)
      setStatusCardSource('session-save')
      setStatusCardUpdatedAtLabel(formatIsoDateTimeBr(publishedImportacao.updated_at))
      setPersistMessage({
        tone: 'success',
        title: 'Dados publicados com sucesso',
        text: 'Os dados de Matrículas foram publicados no banco e já podem ser exibidos na página pública de Transparência.',
        summaryLines: matriculasSummary
          ? [
              { label: 'ID da importação', value: savedImportacaoId },
              { label: 'Status', value: 'Publicado' },
              { label: 'Ano', value: matriculasSummary.anoReferencia },
              { label: 'Total geral importado', value: matriculasSummary.totalGeralImportado },
            ]
          : [
              { label: 'ID da importação', value: savedImportacaoId },
              { label: 'Status', value: 'Publicado' },
            ],
      })
      setPublishDialogOpen(false)
    } catch (error) {
      setPersistMessage({
        tone: 'error',
        title: 'Não foi possível concluir a ação',
        text: getMatriculasFriendlyErrorMessage(error, 'publish'),
      })
    } finally {
      setPublishing(false)
    }
  }

  async function handleSaveEja() {
    if (!ejaIndicatorId || ejaSaving || ejaPublishing) return
    const block = indicatorDataMapRef.current[ejaIndicatorId]
    const parsed = parseAndValidateEjaRows(block?.eja?.evolucaoManual ?? [])
    if (!parsed.ok) {
      setEjaMessage({ tone: 'error', text: parsed.message })
      return
    }

    const fonte = block?.eja?.fonte
    const ultimoAno = parsed.value[parsed.value.length - 1]?.ano ?? new Date().getFullYear()
    const totais = parsed.value.reduce(
      (acc, row) => ({ urbana: acc.urbana + row.urbana, rural: acc.rural + row.rural }),
      { urbana: 0, rural: 0 },
    )
    setEjaSaving(true)
    setEjaMessage(null)
    try {
      const saved = await saveEjaImportacaoDraft(
        {
          ano_referencia: Number.parseInt(fonte?.anoReferencia || String(ultimoAno), 10) || ultimoAno,
          total_eja: totais.urbana + totais.rural,
          total_urbana: totais.urbana,
          total_rural: totais.rural,
          fonte_resumo: fonte?.fonte || 'QEdu/Censo Escolar Inep — Escolas públicas de Brotas de Macaúbas',
          data_atualizacao: fonte?.dataAtualizacao || null,
          observacoes: 'Cadastro manual da EJA no painel administrativo.',
        },
        parsed.value,
      )
      setEjaSavedImportacaoId(saved.id)
      setEjaMessage({ tone: 'success', text: 'Dados da EJA salvos com sucesso.' })
    } catch {
      setEjaMessage({ tone: 'error', text: 'Não foi possível salvar os dados da EJA.' })
    } finally {
      setEjaSaving(false)
    }
  }

  async function handlePublishEja() {
    if (!ejaSavedImportacaoId || ejaSaving || ejaPublishing) return
    setEjaPublishing(true)
    setEjaMessage(null)
    try {
      await publishEjaImportacao(ejaSavedImportacaoId)
      setEjaMessage({ tone: 'success', text: 'Dados da EJA publicados com sucesso.' })
    } catch {
      setEjaMessage({ tone: 'error', text: 'Não foi possível salvar os dados da EJA.' })
    } finally {
      setEjaPublishing(false)
    }
  }

  const futureImportHint = selectedIndicator ? getFutureImportHint(selectedIndicator.titulo) : ''

  if (!selectedIndicator || !selectedData) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Selecione um indicador para editar os dados.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">Dados dos indicadores</h3>
        <p className="text-sm text-slate-600 mt-1">
          Preencha os dados de forma simples para publicação na página de Transparência.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
        Para Matrículas, após validar o CSV sem erros você pode salvar a importação no banco como rascunho e publicar manualmente.
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <IndicatorSelector indicators={indicators} selectedId={selectedIndicator.id} onChange={onSelectIndicator} />
        </div>
        <div className="lg:col-span-2 rounded-xl border border-slate-200 p-4 bg-slate-50">
          <div className="flex flex-wrap items-center gap-3">
            <span className="material-symbols-outlined text-slate-700">{selectedIndicator.icone}</span>
            <h3 className="text-lg font-black text-slate-900">{selectedIndicator.titulo}</h3>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            {isMatriculas
              ? 'Cadastre ou importe os dados de matrícula que serão exibidos na página pública de Transparência.'
              : selectedIndicator.descricao}
          </p>
          <div className="mt-3 text-xs text-slate-500">
            {isMatriculas
              ? 'Os dados de Matrículas podem ser importados por CSV, salvos como rascunho e publicados para a página pública.'
              : 'Blocos esperados para edição: indicadores resumidos, dados para gráficos e informações detalhadas.'}
          </div>
        </div>
      </div>

      {isMatriculas ? (
        <>
          {matriculasDbLoad.status === 'loading' ? (
            <Card className="border-slate-200 bg-slate-50 shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-base">Carregando importação salva...</CardTitle>
                <CardDescription>Buscando a importação mais recente no banco de dados.</CardDescription>
              </CardHeader>
            </Card>
          ) : null}
          {matriculasDbLoad.status === 'error' ? (
            <Card className="border-red-200 bg-red-50 shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-base text-red-950">Não foi possível carregar</CardTitle>
                <CardDescription className="text-red-900/90">{matriculasDbLoad.message}</CardDescription>
              </CardHeader>
            </Card>
          ) : null}
          {matriculasDbLoad.status === 'empty' ? (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-base">Nenhuma importação salva encontrada.</CardTitle>
                <CardDescription>Importe um CSV válido para criar a primeira importação no banco.</CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <MatriculasCsvImportBlock
            onValidRowsReady={(validRows) => {
              const autoFill = buildMatriculasAutoFillResult(validRows)
              const currentMatriculas = selectedData.matriculas
              const nextMatriculas = buildMatriculasDataBlockFromAutoFill(currentMatriculas, autoFill)

              onUpdateData(selectedIndicator.id, {
                ...selectedData,
                matriculas: nextMatriculas,
                textoApoio: autoFill.supportNotes.join('\n'),
              })
              setMatriculasValidRows(validRows)
              setSavedImportacaoId(null)
              setSavedImportacaoStatus(null)
              setPersistMessage(null)
              setDraftSavedForCurrentCsv(false)
              setStatusCardSource('session-save')
              setStatusCardUpdatedAtLabel(null)
            }}
            onValidationError={() => {
              setMatriculasValidRows([])
              setSavedImportacaoId(null)
              setSavedImportacaoStatus(null)
              setPersistMessage(null)
              setDraftSavedForCurrentCsv(false)
              setStatusCardSource('session-save')
              setStatusCardUpdatedAtLabel(null)
            }}
          />

          <MatriculasSavedImportsList
            activeImportacaoId={savedImportacaoId}
            onLoadImportacao={handleLoadImportacaoById}
            onAfterPublish={handleAfterPublishFromList}
            disabled={savingDraft || publishing}
          />

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleSaveMatriculasDraft}
                disabled={savingDraft || publishing || matriculasValidRows.length === 0}
                size="lg"
              >
                {savingDraft ? 'Salvando...' : 'Salvar importação no banco'}
              </Button>
              {draftSavedForCurrentCsv && savedImportacaoId && savedImportacaoStatus === 'rascunho' ? (
                <Badge variant="outline" className="border-slate-300">
                  Rascunho salvo no banco
                </Badge>
              ) : null}
              <Button
                type="button"
                onClick={() => setPublishDialogOpen(true)}
                disabled={publishing || savingDraft || !savedImportacaoId || savedImportacaoStatus === 'publicado'}
                size="lg"
                variant={savedImportacaoStatus === 'publicado' ? 'secondary' : 'outline'}
              >
                {publishing ? 'Publicando...' : savedImportacaoStatus === 'publicado' ? 'Publicado' : 'Publicar no site'}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              O botão de salvamento só é habilitado após validação sem erros ou após carregar uma importação do banco. A
              publicação depende de uma importação salva (ID conhecido).
            </p>
            {savedImportacaoId && savedImportacaoStatus && matriculasSummary ? (
              <MatriculasImportStatusCard
                importacaoId={savedImportacaoId}
                status={savedImportacaoStatus}
                anoReferencia={matriculasSummary.anoReferencia}
                totalGeralImportado={matriculasSummary.totalGeralImportado}
                fonteResumo={matriculasSummary.fonteResumo}
                source={statusCardSource}
                dataAtualizacaoLabel={statusCardUpdatedAtLabel}
              />
            ) : null}
            {persistMessage ? (
              <MatriculasImportFeedbackCard
                tone={persistMessage.tone}
                title={persistMessage.title}
                description={persistMessage.text}
                summaryLines={persistMessage.summaryLines}
              />
            ) : null}
          </div>
          <AlertDialog
            open={publishDialogOpen}
            onOpenChange={(open) => {
              if (!open && publishing) return
              setPublishDialogOpen(open)
            }}
          >
            <AlertDialogContent showCloseButton={!publishing}>
              <AlertDialogHeader>
                <AlertDialogTitle>Publicar dados de Matrículas?</AlertDialogTitle>
                <AlertDialogDescription>
                  Estes dados serão exibidos na página pública de Transparência. Se já houver uma publicação anterior, ela será substituída por esta importação.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-end">
                <Button variant="outline" onClick={() => setPublishDialogOpen(false)} disabled={publishing}>
                  Cancelar
                </Button>
                <Button onClick={handlePublishMatriculas} disabled={publishing || !savedImportacaoId}>
                  {publishing ? 'Publicando...' : 'Publicar no site'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <MatriculasIndicatorDataEditor
            data={selectedData}
            onChange={(next) => onUpdateData(selectedIndicator.id, next)}
            activeImportacaoId={savedImportacaoId}
            activeImportacaoStatus={savedImportacaoStatus}
            onSaveManualEvolucao={handleSaveManualEvolucao}
            savingManualEvolucao={savingManualEvolucao}
            manualEvolucaoError={manualEvolucaoError}
            autoFillHint={
              statusCardSource === 'loaded-from-database'
                ? 'Dados carregados da última importação no banco. Selecione um novo CSV apenas se quiser substituir para conferência antes de salvar.'
                : 'Revise os dados preenchidos automaticamente antes de salvar ou publicar.'
            }
            supportNotes={selectedData.textoApoio
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)}
          />
        </>
      ) : isEja ? (
        <EjaIndicatorDataEditor
          data={selectedData}
          onChange={(next) => onUpdateData(selectedIndicator.id, next)}
          onSave={handleSaveEja}
          onPublish={handlePublishEja}
          saving={ejaSaving}
          publishing={ejaPublishing}
          canPublish={Boolean(ejaSavedImportacaoId)}
          message={ejaMessage}
        />
      ) : (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-sm text-amber-900">
              A importação por planilha ainda está disponível apenas para Matrículas nesta fase.
            </p>
            <p className="text-xs text-amber-800 mt-1">Os demais indicadores serão preparados em etapas futuras.</p>
            {futureImportHint && <p className="text-xs text-amber-800 mt-2">{futureImportHint}</p>}
          </div>
          <IndicatorDataEditor
            data={selectedData}
            onChange={(next) => onUpdateData(selectedIndicator.id, next)}
            indicatorTitle={selectedIndicator.titulo}
          />
        </>
      )}
    </div>
  )
}

function buildSaveDraftPayload(validRows: MatriculasCsvRow[]) {
  const autoFill = buildMatriculasAutoFillResult(validRows)
  const fontesDetectadas = [...new Set(validRows.map((row) => row.fonte.trim()).filter(Boolean))]
  const anoReferenciaNumerico = validRows
    .map((row) => Number.parseInt(row.ano, 10))
    .find((value) => Number.isFinite(value) && value > 0)

  return {
    ano_referencia: anoReferenciaNumerico ?? new Date().getFullYear(),
    fonte_resumo: autoFill.fonte.fonte,
    fontes_detectadas: fontesDetectadas.length > 0 ? fontesDetectadas : [autoFill.fonte.fonte],
    data_atualizacao: autoFill.fonte.dataAtualizacao === 'Não informado' ? null : autoFill.fonte.dataAtualizacao,
    total_geral_importado: parseRequiredNumber(autoFill.resumo.totalGeralImportado),
    total_infantil_fundamental: parseOptionalNumber(autoFill.resumo.totalInfantilFundamental),
    total_eja: parseOptionalNumber(autoFill.resumo.totalEja),
    total_aee_educacao_especial: parseOptionalNumber(autoFill.resumo.totalAeeEducacaoEspecial),
    vagas_disponiveis: null,
    taxa_ocupacao: null,
    possui_localizacao: autoFill.localizacao.hasLocationData,
    observacoes: autoFill.supportNotes.length > 0 ? autoFill.supportNotes.join(' ') : null,
  }
}

function parseRequiredNumber(rawValue: string) {
  const parsed = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseOptionalNumber(rawValue: string) {
  if (!rawValue || rawValue.toLowerCase().includes('não informado')) return 0
  const parsed = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function getMatriculasFriendlyErrorMessage(error: unknown, action: 'save' | 'publish') {
  const fallbackMessage =
    action === 'save'
      ? 'Não foi possível salvar a importação agora. Verifique os dados e tente novamente.'
      : 'Não foi possível publicar os dados agora. Tente novamente em instantes.'

  if (!error || typeof error !== 'object') return fallbackMessage

  const errorCode = 'code' in error && typeof error.code === 'string' ? error.code : ''
  const errorMessage = 'message' in error && typeof error.message === 'string' ? error.message : ''
  const normalizedMessage = errorMessage.toLowerCase()
  const isPermissionError =
    errorCode === '42501' ||
    normalizedMessage.includes('permission denied') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('insufficient_privilege')

  if (isPermissionError) {
    return 'Você não tem permissão para salvar ou publicar esta importação. Verifique se seu usuário possui perfil de administrador.'
  }

  return fallbackMessage
}

function getFutureImportHint(indicatorTitle: string) {
  if (indicatorTitle === 'EJA') {
    return 'Futuramente será possível importar planilhas de matrículas da EJA.'
  }

  if (indicatorTitle === 'Transporte Escolar') {
    return 'Futuramente será possível importar relatórios de alunos que utilizam transporte escolar.'
  }

  const normalizedTitle = indicatorTitle.toLowerCase()
  if (normalizedTitle.includes('aee') || normalizedTitle.includes('educação especial') || normalizedTitle.includes('educacao especial')) {
    return 'Futuramente será possível importar dados de AEE e Educação Especial.'
  }

  return ''
}

function buildManualEvolucaoRowsFromLinhas(linhas: MatriculasPublicadaComLinhas['linhas']) {
  const map = new Map<string, { id: string; ano: string; urbana: string; rural: string; educacaoEspecial: string }>()

  for (const linha of linhas) {
    if (linha.tipo_registro !== 'evolucao_localizacao' && linha.tipo_registro !== 'evolucao_educacao_especial') continue
    const ano = String(linha.ano)
    const current = map.get(ano) ?? { id: crypto.randomUUID(), ano, urbana: '0', rural: '0', educacaoEspecial: '0' }
    if (linha.tipo_registro === 'evolucao_localizacao') {
      const loc = (linha.localizacao ?? '').toLowerCase()
      if (loc === 'urbana') current.urbana = String(linha.quantidade)
      if (loc === 'rural') current.rural = String(linha.quantidade)
    } else {
      current.educacaoEspecial = String(linha.quantidade)
    }
    map.set(ano, current)
  }

  return [...map.values()].sort((a, b) => Number(a.ano) - Number(b.ano))
}

function sortManualEvolucaoRows(rows: Array<{ id: string; ano: string; urbana: string; rural: string; educacaoEspecial: string }>) {
  return [...rows].sort((a, b) => {
    const anoA = Number.parseInt(a.ano, 10)
    const anoB = Number.parseInt(b.ano, 10)
    const aValido = Number.isFinite(anoA)
    const bValido = Number.isFinite(anoB)
    if (aValido && bValido) return anoA - anoB
    if (aValido) return -1
    if (bValido) return 1
    return 0
  })
}

function parseAndValidateManualEvolucao(
  rows: Array<{ ano: string; urbana: string; rural: string; educacaoEspecial: string }>,
): { ok: true; value: MatriculasEvolucaoManualRowInput[] } | { ok: false; message: string } {
  if (rows.length === 0) {
    return { ok: false, message: 'Adicione ao menos um ano para salvar a evolução anual.' }
  }

  const seenAnos = new Set<number>()
  const parsed: MatriculasEvolucaoManualRowInput[] = []

  for (const row of rows) {
    const ano = Number.parseInt(row.ano, 10)
    const urbana = Number.parseInt(row.urbana, 10)
    const rural = Number.parseInt(row.rural, 10)
    const educacaoEspecial = Number.parseInt(row.educacaoEspecial, 10)

    if (!Number.isFinite(ano) || ano <= 0) {
      return { ok: false, message: 'Ano obrigatório e deve ser um número válido.' }
    }
    if (seenAnos.has(ano)) {
      return { ok: false, message: 'Já existe um registro para este ano.' }
    }
    if (!Number.isFinite(urbana) || urbana < 0) {
      return { ok: false, message: 'Urbana deve ser um número maior ou igual a 0.' }
    }
    if (!Number.isFinite(rural) || rural < 0) {
      return { ok: false, message: 'Rural deve ser um número maior ou igual a 0.' }
    }
    if (!Number.isFinite(educacaoEspecial) || educacaoEspecial < 0) {
      return { ok: false, message: 'Educação Especial deve ser um número maior ou igual a 0.' }
    }

    seenAnos.add(ano)
    parsed.push({ ano, urbana, rural, educacaoEspecial })
  }

  return { ok: true, value: parsed.sort((a, b) => a.ano - b.ano) }
}

function parseAndValidateEjaRows(
  rows: Array<{ ano: string; urbana: string; rural: string }>,
): { ok: true; value: EjaEvolucaoManualRowInput[] } | { ok: false; message: string } {
  if (rows.length === 0) return { ok: false, message: 'Adicione ao menos um ano para salvar a EJA.' }
  const seen = new Set<number>()
  const parsed: EjaEvolucaoManualRowInput[] = []
  for (const row of rows) {
    const ano = Number.parseInt(row.ano, 10)
    const urbana = Number.parseInt(row.urbana, 10)
    const rural = Number.parseInt(row.rural, 10)
    if (!Number.isFinite(ano) || ano <= 0) return { ok: false, message: 'Ano obrigatório.' }
    if (seen.has(ano)) return { ok: false, message: 'Não permitir ano duplicado.' }
    if (!Number.isFinite(urbana) || urbana < 0) return { ok: false, message: 'Urbana deve ser maior ou igual a 0.' }
    if (!Number.isFinite(rural) || rural < 0) return { ok: false, message: 'Rural deve ser maior ou igual a 0.' }
    seen.add(ano)
    parsed.push({ ano, urbana, rural })
  }
  return { ok: true, value: parsed.sort((a, b) => a.ano - b.ano) }
}
