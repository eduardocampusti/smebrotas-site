import type { ReactNode } from 'react'
import type {
  IndicatorDataBlock,
  MatriculasDataBlock,
  MatriculasEvolucaoManualItem,
  MatriculasSimpleItem,
} from './types'

interface MatriculasIndicatorDataEditorProps {
  data: IndicatorDataBlock
  onChange: (next: IndicatorDataBlock) => void
  autoFillHint?: string
  supportNotes?: string[]
  activeImportacaoId?: string | null
  activeImportacaoStatus?: 'rascunho' | 'publicado' | null
  onSaveManualEvolucao?: () => Promise<void> | void
  savingManualEvolucao?: boolean
  manualEvolucaoError?: string | null
}

const DEFAULT_MATRICULAS_DATA: MatriculasDataBlock = {
  resumo: [
    { id: crypto.randomUUID(), label: 'Total geral importado', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Total Infantil e Fundamental', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Total EJA', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Total AEE / Educação Especial', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Vagas disponíveis', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Taxa de ocupação', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Ano de referência', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Fonte dos dados', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Data de atualização', valor: 'Não informado' },
  ],
  etapas: [
    { id: crypto.randomUUID(), label: 'Creche', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Pré-escola', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Anos Iniciais', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Anos Finais', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'EJA', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Educação Especial', valor: 'Não informado' },
  ],
  evolucao: [{ id: crypto.randomUUID(), label: '2025', valor: 'Não informado' }],
  evolucaoManual: [],
  localizacao: [
    { id: crypto.randomUUID(), label: 'Urbana', valor: 'Não informado' },
    { id: crypto.randomUUID(), label: 'Rural', valor: 'Não informado' },
  ],
  fonte: {
    fonte: 'Não informado',
    anoReferencia: 'Não informado',
    dataAtualizacao: 'Não informado',
    link: '',
  },
}

function getMatriculasData(data: IndicatorDataBlock) {
  return data.matriculas ?? DEFAULT_MATRICULAS_DATA
}

export function MatriculasIndicatorDataEditor({
  data,
  onChange,
  autoFillHint,
  supportNotes = [],
  activeImportacaoId,
  activeImportacaoStatus,
  onSaveManualEvolucao,
  savingManualEvolucao = false,
  manualEvolucaoError = null,
}: MatriculasIndicatorDataEditorProps) {
  const matriculas = getMatriculasData(data)
  const evolucaoManualRows = matriculas.evolucaoManual ?? []

  function updateSection(section: keyof Omit<MatriculasDataBlock, 'fonte'>, next: MatriculasSimpleItem[]) {
    onChange({
      ...data,
      matriculas: {
        ...matriculas,
        [section]: next,
      },
    })
  }

  function updateFonteField(field: keyof MatriculasDataBlock['fonte'], value: string) {
    onChange({
      ...data,
      matriculas: {
        ...matriculas,
        fonte: {
          ...matriculas.fonte,
          [field]: value,
        },
      },
    })
  }

  function sortEvolucaoManualRows(rows: MatriculasEvolucaoManualItem[]) {
    return [...rows].sort((a, b) => {
      const anoA = Number.parseInt(a.ano.trim(), 10)
      const anoB = Number.parseInt(b.ano.trim(), 10)
      const aValido = Number.isFinite(anoA)
      const bValido = Number.isFinite(anoB)
      if (aValido && bValido) return anoA - anoB
      if (aValido) return -1
      if (bValido) return 1
      return 0
    })
  }

  function updateEvolucaoManual(next: MatriculasEvolucaoManualItem[], sortByAno = false) {
    onChange({
      ...data,
      matriculas: {
        ...matriculas,
        evolucaoManual: sortByAno ? sortEvolucaoManualRows(next) : next,
      },
    })
  }

  function addEvolucaoManualRow() {
    updateEvolucaoManual([
      ...evolucaoManualRows,
      { id: crypto.randomUUID(), ano: '', urbana: '0', rural: '0', educacaoEspecial: '0' },
    ])
  }

  function getDuplicateAnoMap(rows: MatriculasEvolucaoManualItem[]) {
    const counts = new Map<string, number>()
    for (const row of rows) {
      const key = row.ano.trim()
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  const duplicateAnoMap = getDuplicateAnoMap(evolucaoManualRows)

  return (
    <div className="flex flex-col gap-4">
      {autoFillHint && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
          {autoFillHint}
        </div>
      )}
      {supportNotes.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700">
          {supportNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      )}
      <SectionCard title="Resumo das Matrículas" actionLabel="Adicionar número/resumo" onAdd={() => updateSection('resumo', [...matriculas.resumo, { id: crypto.randomUUID(), label: 'Novo resumo', valor: 'Não informado' }])}>
        <SimpleRows
          rows={matriculas.resumo}
          leftPlaceholder="Nome do resumo"
          rightPlaceholder="Valor"
          onChange={(next) => updateSection('resumo', next)}
        />
      </SectionCard>

      <SectionCard title="Matrículas por etapa de ensino" actionLabel="Adicionar etapa" onAdd={() => updateSection('etapas', [...matriculas.etapas, { id: crypto.randomUUID(), label: 'Nova etapa', valor: 'Não informado' }])}>
        <SimpleRows
          rows={matriculas.etapas}
          leftPlaceholder="Etapa de ensino"
          rightPlaceholder="Quantidade de matrículas"
          onChange={(next) => updateSection('etapas', next)}
        />
      </SectionCard>

      <SectionCard title="Evolução por ano" actionLabel="Adicionar ano" onAdd={addEvolucaoManualRow}>
        <p className="mb-3 text-sm text-slate-600">
          Use esta área para informar manualmente a evolução anual das matrículas por localização. O total do
          ano será calculado automaticamente pela soma de Urbana e Rural.
        </p>
        {activeImportacaoStatus === 'publicado' ? (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Você está editando uma importação publicada. Após salvar, confira a página pública.
          </div>
        ) : null}
        {evolucaoManualRows.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum ano cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2 text-left">Ano</th>
                  <th className="px-2 py-2 text-left">Urbana</th>
                  <th className="px-2 py-2 text-left">Rural</th>
                  <th className="px-2 py-2 text-left">Educação Especial</th>
                  <th className="px-2 py-2 text-left">Total calculado</th>
                  <th className="px-2 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {evolucaoManualRows.map((row) => {
                  const urbana = Number.parseInt(row.urbana, 10)
                  const rural = Number.parseInt(row.rural, 10)
                  const totalCalculado = (Number.isFinite(urbana) ? urbana : 0) + (Number.isFinite(rural) ? rural : 0)
                  const isAnoDuplicado = row.ano.trim() !== '' && (duplicateAnoMap.get(row.ano.trim()) ?? 0) > 1
                  return (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="px-2 py-2 align-top">
                        <input
                          className="h-9 w-24 rounded-lg border border-slate-200 px-3 text-sm"
                          value={row.ano}
                          onChange={(e) =>
                            updateEvolucaoManual(
                              evolucaoManualRows.map((item) =>
                                item.id === row.id ? { ...item, ano: e.target.value } : item,
                              ),
                              true,
                            )
                          }
                          placeholder="2025"
                        />
                        {isAnoDuplicado ? <p className="mt-1 text-xs text-red-600">Já existe um registro para este ano.</p> : null}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <input
                          type="number"
                          min={0}
                          className="h-9 w-28 rounded-lg border border-slate-200 px-3 text-sm"
                          value={row.urbana}
                          onChange={(e) =>
                            updateEvolucaoManual(
                              evolucaoManualRows.map((item) =>
                                item.id === row.id ? { ...item, urbana: e.target.value } : item,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-2 align-top">
                        <input
                          type="number"
                          min={0}
                          className="h-9 w-28 rounded-lg border border-slate-200 px-3 text-sm"
                          value={row.rural}
                          onChange={(e) =>
                            updateEvolucaoManual(
                              evolucaoManualRows.map((item) =>
                                item.id === row.id ? { ...item, rural: e.target.value } : item,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-2 align-top">
                        <input
                          type="number"
                          min={0}
                          className="h-9 w-36 rounded-lg border border-slate-200 px-3 text-sm"
                          value={row.educacaoEspecial}
                          onChange={(e) =>
                            updateEvolucaoManual(
                              evolucaoManualRows.map((item) =>
                                item.id === row.id ? { ...item, educacaoEspecial: e.target.value } : item,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-2 align-middle font-semibold text-slate-800">{totalCalculado}</td>
                      <td className="px-2 py-2 align-top">
                        <button
                          type="button"
                          className="h-8 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                          onClick={() => updateEvolucaoManual(evolucaoManualRows.filter((item) => item.id !== row.id))}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {manualEvolucaoError ? <p className="mt-3 text-sm text-red-700">{manualEvolucaoError}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addEvolucaoManualRow}
            className="h-8 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
          >
            Adicionar ano
          </button>
          <button
            type="button"
            disabled={!activeImportacaoId || savingManualEvolucao}
            onClick={() => void onSaveManualEvolucao?.()}
            className="h-8 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-800 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingManualEvolucao ? 'Salvando...' : 'Salvar alterações manuais'}
          </button>
        </div>
        {!activeImportacaoId ? (
          <p className="mt-2 text-xs text-slate-500">
            Salve ou carregue uma importação para habilitar o salvamento da evolução manual no banco.
          </p>
        ) : null}
      </SectionCard>

      <SectionCard title="Distribuição por localização" actionLabel="Adicionar localização" onAdd={() => updateSection('localizacao', [...matriculas.localizacao, { id: crypto.randomUUID(), label: 'Nova localização', valor: 'Não informado' }])}>
        <SimpleRows
          rows={matriculas.localizacao}
          leftPlaceholder="Localização"
          rightPlaceholder="Quantidade de matrículas"
          onChange={(next) => updateSection('localizacao', next)}
        />
      </SectionCard>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h4 className="text-base font-black text-slate-900 mb-3">Fonte dos dados</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
            value={matriculas.fonte.fonte}
            onChange={(e) => updateFonteField('fonte', e.target.value)}
            placeholder="Fonte"
          />
          <input
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
            value={matriculas.fonte.anoReferencia}
            onChange={(e) => updateFonteField('anoReferencia', e.target.value)}
            placeholder="Ano de referência"
          />
          <input
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
            value={matriculas.fonte.dataAtualizacao}
            onChange={(e) => updateFonteField('dataAtualizacao', e.target.value)}
            placeholder="Data de atualização"
          />
          <input
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
            value={matriculas.fonte.link}
            onChange={(e) => updateFonteField('link', e.target.value)}
            placeholder="Link da fonte, se houver"
          />
        </div>
      </div>
    </div>
  )
}

function SimpleRows({
  rows,
  leftPlaceholder,
  rightPlaceholder,
  onChange,
}: {
  rows: MatriculasSimpleItem[]
  leftPlaceholder: string
  rightPlaceholder: string
  onChange: (next: MatriculasSimpleItem[]) => void
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma informação cadastrada ainda para este bloco.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {rows.map((item) => (
        <div key={item.id} className="rounded-lg border border-slate-200 p-3 bg-slate-50 grid grid-cols-1 gap-2">
          <input
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
            value={item.label}
            onChange={(e) => onChange(rows.map((row) => (row.id === item.id ? { ...row, label: e.target.value } : row)))}
            placeholder={leftPlaceholder}
          />
          <input
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
            value={item.valor}
            onChange={(e) => onChange(rows.map((row) => (row.id === item.id ? { ...row, valor: e.target.value } : row)))}
            placeholder={rightPlaceholder}
          />
        </div>
      ))}
    </div>
  )
}

function SectionCard({
  title,
  actionLabel,
  onAdd,
  children,
}: {
  title: string
  actionLabel: string
  onAdd: () => void
  children: ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-base font-black text-slate-900">{title}</h4>
        <button type="button" onClick={onAdd} className="h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
          {actionLabel}
        </button>
      </div>
      {children}
    </div>
  )
}
