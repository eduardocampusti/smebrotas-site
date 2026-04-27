import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Newspaper,
  Search,
  Star,
  Trophy,
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import type { Noticia } from '@/types'
import { CATEGORIAS_NOTICIAS, getCategoriaLabel } from '@/constants/noticias'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const CATEGORIAS_SIDEBAR = [
  { id: 'todas', label: 'Todas as Notícias', icon: 'newspaper' },
  ...CATEGORIAS_NOTICIAS,
] as const

const ITEMS_PER_PAGE = 9

type OrdemNoticias = 'recentes' | 'antigas' | 'lidas'

function escapeIlikePattern(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

function getCategoriaBadgeClass(categoria: string): string {
  switch (categoria) {
    case 'premiacao':
      return 'border-transparent bg-yellow-100 text-yellow-800'
    case 'capacitacao':
      return 'border-transparent bg-blue-100 text-blue-800'
    case 'infraestrutura':
      return 'border-transparent bg-slate-100 text-slate-800'
    case 'comunicados':
      return 'border-transparent bg-red-100 text-red-800'
    case 'eventos':
      return 'border-transparent bg-green-100 text-green-800'
    case 'acoes':
      return 'border-transparent bg-indigo-100 text-indigo-800'
    case 'programas':
      return 'border-transparent bg-violet-100 text-violet-800'
    case 'geral':
    default:
      return 'border-transparent bg-slate-100 text-slate-700'
  }
}

function getCategoriaImageGradient(categoria: string): string {
  switch (categoria) {
    case 'premiacao':
      return 'bg-gradient-to-br from-yellow-400 to-orange-500'
    case 'capacitacao':
      return 'bg-gradient-to-br from-blue-500 to-blue-700'
    case 'infraestrutura':
      return 'bg-gradient-to-br from-slate-500 to-slate-700'
    case 'eventos':
      return 'bg-gradient-to-br from-green-500 to-teal-600'
    case 'geral':
      return 'bg-gradient-to-br from-[#0B2545] to-[#0B4F8A]'
    case 'comunicados':
      return 'bg-gradient-to-br from-red-600 to-rose-700'
    case 'acoes':
      return 'bg-gradient-to-br from-indigo-600 to-blue-800'
    case 'programas':
      return 'bg-gradient-to-br from-violet-600 to-purple-800'
    default:
      return 'bg-gradient-to-br from-[#0B2545] to-[#1A7FBF]'
  }
}

function FallbackIcon({ categoria }: { categoria: string }) {
  const common = 'size-10 text-white drop-shadow-md'
  if (categoria === 'premiacao') return <Trophy className={common} strokeWidth={1.5} aria-hidden />
  if (categoria === 'capacitacao')
    return <GraduationCap className={common} strokeWidth={1.5} aria-hidden />
  return <Newspaper className={common} strokeWidth={1.5} aria-hidden />
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | 'ellipsis')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('ellipsis')
    out.push(p)
    prev = p
  }
  return out
}

function NoticiaGridCard({ noticia }: { noticia: Noticia }) {
  const [imgFailed, setImgFailed] = useState(false)
  const hasImage = Boolean(noticia.imagem_url?.trim()) && !imgFailed

  return (
    <Link
      to={`/noticias/${noticia.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white',
        'shadow-md transition-all duration-300 ease-in-out',
        'hover:-translate-y-1 hover:border-[#0B4F8A]/20 hover:shadow-xl',
        'dark:border-slate-800 dark:bg-slate-900'
      )}
    >
      <div className="relative h-44 w-full shrink-0 overflow-hidden">
        {hasImage ? (
          <img
            src={noticia.imagem_url!}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center',
              getCategoriaImageGradient(noticia.categoria)
            )}
          >
            <FallbackIcon categoria={noticia.categoria} />
          </div>
        )}
        <Badge
          className={cn(
            'absolute top-3 left-3 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            getCategoriaBadgeClass(noticia.categoria)
          )}
        >
          {getCategoriaLabel(noticia.categoria)}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="size-3.5 shrink-0" aria-hidden />
          <span>
            {new Date(noticia.data_publicacao || noticia.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <h3
          className={cn(
            'line-clamp-2 text-base leading-snug font-bold text-[#0B2545] transition-colors',
            'group-hover:text-[#0B4F8A] dark:text-white dark:group-hover:text-blue-300'
          )}
        >
          {noticia.titulo}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{noticia.resumo}</p>
        <span className="mt-auto inline-flex items-center text-sm font-semibold text-[#0B4F8A] transition-transform group-hover:translate-x-1">
          Ler mais →
        </span>
      </div>
    </Link>
  )
}

export default function NoticiasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaAtiva = searchParams.get('categoria') || 'todas'
  const paginaAtiva = parseInt(searchParams.get('page') || '1', 10)
  const ordem = (searchParams.get('ordem') as OrdemNoticias) || 'recentes'

  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [categoriaCounts, setCategoriaCounts] = useState<Record<string, number>>({})
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const prevDebouncedSearch = useRef<string | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    if (prevDebouncedSearch.current === null) {
      prevDebouncedSearch.current = debouncedSearch
      return
    }
    if (prevDebouncedSearch.current !== debouncedSearch) {
      prevDebouncedSearch.current = debouncedSearch
      if (paginaAtiva !== 1) {
        setSearchParams((prev) => {
          const n = new URLSearchParams(prev)
          n.set('page', '1')
          return n
        })
      }
    }
  }, [debouncedSearch, paginaAtiva, setSearchParams])

  useEffect(() => {
    let cancelled = false
    async function loadCounts() {
      const entries: Record<string, number> = {}
      const { count: todas } = await supabase
        .from('noticias')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'publicado')
      if (cancelled) return
      entries.todas = todas ?? 0
      await Promise.all(
        CATEGORIAS_NOTICIAS.map(async (cat) => {
          const { count } = await supabase
            .from('noticias')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'publicado')
            .eq('categoria', cat.id)
          entries[cat.id] = count ?? 0
        })
      )
      if (!cancelled) setCategoriaCounts(entries)
    }
    loadCounts()
    return () => {
      cancelled = true
    }
  }, [])

  const patchSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const n = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(updates)) {
          if (v === undefined || v === '') n.delete(k)
          else n.set(k, v)
        }
        return n
      })
    },
    [setSearchParams]
  )

  useEffect(() => {
    async function fetchNoticias() {
      setLoading(true)
      const from = (paginaAtiva - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('noticias')
        .select('*', { count: 'exact' })
        .eq('status', 'publicado')
        .range(from, to)

      if (categoriaAtiva !== 'todas') {
        query = query.eq('categoria', categoriaAtiva)
      }

      if (debouncedSearch) {
        const safe = escapeIlikePattern(debouncedSearch)
        query = query.or(`titulo.ilike.%${safe}%,resumo.ilike.%${safe}%`)
      }

      if (ordem === 'antigas') {
        query = query
          .order('data_publicacao', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true })
      } else if (ordem === 'lidas') {
        query = query
          .order('destaque', { ascending: false })
          .order('data_publicacao', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
      } else {
        query = query
          .order('data_publicacao', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
      }

      const { data, count } = await query
      if (data) setNoticias(data as Noticia[])
      if (count !== null) setTotalCount(count)
      setLoading(false)
    }

    fetchNoticias()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [categoriaAtiva, paginaAtiva, debouncedSearch, ordem])

  const noticiaDestaque =
    paginaAtiva === 1 && !debouncedSearch
      ? noticias.find((n) => n.destaque) || noticias[0]
      : null

  const outrasNoticias = noticiaDestaque
    ? noticias.filter((n) => n.id !== noticiaDestaque.id)
    : noticias

  const handlePageChange = (newPage: number) => {
    patchSearchParams({ page: String(newPage) })
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const visiblePages = useMemo(() => getVisiblePages(paginaAtiva, totalPages), [paginaAtiva, totalPages])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const destaqueHref = noticiaDestaque ? `/noticias/${noticiaDestaque.slug}` : '#'
  const destaqueDataStr = noticiaDestaque
    ? new Date(noticiaDestaque.data_publicacao || noticiaDestaque.created_at).toLocaleDateString(
        'pt-BR',
        { day: '2-digit', month: 'long', year: 'numeric' }
      )
    : ''

  return (
    <>
      <div className="flex flex-col gap-8">
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-4xl leading-tight font-black tracking-[-0.033em]">
              Notícias e Comunicados Oficiais
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Fique por dentro das últimas novidades da Secretaria Municipal de Educação.
            </p>
          </div>

          {noticiaDestaque ? (
            <article
              className={cn(
                'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
                'transition-all duration-300 hover:brightness-110',
                'dark:border-slate-800 dark:bg-slate-900'
              )}
            >
              <HeroDestaque noticia={noticiaDestaque} dataStr={destaqueDataStr} href={destaqueHref} />
            </article>
          ) : (
            !noticias.length && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <span className="material-symbols-outlined mb-2 text-5xl text-slate-300">newspaper</span>
                <p className="text-slate-500">Nenhuma notícia encontrada nesta categoria.</p>
              </div>
            )
          )}
        </section>

        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-64">
            <Card className="sticky top-24 border border-slate-100 shadow-md dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Categorias</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col gap-0.5 pt-0">
                {CATEGORIAS_SIDEBAR.map((cat) => {
                  const count =
                    cat.id === 'todas'
                      ? categoriaCounts.todas ?? totalCount
                      : categoriaCounts[cat.id] ?? 0
                  const active = categoriaAtiva === cat.id
                  return (
                    <Button
                      key={cat.id}
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        patchSearchParams({ categoria: cat.id, page: '1' })
                      }
                      className={cn(
                        'h-auto w-full justify-start gap-2 rounded-md py-2.5 pr-2 pl-3 font-normal',
                        'hover:bg-slate-50 hover:text-[#0B2545] dark:hover:bg-slate-800',
                        active &&
                          'border-l-4 border-[#0B4F8A] bg-[#EFF6FF] font-semibold text-[#0B4F8A] hover:bg-[#EFF6FF] hover:text-[#0B4F8A]'
                      )}
                    >
                      <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                      <span className="flex-1 truncate text-left text-sm">{cat.label}</span>
                      <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px] font-medium">
                        {count}
                      </Badge>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </aside>

          <section className="flex flex-1 flex-col gap-6">
            <div className="relative w-full shadow-sm">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar notícias e comunicados..."
                className="h-10 w-full border-2 pl-9 shadow-sm focus-visible:border-[#0B4F8A] focus-visible:ring-[#0B4F8A]/25"
                aria-label="Buscar notícias e comunicados"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Mostrando {totalCount}{' '}
                {totalCount === 1 ? 'notícia' : 'notícias'}
              </p>
              <Select
                value={ordem}
                onValueChange={(v) => {
                  const next = (v ?? 'recentes') as OrdemNoticias
                  patchSearchParams({ ordem: next, page: '1' })
                }}
              >
                <SelectTrigger className="h-9 w-full border-slate-200 sm:w-[200px] dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recentes">Mais recentes</SelectItem>
                  <SelectItem value="antigas">Mais antigas</SelectItem>
                  <SelectItem value="lidas">Mais lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {outrasNoticias.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {outrasNoticias.map((noticia) => (
                  <NoticiaGridCard key={noticia.id} noticia={noticia} />
                ))}
              </div>
            ) : (
              !loading &&
              !noticiaDestaque && (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-20 text-center dark:border-slate-800 dark:bg-slate-900/50">
                  <span className="material-symbols-outlined mb-4 text-6xl text-slate-300">search_off</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Nenhuma notícia encontrada
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Não encontramos resultados para os filtros selecionados.
                  </p>
                </div>
              )
            )}

            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-8 dark:border-slate-800">
                <Pagination>
                  <PaginationContent className="flex flex-wrap items-center justify-center gap-1">
                    <PaginationItem>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={paginaAtiva === 1}
                        onClick={() => handlePageChange(paginaAtiva - 1)}
                      >
                        <ChevronLeft className="size-4" aria-hidden />
                        Anterior
                      </Button>
                    </PaginationItem>
                    {visiblePages.map((p, i) =>
                      p === 'ellipsis' ? (
                        <PaginationItem key={`e-${i}`}>
                          <span className="px-2 text-slate-400">…</span>
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <Button
                            type="button"
                            variant={paginaAtiva === p ? 'default' : 'ghost'}
                            size="icon"
                            className={cn('size-9', paginaAtiva === p && 'shadow-md')}
                            onClick={() => handlePageChange(p)}
                            aria-current={paginaAtiva === p ? 'page' : undefined}
                          >
                            {p}
                          </Button>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={paginaAtiva === totalPages}
                        onClick={() => handlePageChange(paginaAtiva + 1)}
                      >
                        Próxima
                        <ChevronRight className="size-4" aria-hidden />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <p className="text-sm text-slate-500">
                  Página {paginaAtiva} de {totalPages}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="mt-16 w-full bg-[#0B2545] py-14 text-center">
        <div className="mx-auto flex max-w-lg flex-col gap-4 px-4">
          <h2 className="text-xl font-bold text-white md:text-2xl">Receba as novidades da SME</h2>
          <p className="text-sm text-white/80 md:text-base">
            Comunicados oficiais direto no seu e-mail
          </p>
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <Input
              type="email"
              name="email"
              placeholder="Seu e-mail"
              className="h-10 border-0 bg-white/10 text-white placeholder:text-white/50 focus-visible:bg-white/15 focus-visible:ring-white/40"
              aria-label="E-mail para newsletter"
            />
            <Button type="submit" className="shrink-0 bg-[#1A7FBF] text-white hover:bg-[#156ba3]">
              Inscrever-se
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}

function HeroDestaque({
  noticia,
  dataStr,
  href,
}: {
  noticia: Noticia
  dataStr: string
  href: string
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const showPhoto = Boolean(noticia.imagem_url?.trim()) && !imgFailed

  return (
    <>
      <Link
        to={href}
        className="group/hero relative block aspect-[21/9] min-h-[200px] w-full overflow-hidden bg-gradient-to-br from-[#0B2545] to-[#1A7FBF]"
      >
        {showPhoto ? (
          <img
            src={noticia.imagem_url!}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover/hero:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : null}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.85)_50%,transparent_100%)]"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {noticia.destaque ? (
                <Badge className="gap-1 border-0 bg-[#0B4F8A] px-2.5 py-0.5 text-white hover:bg-[#0B4F8A]">
                  <Star className="size-3 shrink-0 text-white" aria-hidden />
                  DESTAQUE
                </Badge>
              ) : (
                <Badge className="border-0 bg-[#0B4F8A]/90 text-white">
                  {getCategoriaLabel(noticia.categoria)}
                </Badge>
              )}
              <span className="text-sm text-white/70">{dataStr}</span>
            </div>
            <h2 className="max-w-3xl text-2xl leading-tight font-bold text-white md:text-3xl">
              {noticia.titulo}
            </h2>
          </div>
        </div>
      </Link>
      <div className="border-t border-white/10 bg-gradient-to-t from-black/40 to-transparent px-6 py-4 md:px-8">
        <Button
          asChild
          variant="outline"
          className="border-white bg-white/5 text-white hover:bg-white/15 hover:text-white"
        >
          <Link to={href}>
            Ler matéria completa <span aria-hidden>→</span>
          </Link>
        </Button>
      </div>
    </>
  )
}
