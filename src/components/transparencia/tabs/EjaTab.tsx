import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransparenciaKpiCard } from '../TransparenciaKpiCard'
import { TransparenciaTabSkeleton } from '../TransparenciaTabSkeleton'
import { getPublicadaMaisRecenteEja } from '@/services/transparencia/ejaImportacaoService'
import { mapEjaImportacaoToPublicTab, type EjaTabPublicData } from '@/services/transparencia/transparenciaMapper'

const CORES = {
  urbana: '#2563eb',
  rural: '#16a34a',
  total: '#f59e0b',
}

type TooltipPayloadItem = {
  name?: string
  value?: number | string
  color?: string
}

type EjaEvolucaoTooltipProps = {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
}

function EjaEvolucaoTooltip({ active, payload, label }: EjaEvolucaoTooltipProps) {
  if (!active || !payload?.length) return null

  const urbana = payload.find((item) => item.name === 'Urbana')
  const rural = payload.find((item) => item.name === 'Rural')
  const total = payload.find((item) => item.name === 'Total')

  const itens = [
    { label: 'Urbana', value: urbana?.value ?? 0, color: CORES.urbana },
    { label: 'Rural', value: rural?.value ?? 0, color: CORES.rural },
    { label: 'Total', value: total?.value ?? 0, color: CORES.total },
  ]

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-slate-900">Ano: {label}</p>
      <div className="space-y-1">
        {itens.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-slate-700">
            <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
            <span>
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const EJA_TAB_MOCK: EjaTabPublicData = {
  mostrarAvisoDemonstrativo: true,
  cardsPrincipais: [
    { label: 'Total EJA', value: '145' },
    { label: 'Urbana', value: '86' },
    { label: 'Rural', value: '59' },
    { label: 'Ano de referência', value: '2025' },
  ],
  localizacao: [
    { name: 'Urbana', value: 86 },
    { name: 'Rural', value: 59 },
  ],
  evolucaoAnual: [
    { ano: '2010', urbana: 104, rural: 39, total: 143 },
    { ano: '2020', urbana: 103, rural: 0, total: 103 },
    { ano: '2023', urbana: 128, rural: 0, total: 128 },
    { ano: '2024', urbana: 116, rural: 0, total: 116 },
    { ano: '2025', urbana: 86, rural: 59, total: 145 },
  ],
  rodape: {
    fonte: 'QEdu/Censo Escolar Inep — Escolas públicas de Brotas de Macaúbas',
    anoReferencia: '2025',
    dataAtualizacao: '—',
    statusLabel: 'Demonstrativo',
  },
}

export function EjaTab() {
  const [data, setData] = useState<EjaTabPublicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const publicada = await getPublicadaMaisRecenteEja()
      if (!publicada) setData(EJA_TAB_MOCK)
      else setData(mapEjaImportacaoToPublicTab(publicada.importacao, publicada.linhas))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar os dados da EJA.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const evolucaoOrdenada = useMemo(
    () => [...(data?.evolucaoAnual ?? [])].sort((a, b) => Number(a.ano) - Number(b.ano)),
    [data],
  )

  if (loading) return <TransparenciaTabSkeleton />
  if (error) {
    return (
      <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <p>{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
          Tentar novamente
        </Button>
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="space-y-5">
      {data.mostrarAvisoDemonstrativo ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Dados demonstrativos. Nenhuma publicação da EJA encontrada.
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.cardsPrincipais.map((item) => (
          <TransparenciaKpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            borderTopClass={
              item.label === 'Urbana' ? 'border-t-blue-600' : item.label === 'Rural' ? 'border-t-green-600' : 'border-t-amber-500'
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border border-slate-200 py-0 xl:col-span-1">
          <CardHeader>
            <CardTitle>EJA por localização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.localizacao} dataKey="value" nameKey="name" outerRadius={90} label>
                    {data.localizacao.map((entry) => (
                      <Cell key={entry.name} fill={entry.name === 'Urbana' ? CORES.urbana : CORES.rural} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
              {data.localizacao.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: item.name === 'Urbana' ? CORES.urbana : CORES.rural }}
                    aria-hidden
                  />
                  <span>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 py-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Evolução anual da EJA por localização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evolucaoOrdenada}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="ano" />
                  <YAxis />
                  <Tooltip content={<EjaEvolucaoTooltip />} />
                  <Bar dataKey="urbana" name="Urbana" fill={CORES.urbana} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rural" name="Rural" fill={CORES.rural} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" name="Total" fill={CORES.total} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: CORES.urbana }} aria-hidden />
                <span>Urbana</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: CORES.rural }} aria-hidden />
                <span>Rural</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: CORES.total }} aria-hidden />
                <span>Total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="border-t border-slate-200 pt-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">Fonte dos dados</p>
        <dl className="mt-2 grid gap-1 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Fonte</dt>
            <dd>{data.rodape.fonte}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Ano de referência</dt>
            <dd>{data.rodape.anoReferencia}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Data de atualização</dt>
            <dd>{data.rodape.dataAtualizacao}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd>{data.rodape.statusLabel}</dd>
          </div>
        </dl>
      </footer>
    </div>
  )
}
