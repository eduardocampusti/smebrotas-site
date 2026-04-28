import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AdminDashboardIndicator } from './types'

interface IndicatorCardSettingsFormProps {
  indicator: AdminDashboardIndicator | null
  open: boolean
  onClose: () => void
  onSave: (indicator: AdminDashboardIndicator) => void
}

export function IndicatorCardSettingsForm({ indicator, open, onClose, onSave }: IndicatorCardSettingsFormProps) {
  const [formData, setFormData] = useState<AdminDashboardIndicator | null>(indicator)

  useEffect(() => {
    setFormData(indicator)
  }, [indicator])

  if (!open || !formData) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">Editar cartão do indicador</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Título">
            <input
              className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
          </Field>
          <Field label="Badge">
            <input
              className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            />
          </Field>
          <Field label="Ícone (Material Symbols)">
            <input
              className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]"
              value={formData.icone}
              onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
            />
          </Field>
          <Field label="Ordem">
            <input
              type="number"
              className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]"
              value={formData.ordem}
              onChange={(e) => setFormData({ ...formData, ordem: Number(e.target.value) || 0 })}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Descrição">
              <textarea
                className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)] min-h-24"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </Field>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200">
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
          >
            Salvar edição visual
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}
