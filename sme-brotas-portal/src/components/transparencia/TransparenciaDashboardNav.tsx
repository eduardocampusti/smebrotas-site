import { Badge } from '@/components/ui/badge'
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
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Painel de Indicadores</h2>
        <p className="text-sm text-slate-600">
          Selecione um indicador para visualizar graficos, KPIs e dados detalhados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {indicators.map((indicator) => {
          const isActive = indicator.id === activeIndicator
          const Icon = indicator.icon

          return (
            <button
              key={indicator.id}
              type="button"
              onClick={() => onSelect(indicator.id)}
              className={cn(
                'w-full rounded-2xl border bg-white p-4 text-left text-slate-700 shadow-sm transition-all duration-200',
                'cursor-pointer hover:border-[#0B4F8A] hover:bg-[#F8FBFF] hover:shadow-md',
                isActive && 'border-[#0B4F8A] bg-[#EFF6FF] shadow-md',
                !isActive && 'border-slate-200',
              )}
              aria-pressed={isActive}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors',
                    isActive && 'bg-blue-100 text-[#0B4F8A]',
                  )}
                >
                  <Icon className="size-5" />
                </div>

                {isActive ? (
                  <Badge className="bg-[#0B4F8A] text-white hover:bg-[#0B4F8A]">Selecionado</Badge>
                ) : (
                  <Badge variant="outline" className="border-slate-200 text-slate-500">
                    {indicator.supportText ?? 'Indicador'}
                  </Badge>
                )}
              </div>

              <h3 className="text-base font-semibold text-slate-900">{indicator.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{indicator.description}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
