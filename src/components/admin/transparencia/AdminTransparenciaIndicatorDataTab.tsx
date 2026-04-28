import type { AdminDashboardIndicator, IndicatorDataBlock } from './types'
import { IndicatorSelector } from './IndicatorSelector'
import { IndicatorDataEditor } from './IndicatorDataEditor'

interface AdminTransparenciaIndicatorDataTabProps {
  indicators: AdminDashboardIndicator[]
  selectedIndicatorId: string
  onSelectIndicator: (id: string) => void
  indicatorDataMap: Record<string, IndicatorDataBlock>
  onUpdateData: (id: string, next: IndicatorDataBlock) => void
}

export function AdminTransparenciaIndicatorDataTab({
  indicators,
  selectedIndicatorId,
  onSelectIndicator,
  indicatorDataMap,
  onUpdateData,
}: AdminTransparenciaIndicatorDataTabProps) {
  const selectedIndicator = indicators.find((item) => item.id === selectedIndicatorId) || indicators[0]
  const selectedData = indicatorDataMap[selectedIndicator?.id]

  if (!selectedIndicator || !selectedData) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">Dados dos Indicadores</h3>
        <p className="text-sm text-slate-600 mt-1">
          Gerencie KPIs, gráficos, tabelas e textos de cada indicador.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-700">
        Dados demonstrativos nesta fase. A gravação no banco será ativada na próxima etapa.
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <IndicatorSelector indicators={indicators} selectedId={selectedIndicator.id} onChange={onSelectIndicator} />
        </div>
        <div className="lg:col-span-2 rounded-xl border border-slate-200 p-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-700">{selectedIndicator.icone}</span>
            <h3 className="text-lg font-black text-slate-900">{selectedIndicator.titulo}</h3>
          </div>
          <p className="text-sm text-slate-600 mt-2">{selectedIndicator.descricao}</p>
          <div className="mt-3 text-xs text-slate-500">
            Blocos esperados para edição: KPIs, gráficos, tabelas e textos de apoio.
          </div>
        </div>
      </div>

      <IndicatorDataEditor data={selectedData} onChange={(next) => onUpdateData(selectedIndicator.id, next)} />
    </div>
  )
}
