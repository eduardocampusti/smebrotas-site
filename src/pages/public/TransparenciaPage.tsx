import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BarChart3,
  ChevronRight,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Gavel,
  Handshake,
  Landmark,
  Users,
  Wallet,
  X,
} from 'lucide-react'

import { supabase } from '@/config/supabase'
import type {
  ArquivoTransparencia,
  CategoriaTransparencia,
  DadoGrafico,
  IndicadorTransparencia,
  SiteConfig,
} from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const SEARCH_SUGGESTIONS = [
  'IDEB',
  'Cardápio',
  'Matrícula',
  'FUNDEB',
  'Licitações',
  'Atos Oficiais',
]

const ANO_SELECT_OPTIONS = [
  'Todos os Anos',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
] as const

const IDEB_ANOS_INICIAIS_DATA = [
  { ano: '2019', valor: 5.4 },
  { ano: '2021', valor: 5.8 },
  { ano: '2023', valor: 6.2 },
]

const MATRICULA_DEFAULT_BARS = [
  { label: '2021', valor: 92 },
  { label: '2022', valor: 94 },
  { label: '2023', valor: 96 },
]

const INVESTIMENTO_SEGMENTS = [
  { label: 'Fundeb', pct: 65, color: '#0B4F8A' },
  { label: 'Próprios', pct: 25, color: '#10B981' },
  { label: 'Outros', pct: 10, color: '#F59E0B' },
] as const

const INVESTIMENTO_PROGRESS_CLASS: Record<string, string> = {
  Fundeb: '[&_[data-slot=progress-indicator]]:!bg-[#0B4F8A]',
  Próprios: '[&_[data-slot=progress-indicator]]:!bg-[#10B981]',
  Outros: '[&_[data-slot=progress-indicator]]:!bg-[#F59E0B]',
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function isIdebAnosIniciais(titulo: string) {
  const t = norm(titulo)
  return t.includes('ideb') && t.includes('anos iniciais')
}

function isTaxaMatriculaInfantil(titulo: string) {
  const t = norm(titulo)
  return t.includes('infantil') && t.includes('matricula')
}

function isInvestimentoPorAluno(titulo: string) {
  const t = norm(titulo)
  return t.includes('investimento') && (t.includes('aluno') || t.includes('aluno/ano'))
}

function parseDadoValor(d: DadoGrafico): number {
  const raw = d.valor ?? (d as { y?: number | string }).y ?? 0
  return typeof raw === 'number' ? raw : parseFloat(String(raw)) || 0
}

function dadoLabel(d: DadoGrafico): string {
  return d.label || String((d as { x?: string }).x ?? '')
}

type ChartTooltipProps = {
  active?: boolean
  payload?: { value?: number; name?: string; dataKey?: string }[]
  label?: string
}

function ChartTooltipShadcn({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const v = row.value
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="font-semibold tabular-nums">
        {typeof v === 'number' && !Number.isNaN(v)
          ? row.dataKey === 'valor' && String(label).length <= 4
            ? v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
            : v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
          : v}
      </p>
    </div>
  )
}

function MatriculaTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  const n = typeof v === 'number' ? v : Number(v)
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="font-semibold tabular-nums">
        {Number.isFinite(n)
          ? `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
          : v}
      </p>
    </div>
  )
}

function getCategoriaDocStyle(nome: string) {
  const n = norm(nome)
  if (n.includes('planos municipais') || (n.includes('plano') && n.includes('municipal')))
    return {
      iconWrap: 'bg-[#DBEAFE]',
      iconClass: 'text-blue-600',
      Icon: FileText,
    }
  if (
    n.includes('execucao orcamentaria') ||
    (n.includes('execucao') && n.includes('orcament'))
  )
    return {
      iconWrap: 'bg-[#D1FAE5]',
      iconClass: 'text-emerald-600',
      Icon: Wallet,
    }
  if (
    n.includes('contratos e licitacoes') ||
    n.includes('contrato') ||
    n.includes('licit')
  )
    return {
      iconWrap: 'bg-[#FEF3C7]',
      iconClass: 'text-amber-600',
      Icon: Handshake,
    }
  if (n.includes('conselhos municipais') || n.includes('conselho'))
    return {
      iconWrap: 'bg-[#EDE9FE]',
      iconClass: 'text-violet-600',
      Icon: Users,
    }
  if (n.includes('atos oficiais') || (n.includes('ato') && n.includes('oficial')))
    return {
      iconWrap: 'bg-[#FEE2E2]',
      iconClass: 'text-red-600',
      Icon: Gavel,
    }
  return {
    iconWrap: 'bg-primary/10',
    iconClass: 'text-primary',
    Icon: Landmark,
  }
}

function getTipoAtoFromTitulo(titulo: string) {
  const t = titulo.trim()
  const lower = norm(t)
  if (lower.startsWith('portaria') || lower.includes(' portaria'))
    return {
      key: 'portaria' as const,
      label: 'Portaria',
      className: 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
    }
  if (lower.startsWith('resolucao') || lower.includes(' resolucao'))
    return {
      key: 'resolucao' as const,
      label: 'Resolução',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    }
  if (lower.startsWith('edital'))
    return {
      key: 'edital' as const,
      label: 'Edital',
      className:
        'border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
    }
  if (lower.startsWith('decreto'))
    return {
      key: 'decreto' as const,
      label: 'Decreto',
      className:
        'border-violet-200 bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
    }
  return {
    key: 'outro' as const,
    label: 'Documento',
    className: 'border-border bg-muted text-muted-foreground',
  }
}

export default function TransparenciaPage() {
  const [indicadores, setIndicadores] = useState<IndicadorTransparencia[]>([])
  const [arquivos, setArquivos] = useState<ArquivoTransparencia[]>([])
  const [categorias, setCategorias] = useState<CategoriaTransparencia[]>([])
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [anoFiltro, setAnoFiltro] = useState<string>('Todos os Anos')
  const [atosPage, setAtosPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [indRes, arqRes, catRes, configRes] = await Promise.all([
        supabase
          .from('transparencia_indicadores')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true }),
        supabase
          .from('transparencia_arquivos')
          .select('*')
          .eq('ativo', true)
          .order('data_publicacao', { ascending: false }),
        supabase
          .from('transparencia_categorias')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true }),
        supabase.from('site_config').select('*').single(),
      ])

      if (indRes.error) throw indRes.error
      if (arqRes.error) throw arqRes.error
      if (catRes.error) throw catRes.error

      setIndicadores(indRes.data || [])
      setArquivos(arqRes.data || [])
      setCategorias(catRes.data || [])
      setSiteConfig(configRes.data)
    } catch (error) {
      console.error('Erro ao buscar dados da transparência:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchData()
    }, 0)
    return () => window.clearTimeout(t)
  }, [fetchData])

  useEffect(() => {
    if (siteConfig?.transparencia_config?.titulo_pagina) {
      document.title = `${siteConfig.transparencia_config.titulo_pagina} | SME Brotas`
    } else {
      document.title = 'Transparência e Indicadores | SME Brotas'
    }
  }, [siteConfig])

  const updateSearchTerm = useCallback((value: string) => {
    setSearchTerm(value)
    setAtosPage(1)
  }, [])

  const buildCsvContent = () => {
    if (indicadores.length === 0) return ''
    const headers = ['Título', 'Valor', 'Unidade', 'Ano', 'Meta', 'Variação']
    const rows = indicadores.map((i) => [
      i.titulo,
      i.valor,
      i.unidade || '',
      i.ano_referencia.toString(),
      i.meta || '',
      i.variacao || '',
    ])
    return [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n')
  }

  const handleExportCsv = () => {
    const csvContent = buildCsvContent()
    if (!csvContent) return
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `indicadores_sme_brotas_${new Date().getFullYear()}.csv`,
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    const csvContent = buildCsvContent()
    if (!csvContent) return
    const blob = new Blob([`\ufeff${csvContent}`], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `indicadores_sme_brotas_${new Date().getFullYear()}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportPdf = () => {
    if (indicadores.length === 0) return
    const rows = indicadores
      .map(
        (i) =>
          `<tr><td>${escapeHtml(i.titulo)}</td><td>${escapeHtml(i.valor)}</td><td>${escapeHtml(i.unidade || '')}</td><td>${i.ano_referencia}</td></tr>`,
      )
      .join('')
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Indicadores SME Brotas</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} th{background:#f4f4f5;}</style></head><body>
      <h1>Indicadores — SME Brotas</h1>
      <table><thead><tr><th>Título</th><th>Valor</th><th>Unidade</th><th>Ano</th></tr></thead><tbody>${rows}</tbody></table>
      <script>window.onload=function(){window.print();}</script>
      </body></html>`)
    w.document.close()
  }

  const config = siteConfig?.transparencia_config

  const atosOficiaisFiltrados = useMemo(
    () =>
      arquivos.filter(
        (a) =>
          a.categoria ===
            (config?.atos_oficiais_categoria_slug || 'ato_oficial') &&
          (a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.descricao?.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [arquivos, config?.atos_oficiais_categoria_slug, searchTerm],
  )

  const pageSize = config?.atos_oficiais_limite || 10
  const totalAtosPages = Math.max(
    1,
    Math.ceil(atosOficiaisFiltrados.length / pageSize),
  )

  const atosPageSafe = Math.min(atosPage, totalAtosPages)
  const atosOficiaisPagina = atosOficiaisFiltrados.slice(
    (atosPageSafe - 1) * pageSize,
    atosPageSafe * pageSize,
  )

  const getArquivosPorCategoria = (categoria: string) => {
    return arquivos.filter((a) => a.categoria === categoria)
  }

  const filteredSuggestions = SEARCH_SUGGESTIONS.filter(
    (s) =>
      !searchTerm ||
      s.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchTerm.toLowerCase().includes(s.toLowerCase()),
  )

  const openDadosAbertos = () => {
    if (config?.dados_abertos_url) {
      window.open(config.dados_abertos_url, '_blank')
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-6 border-b border-slate-100 py-8 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-[300px] flex-1 flex-col gap-2">
            <h1 className="text-4xl leading-tight font-black tracking-[-0.033em] text-slate-900 dark:text-white">
              {config?.titulo_pagina || 'Transparência e Indicadores'}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed font-normal text-slate-600 dark:text-slate-400">
              {config?.descricao_pagina ||
                'Acompanhe os dados educacionais, indicadores de qualidade e a execução orçamentária da rede municipal de ensino.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {config?.dados_abertos_url ? (
              <Button
                className="rounded-xl px-5 py-2.5 shadow-md shadow-primary/20"
                onClick={openDadosAbertos}
              >
                <ExternalLink data-icon="inline-start" />
                Portal de Dados Abertos
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button className="rounded-xl px-5 py-2.5 shadow-md shadow-primary/20">
                    <Download data-icon="inline-start" />
                    Exportar Indicadores
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  <DropdownMenuItem onClick={handleExportCsv}>
                    <Download />
                    Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf}>
                    <FileText />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet />
                    Exportar Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="relative max-w-2xl">
          <Command
            shouldFilter={false}
            className="overflow-visible rounded-2xl border-2 border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="relative pr-10">
              <CommandInput
                placeholder="O que você está procurando? (Ex: Atos, IDEB, Cardápio...)"
                value={searchTerm}
                onValueChange={updateSearchTerm}
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => updateSearchTerm('')}
                  className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar busca"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
            {filteredSuggestions.length > 0 ? (
              <CommandList className="max-h-48 border-t border-border">
                <CommandGroup heading="Sugestões">
                  {filteredSuggestions.map((s) => (
                    <CommandItem
                      key={s}
                      value={s}
                      onSelect={() => updateSearchTerm(s)}
                    >
                      {s}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandEmpty>Nenhuma sugestão para este termo.</CommandEmpty>
              </CommandList>
            ) : null}
          </Command>
        </div>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[22px] leading-tight font-bold tracking-[-0.015em]">
            {config?.indicadores_titulo || 'Indicadores Educacionais'}
          </h2>
          <Select
            value={anoFiltro}
            onValueChange={(v) => setAnoFiltro(v ?? 'Todos os Anos')}
          >
            <SelectTrigger className="min-w-[160px] border-slate-200 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANO_SELECT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {searchTerm ? (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Mostrando resultados para{' '}
              <span className="text-primary font-bold italic">
                &quot;{searchTerm}&quot;
              </span>{' '}
              em toda a Transparência
            </p>
          </div>
        ) : null}

        {loading ? (
          <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-lg bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const filtered = indicadores.filter((i) => {
                const matchesAno =
                  anoFiltro === 'Todos os Anos' ||
                  i.ano_referencia === parseInt(anoFiltro, 10)
                const matchesSearch =
                  !searchTerm ||
                  i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  i.valor.toLowerCase().includes(searchTerm.toLowerCase())
                return matchesAno && matchesSearch
              })

              if (filtered.length === 0 && !loading) {
                return (
                  <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center dark:border-slate-800 dark:bg-slate-800/20">
                    <BarChart3 className="mx-auto mb-2 size-12 text-slate-300 dark:text-slate-700" />
                    <p className="text-slate-500">
                      Nenhum indicador encontrado para os critérios selecionados.
                    </p>
                  </div>
                )
              }

              return filtered.map((indicador) => (
                <IndicadorCard key={indicador.id} indicador={indicador} />
              ))
            })()}
          </div>
        )}
      </section>

      <section className="mb-10" id="documentos-relatorios">
        <h2 className="mb-4 text-[22px] leading-tight font-bold tracking-[-0.015em]">
          {config?.documentos_titulo || 'Documentos e Relatórios'}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categorias
            .filter((cat) => {
              if (!searchTerm) return true
              const catMatches = cat.nome
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
              const filesMatch = getArquivosPorCategoria(cat.slug).some(
                (a) =>
                  a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.descricao
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()),
              )
              return catMatches || filesMatch
            })
            .map((cat) => (
              <CategoryCard
                key={`${cat.id}-${searchTerm ? 'q' : ''}`}
                titulo={cat.nome}
                descricao={cat.descricao || ''}
                icone={cat.icone}
                arquivos={getArquivosPorCategoria(cat.slug).filter(
                  (a) =>
                    !searchTerm ||
                    a.titulo
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    a.numero
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    a.descricao
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                )}
                autoOpen={!!searchTerm}
              />
            ))}
        </div>
      </section>

      <section className="mb-10" id="atos-oficiais">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[22px] leading-tight font-bold tracking-[-0.015em]">
            {config?.atos_oficiais_titulo || 'Atos Oficiais Recentes'}
          </h2>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                <TableHead className="px-6 py-3">Tipo / Número</TableHead>
                <TableHead className="px-6 py-3">Data</TableHead>
                <TableHead className="px-6 py-3">Assunto</TableHead>
                <TableHead className="px-6 py-3 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atosOficiaisPagina.length > 0 ? (
                atosOficiaisPagina.map((ato) => {
                  const tipo = getTipoAtoFromTitulo(ato.titulo)
                  return (
                    <TableRow
                      key={ato.id}
                      className="border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn('shrink-0', tipo.className)}
                          >
                            {tipo.label}
                          </Badge>
                          <span className="font-medium whitespace-nowrap">
                            {ato.titulo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-normal">
                        {new Date(ato.data_publicacao).toLocaleDateString(
                          'pt-BR',
                        )}
                      </TableCell>
                      <TableCell className="max-w-md px-6 py-4 whitespace-normal">
                        <span className="line-clamp-2">{ato.descricao}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <a
                              href={ato.arquivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <Download />
                          Baixar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Nenhum ato oficial encontrado para os termos buscados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {atosOficiaisFiltrados.length > pageSize ? (
            <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
              <Pagination className="mx-auto w-full max-w-lg justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      text="Anterior"
                      className={cn(
                        atosPageSafe <= 1 && 'pointer-events-none opacity-40',
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        setAtosPage((p) => Math.max(1, p - 1))
                      }}
                    />
                  </PaginationItem>
                  {buildPaginationItems(atosPageSafe, totalAtosPages, setAtosPage)}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      text="Próxima"
                      className={cn(
                        atosPageSafe >= totalAtosPages &&
                          'pointer-events-none opacity-40',
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        setAtosPage((p) => Math.min(totalAtosPages, p + 1))
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}

          <div className="flex justify-center border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800/30">
            <Link
              className="text-primary text-sm font-medium hover:text-blue-700"
              to={`/transparencia/atos-oficiais${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ''}`}
            >
              Ver todos os atos oficiais
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPaginationItems(
  current: number,
  total: number,
  setPage: (n: number) => void,
) {
  const items: ReactNode[] = []
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  const end = Math.min(total, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)

  if (start > 1) {
    items.push(
      <PaginationItem key={1}>
        <PaginationPageButton page={1} active={current === 1} setPage={setPage} />
      </PaginationItem>,
    )
    if (start > 2) {
      items.push(
        <PaginationItem key="e1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }
  }

  for (let p = start; p <= end; p++) {
    items.push(
      <PaginationItem key={p}>
        <PaginationPageButton page={p} active={current === p} setPage={setPage} />
      </PaginationItem>,
    )
  }

  if (end < total) {
    if (end < total - 1) {
      items.push(
        <PaginationItem key="e2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }
    items.push(
      <PaginationItem key={total}>
        <PaginationPageButton
          page={total}
          active={current === total}
          setPage={setPage}
        />
      </PaginationItem>,
    )
  }

  return items
}

function PaginationPageButton({
  page,
  active,
  setPage,
}: {
  page: number
  active: boolean
  setPage: (n: number) => void
}) {
  return (
    <Button
      variant={active ? 'outline' : 'ghost'}
      size="icon"
      nativeButton={false}
      className="size-8"
      render={
        <a
          href="#"
          aria-current={active ? 'page' : undefined}
          onClick={(e) => {
            e.preventDefault()
            setPage(page)
          }}
        />
      }
    >
      {page}
    </Button>
  )
}

function IndicadorCard({ indicador }: { indicador: IndicadorTransparencia }) {
  const showIdeb = isIdebAnosIniciais(indicador.titulo)
  const showMatricula = isTaxaMatriculaInfantil(indicador.titulo)
  const showInvest = isInvestimentoPorAluno(indicador.titulo)

  const barData = useMemo(() => {
    if (!indicador.dados_grafico?.length) return MATRICULA_DEFAULT_BARS
    return indicador.dados_grafico.map((d) => ({
      label: dadoLabel(d),
      valor: parseDadoValor(d),
    }))
  }, [indicador.dados_grafico])

  const lineDataGeneric = useMemo(() => {
    if (!indicador.dados_grafico?.length) return []
    return indicador.dados_grafico.map((d) => ({
      label: dadoLabel(d),
      valor: parseDadoValor(d),
    }))
  }, [indicador.dados_grafico])

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-base leading-normal font-medium">{indicador.titulo}</p>
        <span className="material-symbols-outlined text-primary shrink-0">
          {indicador.icone || 'monitoring'}
        </span>
      </div>
      <p className="text-[32px] leading-tight font-bold tracking-tight truncate">
        {indicador.unidade === 'R$'
          ? `R$ ${indicador.valor}`
          : `${indicador.valor}${indicador.unidade || ''}`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {indicador.meta ? (
          <p className="text-sm leading-normal font-normal text-slate-500 dark:text-slate-400">
            Meta: {indicador.meta}
          </p>
        ) : null}
        {showIdeb ? (
          <Badge className="border-emerald-200 bg-emerald-600 text-white dark:bg-emerald-700">
            +0.4 pts
          </Badge>
        ) : indicador.variacao ? (
          <p
            className={cn(
              'ml-1 flex items-center text-sm leading-normal font-medium',
              indicador.variacao.startsWith('+')
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400',
            )}
          >
            <span className="material-symbols-outlined text-base">
              {indicador.variacao.startsWith('+')
                ? 'arrow_upward'
                : 'arrow_downward'}
            </span>
            {indicador.variacao}
            {indicador.unidade === '%' ? '' : ' pts'}
          </p>
        ) : null}
      </div>

      <div className="relative mt-4 flex min-h-[140px] flex-1 flex-col gap-4">
        {showIdeb ? (
          <div className="h-[160px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={IDEB_ANOS_INICIAIS_DATA}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="idebLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1A7FBF" />
                    <stop offset="100%" stopColor="#0B4F8A" />
                  </linearGradient>
                  <linearGradient id="idebAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B4F8A" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0B4F8A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                  vertical={false}
                />
                <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} width={28} tick={{ fontSize: 11 }} />
                <RechartsTooltip content={<ChartTooltipShadcn />} />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="none"
                  fill="url(#idebAreaGrad)"
                  isAnimationActive
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="url(#idebLineGrad)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0B4F8A' }}
                  activeDot={{ r: 5 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {!showIdeb &&
        indicador.tipo_grafico === 'linha' &&
        lineDataGeneric.length > 0 ? (
          <div className="h-[160px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineDataGeneric} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`lineGrad-${indicador.id}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1A7FBF" />
                    <stop offset="100%" stopColor="#0B4F8A" />
                  </linearGradient>
                  <linearGradient id={`areaGrad-${indicador.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B4F8A" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0B4F8A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis width={28} tick={{ fontSize: 11 }} />
                <RechartsTooltip content={<ChartTooltipShadcn />} />
                <Area type="monotone" dataKey="valor" stroke="none" fill={`url(#areaGrad-${indicador.id})`} />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke={`url(#lineGrad-${indicador.id})`}
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0B4F8A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {showMatricula ? (
          <div className="h-[160px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradMat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A7FBF" />
                    <stop offset="100%" stopColor="#0B4F8A" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} width={32} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip content={<MatriculaTooltip />} />
                <Bar
                  dataKey="valor"
                  fill="url(#barGradMat)"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {!showMatricula &&
        indicador.tipo_grafico === 'barra' &&
        indicador.dados_grafico &&
        indicador.dados_grafico.length > 0 ? (
          <div className="h-[160px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={indicador.dados_grafico.map((d) => ({
                  label: dadoLabel(d),
                  valor: parseDadoValor(d),
                }))}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`barGrad-${indicador.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A7FBF" />
                    <stop offset="100%" stopColor="#0B4F8A" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis width={32} tick={{ fontSize: 11 }} />
                <RechartsTooltip content={<ChartTooltipShadcn />} />
                <Bar
                  dataKey="valor"
                  fill={`url(#barGrad-${indicador.id})`}
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {showInvest ? (
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-wrap gap-4 text-xs">
              {INVESTIMENTO_SEGMENTS.map((seg) => (
                <span key={seg.label} className="inline-flex items-center gap-1.5 font-medium">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: seg.color }}
                    aria-hidden
                  />
                  {seg.label} ({seg.pct}%)
                </span>
              ))}
            </div>
            {INVESTIMENTO_SEGMENTS.map((seg) => (
              <div key={seg.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{seg.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {seg.pct}%
                  </span>
                </div>
                <Progress
                  value={seg.pct}
                  className={cn(
                    'w-full gap-0 [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-indicator]]:rounded-full',
                    INVESTIMENTO_PROGRESS_CLASS[seg.label] ?? '',
                  )}
                />
              </div>
            ))}
          </div>
        ) : null}

        {!showInvest &&
        indicador.tipo_grafico === 'pizza' &&
        indicador.dados_grafico &&
        indicador.dados_grafico.length > 0 ? (
          <div className="flex flex-col justify-center gap-3">
            {indicador.dados_grafico.map((d, idx) => {
              const valor = parseDadoValor(d)
              const barTone = [
                '[&_[data-slot=progress-indicator]]:!bg-[#0B4F8A]',
                '[&_[data-slot=progress-indicator]]:!bg-[#10B981]',
                '[&_[data-slot=progress-indicator]]:!bg-[#F59E0B]',
              ][idx % 3]
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{dadoLabel(d)}</span>
                    <span className="font-medium tabular-nums">{valor}%</span>
                  </div>
                  <Progress
                    value={valor}
                    className={cn(
                      'w-full gap-0 [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-indicator]]:rounded-full',
                      barTone,
                    )}
                  />
                </div>
              )
            })}
            <div className="mt-1 flex flex-wrap gap-3 text-[11px]">
              {indicador.dados_grafico.map((d, idx) => {
                const colors = ['#0B4F8A', '#10B981', '#F59E0B']
                return (
                  <span key={idx} className="inline-flex items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    {dadoLabel(d)}
                  </span>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>

      {indicador.arquivos && indicador.arquivos.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Documentos Relacionados
          </p>
          <div className="flex flex-col gap-2">
            {indicador.arquivos.map((arq, idx) => (
              <a
                key={idx}
                href={arq.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2 transition-colors hover:border-primary/30 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <span className="truncate pr-2 text-xs font-medium">
                  {arq.titulo}
                </span>
                <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-primary">
                  download
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CategoryCard({
  titulo,
  descricao,
  icone: _icone,
  arquivos,
  autoOpen = false,
}: {
  titulo: string
  descricao: string
  icone: string
  arquivos: ArquivoTransparencia[]
  autoOpen?: boolean
}) {
  void _icone
  const [isOpen, setIsOpen] = useState(autoOpen)
  const style = getCategoriaDocStyle(titulo)
  const LucideIcon = style.Icon

  return (
    <div className="flex flex-col gap-2">
      <Card
        className={cn(
          'cursor-pointer py-0 transition-all duration-200',
          'hover:-translate-y-[2px] hover:shadow-md',
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-4 p-5 text-left outline-none"
        >
          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors',
              style.iconWrap,
              isOpen && 'ring-2 ring-primary/30',
            )}
          >
            <LucideIcon className={cn('size-6', style.iconClass)} strokeWidth={2} />
          </div>
          <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start gap-0.5">
            <CardTitle className="text-base">{titulo}</CardTitle>
            <CardDescription>{descricao}</CardDescription>
          </div>
          <span className="material-symbols-outlined shrink-0 text-slate-400 transition-transform">
            {isOpen ? 'expand_more' : 'chevron_right'}
          </span>
        </button>
      </Card>

      {isOpen ? (
        <Card className="animate-in slide-in-from-top-2 border-slate-100 py-0 duration-200 dark:border-slate-800">
          <CardContent className="flex flex-col gap-2 p-3">
            {arquivos.length > 0 ? (
              arquivos.map((arq) => (
                <a
                  key={arq.id}
                  href={arq.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded border border-slate-100 bg-card p-3 transition-colors hover:border-primary/30 dark:border-slate-800"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{arq.titulo}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(arq.data_publicacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </a>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-slate-500">
                Nenhum documento disponível nesta categoria.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
