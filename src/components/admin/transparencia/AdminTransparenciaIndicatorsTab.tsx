import { useMemo, useState } from 'react'
import type { AdminDashboardIndicator } from './types'
import { IndicatorCardSettingsForm } from './IndicatorCardSettingsForm'

interface AdminTransparenciaIndicatorsTabProps {
  indicators: AdminDashboardIndicator[]
  onChange: (next: AdminDashboardIndicator[]) => void
}

export function AdminTransparenciaIndicatorsTab({ indicators, onChange }: AdminTransparenciaIndicatorsTabProps) {
  const [editing, setEditing] = useState<AdminDashboardIndicator | null>(null)

  const orderedIndicators = useMemo(
    () => [...indicators].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR')),
    [indicators],
  )

  const handleToggle = (id: string) => {
    onChange(indicators.map((item) => (item.id === id ? { ...item, ativo: !item.ativo } : item)))
  }

  const handleSaveEdit = (updated: AdminDashboardIndicator) => {
    onChange(indicators.map((item) => (item.id === updated.id ? updated : item)))
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">Indicadores</h3>
        <p className="text-sm text-slate-600 mt-1">
          Edite os cards que aparecem no Painel de Indicadores da página pública.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800">
        Edição visual em estado local nesta fase. Integração com banco será ativada em fase posterior.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orderedIndicators.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined">{item.icone}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${item.ativo ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                {item.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{item.titulo}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.descricao}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Badge:</span>
                <span className="px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">{item.badge}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Ordem visual: {item.ordem}</p>
            </div>
            <div className="flex items-center gap-2.5 mt-auto pt-1">
              <button
                onClick={() => setEditing(item)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
              >
                Editar card
              </button>
              <button
                onClick={() => handleToggle(item.id)}
                className="flex-1 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800"
              >
                {item.ativo ? 'Ocultar do site' : 'Mostrar no site'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <IndicatorCardSettingsForm
        open={!!editing}
        indicator={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
