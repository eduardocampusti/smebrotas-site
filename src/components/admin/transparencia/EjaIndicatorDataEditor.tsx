import type { IndicatorDataBlock } from './types'
import { Button } from '@/components/ui/button'

interface EjaIndicatorDataEditorProps {
  data: IndicatorDataBlock
  onChange: (next: IndicatorDataBlock) => void
  onSave: () => Promise<void> | void
  onPublish: () => Promise<void> | void
  saving: boolean
  publishing: boolean
  canPublish: boolean
  message: { tone: 'success' | 'error'; text: string } | null
}

export function EjaIndicatorDataEditor({
  data,
  onChange,
  onSave,
  onPublish,
  saving,
  publishing,
  canPublish,
  message,
}: EjaIndicatorDataEditorProps) {
  const eja = data.eja ?? {
    evolucaoManual: [],
    fonte: {
      fonte: 'QEdu/Censo Escolar Inep — Escolas públicas de Brotas de Macaúbas',
      anoReferencia: '',
      dataAtualizacao: '',
      link: '',
    },
  }

  const duplicateAno = new Set<string>()
  const seenAno = new Set<string>()
  for (const row of eja.evolucaoManual) {
    const key = row.ano.trim()
    if (!key) continue
    if (seenAno.has(key)) duplicateAno.add(key)
    seenAno.add(key)
  }

  function updateRows(
    next: Array<{ id: string; ano: string; urbana: string; rural: string }>,
    sortByAno = false,
  ) {
    const sorted = sortByAno
      ? [...next].sort((a, b) => {
          const anoA = Number.parseInt(a.ano, 10)
          const anoB = Number.parseInt(b.ano, 10)
          if (Number.isFinite(anoA) && Number.isFinite(anoB)) return anoA - anoB
          if (Number.isFinite(anoA)) return -1
          if (Number.isFinite(anoB)) return 1
          return 0
        })
      : next
    onChange({ ...data, eja: { ...eja, evolucaoManual: sorted } })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base font-black text-slate-900">EJA - Evolução anual</h4>
        <Button
          type="button"
          onClick={() =>
            updateRows([...eja.evolucaoManual, { id: crypto.randomUUID(), ano: '', urbana: '0', rural: '0' }])
          }
          size="sm"
        >
          Adicionar ano
        </Button>
      </div>

      {eja.evolucaoManual.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum ano cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2 text-left">Ano</th>
                <th className="px-2 py-2 text-left">Urbana</th>
                <th className="px-2 py-2 text-left">Rural</th>
                <th className="px-2 py-2 text-left">Total calculado</th>
                <th className="px-2 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {eja.evolucaoManual.map((row) => {
                const urbana = Number.parseInt(row.urbana, 10)
                const rural = Number.parseInt(row.rural, 10)
                const total = (Number.isFinite(urbana) ? urbana : 0) + (Number.isFinite(rural) ? rural : 0)
                const hasDuplicate = row.ano.trim() !== '' && duplicateAno.has(row.ano.trim())
                return (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-2 py-2">
                      <input
                        className="h-9 w-24 rounded-lg border border-slate-200 px-3 text-sm"
                        value={row.ano}
                        placeholder="2025"
                        onChange={(e) =>
                          updateRows(
                            eja.evolucaoManual.map((item) =>
                              item.id === row.id ? { ...item, ano: e.target.value } : item,
                            ),
                            true,
                          )
                        }
                      />
                      {hasDuplicate ? (
                        <p className="mt-1 text-xs text-red-600">Não permitir ano duplicado.</p>
                      ) : null}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        className="h-9 w-28 rounded-lg border border-slate-200 px-3 text-sm"
                        value={row.urbana}
                        onChange={(e) =>
                          updateRows(
                            eja.evolucaoManual.map((item) =>
                              item.id === row.id ? { ...item, urbana: e.target.value } : item,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        className="h-9 w-28 rounded-lg border border-slate-200 px-3 text-sm"
                        value={row.rural}
                        onChange={(e) =>
                          updateRows(
                            eja.evolucaoManual.map((item) =>
                              item.id === row.id ? { ...item, rural: e.target.value } : item,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-2 font-semibold text-slate-800">{total}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        className="h-8 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                        onClick={() => updateRows(eja.evolucaoManual.filter((item) => item.id !== row.id))}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
          value={eja.fonte.fonte}
          onChange={(e) => onChange({ ...data, eja: { ...eja, fonte: { ...eja.fonte, fonte: e.target.value } } })}
          placeholder="Fonte dos dados"
        />
        <input
          className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
          value={eja.fonte.anoReferencia}
          onChange={(e) =>
            onChange({ ...data, eja: { ...eja, fonte: { ...eja.fonte, anoReferencia: e.target.value } } })
          }
          placeholder="Ano de referência"
        />
        <input
          className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
          value={eja.fonte.dataAtualizacao}
          onChange={(e) =>
            onChange({ ...data, eja: { ...eja, fonte: { ...eja.fonte, dataAtualizacao: e.target.value } } })
          }
          placeholder="Data de atualização (AAAA-MM-DD)"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void onSave()} disabled={saving || publishing}>
          {saving ? 'Salvando...' : 'Salvar alterações da EJA'}
        </Button>
        <Button type="button" variant="outline" onClick={() => void onPublish()} disabled={!canPublish || saving || publishing}>
          {publishing ? 'Publicando...' : 'Publicar no site'}
        </Button>
      </div>

      {message ? (
        <p className={message.tone === 'success' ? 'text-sm text-emerald-700' : 'text-sm text-red-700'}>{message.text}</p>
      ) : null}
    </div>
  )
}
