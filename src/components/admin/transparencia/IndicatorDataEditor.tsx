import type { ReactNode } from 'react'
import type { IndicatorDataBlock } from './types'

interface IndicatorDataEditorProps {
  data: IndicatorDataBlock
  onChange: (next: IndicatorDataBlock) => void
}

export function IndicatorDataEditor({ data, onChange }: IndicatorDataEditorProps) {
  return (
    <div className="flex flex-col gap-6">
      <Section
        title="KPIs"
        buttonLabel="Adicionar KPI"
        onAdd={() =>
          onChange({
            ...data,
            kpis: [...data.kpis, { id: crypto.randomUUID(), label: 'Novo KPI', valor: '0' }],
          })
        }
      >
        {data.kpis.length === 0 ? (
          <EmptyState
            icon="monitoring"
            text="Nenhum KPI cadastrado para este indicador."
            actionLabel="Adicionar primeiro KPI"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.kpis.map((kpi) => (
              <div key={kpi.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <input
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm mb-2"
                  value={kpi.label}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      kpis: data.kpis.map((item) => (item.id === kpi.id ? { ...item, label: e.target.value } : item)),
                    })
                  }
                />
                <input
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
                  value={kpi.valor}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      kpis: data.kpis.map((item) => (item.id === kpi.id ? { ...item, valor: e.target.value } : item)),
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Gráficos"
        buttonLabel="Adicionar dado do gráfico"
        onAdd={() =>
          onChange({
            ...data,
            graficos: [...data.graficos, { id: crypto.randomUUID(), eixo: 'Novo eixo', valor: '0' }],
          })
        }
      >
        {data.graficos.length === 0 ? (
          <EmptyState
            icon="show_chart"
            text="Nenhum dado de gráfico para este indicador."
            actionLabel="Adicionar primeiro dado"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.graficos.map((point) => (
              <div key={point.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50 grid grid-cols-2 gap-2">
                <input
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
                  value={point.eixo}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      graficos: data.graficos.map((item) => (item.id === point.id ? { ...item, eixo: e.target.value } : item)),
                    })
                  }
                />
                <input
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
                  value={point.valor}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      graficos: data.graficos.map((item) => (item.id === point.id ? { ...item, valor: e.target.value } : item)),
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Tabelas e Textos de apoio"
        buttonLabel="Adicionar linha"
        onAdd={() =>
          onChange({
            ...data,
            tabelasTextos: [
              ...data.tabelasTextos,
              { id: crypto.randomUUID(), colunaA: 'Novo item', colunaB: 'Novo valor', observacao: '' },
            ],
          })
        }
      >
        <div className="flex flex-col gap-4">
          {data.tabelasTextos.length === 0 ? (
            <EmptyState
              icon="table"
              text="Nenhuma linha de tabela cadastrada para este indicador."
              actionLabel="Adicionar primeira linha"
            />
          ) : (
            data.tabelasTextos.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
                  value={row.colunaA}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      tabelasTextos: data.tabelasTextos.map((item) => (item.id === row.id ? { ...item, colunaA: e.target.value } : item)),
                    })
                  }
                />
                <input
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
                  value={row.colunaB}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      tabelasTextos: data.tabelasTextos.map((item) => (item.id === row.id ? { ...item, colunaB: e.target.value } : item)),
                    })
                  }
                />
                <input
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
                  value={row.observacao || ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      tabelasTextos: data.tabelasTextos.map((item) => (item.id === row.id ? { ...item, observacao: e.target.value } : item)),
                    })
                  }
                />
              </div>
            ))
          )}
          <textarea
            className="p-4 rounded-xl border border-slate-200 min-h-24"
            value={data.textoApoio}
            onChange={(e) => onChange({ ...data, textoApoio: e.target.value })}
            placeholder="Texto de apoio do indicador"
          />
        </div>
      </Section>
    </div>
  )
}

function EmptyState({ icon, text, actionLabel }: { icon: string; text: string; actionLabel: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 flex flex-col items-start gap-3">
      <span className="material-symbols-outlined text-slate-400">{icon}</span>
      <p className="text-sm text-slate-600">{text}</p>
      <button
        type="button"
        disabled
        className="h-9 px-4 rounded-lg border border-slate-300 text-slate-500 text-xs font-bold bg-white cursor-not-allowed"
      >
        {actionLabel}
      </button>
    </div>
  )
}

function Section({
  title,
  buttonLabel,
  onAdd,
  children,
}: {
  title: string
  buttonLabel: string
  onAdd: () => void
  children: ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-black text-slate-900">{title}</h4>
        <button onClick={onAdd} className="h-9 px-4 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
          {buttonLabel}
        </button>
      </div>
      {children}
    </div>
  )
}
