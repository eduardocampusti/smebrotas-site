import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Heart, Sparkles, Users } from 'lucide-react'
import { supabase } from '../../config/supabase'
import type { Programa } from '../../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const TAB_ALL = '__all__'

const FILTER_INACTIVE =
  'rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:scale-105 hover:brightness-95 data-[active]:scale-100'

const FILTER_ACTIVE: Record<string, string> = {
  [TAB_ALL]: 'border-[#0B2545] bg-[#0B2545] text-white shadow-sm',
  alfabetizacao:
    'border-amber-300 bg-amber-100 text-amber-800 shadow-sm dark:bg-amber-100 dark:text-amber-900',
  cultura: 'border-pink-300 bg-pink-100 text-pink-800 shadow-sm dark:bg-pink-100',
  esporte: 'border-green-300 bg-green-100 text-green-800 shadow-sm dark:bg-green-100',
  inclusao:
    'border-purple-300 bg-purple-100 text-purple-800 shadow-sm dark:bg-purple-100',
  'meio-ambiente':
    'border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm dark:bg-emerald-100',
  tecnologia: 'border-blue-300 bg-blue-100 text-blue-800 shadow-sm dark:bg-blue-100',
  default: 'border-slate-400 bg-slate-200 text-slate-800 shadow-sm',
}

const CATEGORY_BADGE: Record<string, string> = {
  alfabetizacao: 'border-amber-300/80 bg-amber-100/90 text-amber-900 backdrop-blur-sm',
  cultura: 'border-pink-300/80 bg-pink-100/90 text-pink-900 backdrop-blur-sm',
  esporte: 'border-green-300/80 bg-green-100/90 text-green-900 backdrop-blur-sm',
  inclusao: 'border-purple-300/80 bg-purple-100/90 text-purple-900 backdrop-blur-sm',
  'meio-ambiente':
    'border-emerald-300/80 bg-emerald-100/90 text-emerald-900 backdrop-blur-sm',
  tecnologia: 'border-blue-300/80 bg-blue-100/90 text-blue-900 backdrop-blur-sm',
  default: 'border-white/50 bg-white/85 text-slate-900 backdrop-blur-sm',
}

function categoryThemeKey(label: string | null): keyof typeof CATEGORY_BADGE | 'default' {
  if (!label) return 'default'
  const L = label.toLowerCase()
  if (L.includes('alfabet')) return 'alfabetizacao'
  if (L.includes('cultura')) return 'cultura'
  if (L.includes('esporte')) return 'esporte'
  if (L.includes('inclus')) return 'inclusao'
  if (L.includes('meio') && L.includes('amb')) return 'meio-ambiente'
  if (L.includes('meio ambiente')) return 'meio-ambiente'
  if (L.includes('tecno')) return 'tecnologia'
  return 'default'
}

function filterActiveClass(cat: { id: string | null; label: string }): string {
  if (!cat.id) return FILTER_ACTIVE[TAB_ALL]
  const key = categoryThemeKey(cat.label)
  return FILTER_ACTIVE[key] ?? FILTER_ACTIVE.default
}

function isProgramaPrioritarioInclusao(p: Programa): boolean {
  const t = p.titulo.toLowerCase()
  const s = p.slug.toLowerCase()
  const c = (p.categoria || '').toLowerCase()
  return (
    s.includes('aee') ||
    t.includes('aee') ||
    (c.includes('inclus') && (t.includes('inclus') || t.includes('educa')))
  )
}

type StatusVisual = 'ativo' | 'em-breve' | 'encerrado'

function programaStatus(p: Programa): StatusVisual {
  if (p.desativado_em) return 'encerrado'
  const t = p.titulo.toLowerCase()
  if (t.includes('em breve') || t.includes('brevemente')) return 'em-breve'
  if (p.ativo) return 'ativo'
  return 'encerrado'
}

const STATUS_BADGE: Record<
  StatusVisual,
  { label: string; className: string }
> = {
  ativo: { label: 'Ativo', className: 'bg-green-500 text-white' },
  'em-breve': { label: 'Em breve', className: 'bg-yellow-500 text-white' },
  encerrado: { label: 'Encerrado', className: 'bg-slate-400 text-white' },
}

function ProgramaCard({
  programa,
  featured,
}: {
  programa: Programa
  featured?: boolean
}) {
  const img =
    programa.imagem_url ||
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop'
  const catKey = categoryThemeKey(programa.categoria)
  const status = programaStatus(programa)
  const statusCfg = STATUS_BADGE[status]
  const alunosLine =
    programa.publico_alvo?.trim() || 'Alunos da rede municipal'

  return (
    <Card
      className={cn(
        'group/card relative gap-0 overflow-hidden rounded-2xl border border-slate-100 bg-card p-0 py-0 shadow-md ring-0 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-slate-300/30 hover:shadow-2xl',
        featured &&
          'border-2 border-purple-300 bg-purple-50/30 shadow-lg shadow-purple-200/80 dark:bg-purple-950/20'
      )}
    >
      <Link
        to={`/programas/${programa.slug}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4F8A] focus-visible:ring-offset-2"
      >
        <div className="relative h-52 w-full shrink-0 overflow-hidden">
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition-all duration-300 ease-in-out group-hover/card:brightness-105"
          />
          <Badge
            variant="outline"
            className={cn(
              'absolute top-3 right-3 border px-2 py-0.5 text-xs font-bold capitalize',
              CATEGORY_BADGE[catKey] ?? CATEGORY_BADGE.default
            )}
          >
            {programa.categoria || 'Programa'}
          </Badge>
          {featured && (
            <Badge
              className="absolute top-12 right-3 gap-1 border-0 bg-purple-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm backdrop-blur-sm"
            >
              <Heart className="size-3.5 shrink-0" aria-hidden />
              Programa Prioritário
            </Badge>
          )}
          <span
            className={cn(
              'absolute top-3 left-3 rounded px-2 py-0.5 text-xs font-bold shadow-sm',
              statusCfg.className
            )}
          >
            {statusCfg.label}
          </span>
        </div>

        <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-4 pb-2">
          <CardTitle className="text-lg leading-tight font-bold text-[#0B2545]">
            {programa.titulo}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-sm text-slate-500">
            {programa.resumo}
          </CardDescription>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="size-3.5 shrink-0" aria-hidden />
            <span>{alunosLine}</span>
          </div>
        </CardContent>

        <CardFooter className="mt-auto border-0 bg-transparent px-4 pt-0 pb-4">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0B4F8A] transition-transform duration-200 group-hover/card:translate-x-1">
            Saiba mais
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </span>
        </CardFooter>
      </Link>
    </Card>
  )
}

export default function ProgramasPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const categoriaFilter = searchParams.get('categoria')

  const [programas, setProgramas] = useState<Programa[]>([])
  const [categorias, setCategorias] = useState<
    { id: string | null; label: string }[]
  >([{ id: null, label: 'Todos' }])
  const [loading, setLoading] = useState(true)
  const [totalAtivos, setTotalAtivos] = useState<number | null>(null)

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const { data, error } = await supabase
          .from('programas')
          .select('categoria')
          .eq('ativo', true)
          .not('categoria', 'is', null)

        if (error) throw error

        const uniqueCategories = Array.from(
          new Set(data.map((item) => item.categoria))
        )
          .filter(Boolean)
          .sort()
          .map((cat) => ({
            id: cat!.toLowerCase().replace(/\s+/g, '-'),
            label: cat!,
          }))

        setCategorias([{ id: null, label: 'Todos' }, ...uniqueCategories])
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }

    fetchCategorias()
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchTotal() {
      try {
        const { count, error } = await supabase
          .from('programas')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)
        if (error) throw error
        if (!cancelled) setTotalAtivos(count ?? 0)
      } catch (e) {
        console.error('Erro ao contar programas:', e)
        if (!cancelled) setTotalAtivos(null)
      }
    }
    fetchTotal()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    async function fetchProgramas() {
      try {
        setLoading(true)
        let query = supabase
          .from('programas')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true })

        if (categoriaFilter) {
          query = query.ilike('categoria', categoriaFilter)
        }

        const { data, error } = await query

        if (error) throw error
        setProgramas(data || [])
      } catch (error) {
        console.error('Erro ao buscar programas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgramas()
  }, [categoriaFilter])

  const tabValue = categoriaFilter ?? TAB_ALL

  const prioritario = useMemo(
    () => programas.find(isProgramaPrioritarioInclusao),
    [programas]
  )
  const demais = useMemo(
    () =>
      prioritario
        ? programas.filter((p) => p.id !== prioritario.id)
        : programas,
    [programas, prioritario]
  )

  const badgeTopo =
    categoriaFilter && totalAtivos != null
      ? `${programas.length} de ${totalAtivos} programa${totalAtivos === 1 ? '' : 's'} ativos`
      : categoriaFilter
        ? `${programas.length} programa${programas.length === 1 ? '' : 's'} encontrado${programas.length === 1 ? '' : 's'}`
        : totalAtivos != null
          ? `${totalAtivos} programa${totalAtivos === 1 ? '' : 's'} ativos`
          : 'Programas ativos'

  const handleTabChange = (value: string | number | null) => {
    const v = value == null ? TAB_ALL : String(value)
    if (v === TAB_ALL) {
      navigate('/programas')
      return
    }
    navigate(`/programas?categoria=${encodeURIComponent(v)}`)
  }

  return (
    <>
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-4">
          <Badge
            variant="outline"
            className="w-fit gap-1.5 border-transparent bg-[#D1FAE5] px-3 py-1 text-[#065F46] hover:bg-[#D1FAE5]"
          >
            <Sparkles className="size-3.5" aria-hidden />
            {badgeTopo}
          </Badge>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-[#0B2545]">
              Programas e Projetos Pedagógicos
            </h1>
            <p className="max-w-2xl text-lg text-slate-500">
              Conheça as iniciativas que transformam a educação em nossa rede
              municipal, promovendo aprendizado, inclusão e inovação.
            </p>
          </div>

          <Tabs
            value={tabValue}
            onValueChange={handleTabChange}
            className="w-full gap-3"
          >
            <TabsList
              variant="line"
              className="h-auto min-h-0 w-full flex-wrap justify-start gap-2 rounded-none border-0 bg-transparent p-0"
            >
              {categorias.map((cat) => {
                const value = cat.id ?? TAB_ALL
                const active = Boolean(
                  (!cat.id && !categoriaFilter) ||
                    (cat.id && categoriaFilter === cat.id)
                )
                const theme = active ? filterActiveClass(cat) : ''

                return (
                  <TabsTrigger
                    key={cat.label}
                    value={value}
                    className={cn(
                      FILTER_INACTIVE,
                      'rounded-full border border-transparent shadow-none after:hidden data-active:shadow-sm',
                      active && theme
                    )}
                  >
                    {cat.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
            {/* Painel oculto para leitores de tela / contrato dos Tabs */}
            <TabsContent value={tabValue} className="sr-only" tabIndex={-1}>
              Lista atualizada conforme o filtro selecionado.
            </TabsContent>
          </Tabs>
        </header>

        {loading ? (
          <div className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-0">
                <div className="h-52 w-full rounded-t-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-col gap-2 px-4 pb-4">
                  <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : programas.length > 0 ? (
          <div className="flex flex-col gap-8">
            {prioritario && (
              <section aria-label="Programa prioritário">
                <ProgramaCard programa={prioritario} featured />
              </section>
            )}

            {demais.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {demais.map((programa) => (
                  <ProgramaCard key={programa.id} programa={programa} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined mb-4 text-6xl text-slate-300 dark:text-slate-700">
              search_off
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Nenhum programa encontrado
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Tente ajustar sua busca ou filtro.
            </p>
          </div>
        )}
      </div>

      <section
        className="relative left-1/2 mt-16 w-screen max-w-none -translate-x-1/2 px-4 py-16 sm:px-6 lg:px-8"
        style={{
          background:
            'linear-gradient(135deg, #0B2545 0%, #0B4F8A 100%)',
        }}
        aria-label="Impacto dos programas"
      >
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-white/15 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {[
            { emoji: '🎓', value: '1.200+', label: 'alunos beneficiados' },
            {
              emoji: '📚',
              value: totalAtivos != null ? String(totalAtivos) : '6',
              label: 'programas ativos',
            },
            { emoji: '🏫', value: '43', label: 'escolas participantes' },
            { emoji: '⭐', value: '4.8', label: 'avaliação média' },
          ].map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-center gap-1 px-4 py-8 text-center lg:py-10 lg:px-6"
            >
              <span className="text-2xl" aria-hidden>
                {m.emoji}
              </span>
              <p className="text-3xl font-extrabold text-white sm:text-4xl">
                {m.value}
              </p>
              <p className="text-sm text-[#94BAD9]">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-[1200px] justify-center px-2">
          <Card className="w-full max-w-xl border-0 bg-white/10 py-6 text-center text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center gap-4 px-6">
              <CardTitle className="text-xl font-bold text-white">
                Sua escola pode participar?
              </CardTitle>
              <CardDescription className="text-base text-white/85">
                Entre em contato para inscrever sua unidade nos programas
              </CardDescription>
              <Button
                nativeButton={false}
                render={<Link to="/contato" />}
                className="mt-1 border-0 bg-white font-semibold text-[#0B2545] shadow-md hover:bg-slate-100 hover:text-[#0B2545]"
              >
                Solicitar Participação
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
