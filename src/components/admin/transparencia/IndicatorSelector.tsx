import type { AdminDashboardIndicator } from './types'

interface IndicatorSelectorProps {
  indicators: AdminDashboardIndicator[]
  selectedId: string
  onChange: (id: string) => void
}

export function IndicatorSelector({ indicators, selectedId, onChange }: IndicatorSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selecionar indicador</label>
      <select
        className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-[var(--color-primary)]"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
      >
        {indicators.map((item) => (
          <option key={item.id} value={item.id}>
            {item.titulo}
          </option>
        ))}
      </select>
    </div>
  )
}
