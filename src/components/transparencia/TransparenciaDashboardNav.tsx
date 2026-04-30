import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { TransparenciaTabConfig, TransparenciaTabId } from './types'

const iconClassesByTab = {
  agricultura: 'bg-emerald-100 [&_svg]:text-emerald-700',
  alimentacao: 'bg-amber-100 [&_svg]:text-amber-700',
  cardapio: 'bg-pink-100 [&_svg]:text-pink-700',
  eja: 'bg-violet-100 [&_svg]:text-violet-700',
  ensino: 'bg-blue-100 [&_svg]:text-blue-700',
  fundeb: 'bg-yellow-100 [&_svg]:text-yellow-700',
  ideb: 'bg-teal-100 [&_svg]:text-teal-700',
  licitacoes: 'bg-slate-100 [&_svg]:text-slate-600',
  matriculas: 'bg-blue-100 [&_svg]:text-blue-700',
  transporte: 'bg-purple-100 [&_svg]:text-purple-700',
} as const

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
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Painel de Indicadores</h2>
        <p className="text-sm text-slate-600">
          Selecione um indicador para visualizar gráficos, números principais e dados detalhados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {indicators.map((indicator) => {
          const isActive = indicator.id === activeIndicator
          const Icon = indicator.icon

          return (
            <button
              key={indicator.id}
              type="button"
              onClick={() => onSelect(indicator.id)}
              className={cn(
                'w-full min-h-[100px] cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 text-left text-slate-700 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl',
                isActive && 'border-2 border-blue-700 bg-blue-50 shadow-xl',
                !isActive && 'border-slate-200',
              )}
              aria-pressed={isActive}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                    iconClassesByTab[indicator.id],
                  )}
                >
                  <Icon className="size-4" />
                </div>

                {isActive ? (
                  <Badge className="h-5 bg-[#0B4F8A] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-[#0B4F8A]">
                    Selecionado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="h-5 border-slate-200 px-2 py-0.5 text-[10px] text-slate-500">
                    {indicator.supportText ?? 'Indicador'}
                  </Badge>
                )}
              </div>

              <h3 className="text-sm font-semibold text-slate-900">{indicator.label}</h3>
              <p className="mt-1 line-clamp-1 text-xs text-slate-400">{indicator.description}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
