import type { AdminDashboardIndicator } from './types'

interface AdminTransparenciaOverviewTabProps {
  indicators: AdminDashboardIndicator[]
  documentosCount: number
  ultimaAtualizacao: string
}

export function AdminTransparenciaOverviewTab({
  indicators,
  documentosCount,
  ultimaAtualizacao,
}: AdminTransparenciaOverviewTabProps) {
  const ativos = indicators.filter((item) => item.ativo).length
  const ocultos = indicators.length - ativos

  const cards = [
    { label: 'Total de indicadores', value: indicators.length, icon: 'dashboard' },
    { label: 'Indicadores ativos', value: ativos, icon: 'visibility' },
    { label: 'Indicadores ocultos', value: ocultos, icon: 'visibility_off' },
    { label: 'Documentos complementares', value: documentosCount, icon: 'folder' },
  ]

  const status = ativos === indicators.length ? 'Página pronta para publicação' : 'Página com itens ocultos'

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">Visão Geral</h3>
        <p className="text-sm text-slate-600 mt-1">
          Acompanhe o status geral dos indicadores exibidos na página pública.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="size-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Última atualização (simulada)</p>
          <p className="text-lg font-bold text-slate-900">{ultimaAtualizacao}</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200">
          Status geral: {status}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-4">Indicadores da dashboard pública</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {indicators.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-600">{item.icone}</span>
                <div>
                  <p className="font-semibold text-slate-900">{item.titulo}</p>
                  <p className="text-xs text-slate-500">{item.badge}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${item.ativo ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                {item.ativo ? 'Ativo' : 'Oculto'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
