import { cn } from '@/lib/utils'

import type { TransparenciaTabConfig, TransparenciaTabId } from './types'

type TransparenciaDashboardNavProps = {
  indicators: TransparenciaTabConfig[]
  activeIndicator: TransparenciaTabId
  onSelect: (value: TransparenciaTabId) => void
}

export function TransparenciaDashboardNav({
  indicators,
  activeIndicator,
  onSelect,
}: TransparenciaDashboardNavProps) {
  return (
    <section>
      <p className="text-sm text-slate-500 mb-3">
        Selecione um indicador para visualizar os dados:
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {indicators.map((indicator) => {
          const isActive = indicator.id === activeIndicator

          return (
            <button
              key={indicator.id}
              type="button"
              onClick={() => onSelect(indicator.id)}
              className={cn(
                'flex items-center gap-2 py-1.5 px-4 rounded-full border transition-all duration-150 text-sm font-medium',
                isActive
                  ? 'bg-[#185FA5] text-white border-[#185FA5]'
                  : 'bg-white text-slate-500 border-slate-300 hover:border-[#185FA5] hover:text-[#185FA5] hover:bg-blue-50',
              )}
              aria-pressed={isActive}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              {indicator.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
