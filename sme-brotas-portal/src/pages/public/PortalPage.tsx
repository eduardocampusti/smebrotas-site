import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronDown,
  ExternalLink,
  FileText,
  GraduationCap,
  Headphones,
  LogIn,
  ShieldCheck,
  Smartphone,
  Sprout,
  Utensils,
} from 'lucide-react'
import { supabase } from '../../config/supabase'

type PortalSistema = {
  id: string
  nome: string
  descricao: string
  link: string
  ativo: boolean
  ordem: number
}

type PortalPerfil = {
  id: string
  sistema_id: string
  nome: string
  descricao: string | null
  link: string
  icone: string
  ordem: number
  ativo: boolean
}

function resolveLucideIcon(name: string): LucideIcon {
  const key = name.trim()
  const pack = LucideIcons as unknown as Record<string, LucideIcon | undefined>
  const Icon = pack[key]
  return Icon ?? LucideIcons.CircleHelp
}

function sistemaVisual(nome: string) {
  const n = nome.toLowerCase()
  if (n.includes('nutri'))
    return { Icon: Utensils, cardBg: '#E6F1FB', iconColor: '#185FA5' as const }
  if (n.includes('brotar'))
    return { Icon: Sprout, cardBg: '#E1F5EE', iconColor: '#0F6E56' as const }
  if (n.includes('boletim'))
    return { Icon: FileText, cardBg: '#E6F1FB', iconColor: '#185FA5' as const }
  return { Icon: LucideIcons.LayoutGrid, cardBg: '#f1f5f9', iconColor: '#64748b' as const }
}

function boletimHost(link: string): string {
  try {
    return new URL(link).hostname
  } catch {
    return 'boletim.smebrotas.com.br'
  }
}

function StatusOnline() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span
        className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
        aria-hidden
      />
      <span>Online</span>
    </div>
  )
}

function PortalSkeleton() {
  return (
    <div className="flex flex-col gap-10 pb-12">
      <div className="h-48 animate-pulse rounded-2xl bg-slate-200/80 md:h-56" style={{ backgroundColor: '#0C447C33' }} />
      <div>
        <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-muted/60" />
          ))}
        </div>
      </div>
      <div className="h-80 animate-pulse rounded-2xl border-2 border-slate-200 bg-muted/50" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/70" />
        ))}
      </div>
    </div>
  )
}

const FALLBACK_HERO_TITULO = 'Sistemas da Secretaria Municipal de Educação'
const FALLBACK_HERO_SUB =
  'Acesso unificado aos sistemas educacionais de Brotas de Macaúbas. Selecione o sistema ou seu perfil de acesso abaixo.'
const FALLBACK_SUPORTE = '(75) 3621-8400'

export default function PortalPage() {
  const perfisRef = useRef<HTMLElement>(null)
  const [loading, setLoading] = useState(true)
  const [heroTitulo, setHeroTitulo] = useState(FALLBACK_HERO_TITULO)
  const [heroSubtitulo, setHeroSubtitulo] = useState(FALLBACK_HERO_SUB)
  const [suporteTelefone, setSuporteTelefone] = useState(FALLBACK_SUPORTE)
  const [sistemas, setSistemas] = useState<PortalSistema[]>([])
  const [perfisBoletim, setPerfisBoletim] = useState<PortalPerfil[]>([])
  const [sistemaBoletim, setSistemaBoletim] = useState<PortalSistema | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [cfgRes, sisRes] = await Promise.all([
          supabase.from('portal_config').select('chave, valor'),
          supabase
            .from('portal_sistemas')
            .select('id, nome, descricao, link, ativo, ordem')
            .eq('ativo', true)
            .order('ordem', { ascending: true }),
        ])

        if (cancelled) return

        if (cfgRes.error) throw cfgRes.error
        if (sisRes.error) throw sisRes.error

        const map = new Map((cfgRes.data ?? []).map((r) => [r.chave, r.valor]))
        setHeroTitulo(map.get('hero_titulo')?.trim() || FALLBACK_HERO_TITULO)
        setHeroSubtitulo(map.get('hero_subtitulo')?.trim() || FALLBACK_HERO_SUB)
        setSuporteTelefone(map.get('suporte_telefone')?.trim() || FALLBACK_SUPORTE)

        const sis = (sisRes.data ?? []) as PortalSistema[]
        setSistemas(sis)

        const bo = sis.find((s) => s.nome.toLowerCase().includes('boletim')) ?? null
        setSistemaBoletim(bo)

        if (bo) {
          const { data: perfData, error: perfErr } = await supabase
            .from('portal_perfis')
            .select('id, sistema_id, nome, descricao, link, icone, ordem, ativo')
            .eq('sistema_id', bo.id)
            .eq('ativo', true)
            .order('ordem', { ascending: true })
          if (cancelled) return
          if (perfErr) throw perfErr
          setPerfisBoletim((perfData ?? []) as PortalPerfil[])
        } else {
          setPerfisBoletim([])
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) toast.error('Não foi possível carregar o portal. Exibindo conteúdo padrão.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const scrollToPerfis = () => {
    perfisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const boletimLink = sistemaBoletim?.link ?? 'https://boletim.smebrotas.com.br'
  const boletimHostname = useMemo(() => boletimHost(boletimLink), [boletimLink])

  if (loading) {
    return <PortalSkeleton />
  }

  return (
    <div className="flex flex-col gap-10 pb-12">
      <section
        className="relative overflow-hidden rounded-2xl px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12 md:px-12 md:py-14"
        style={{ backgroundColor: '#0C447C' }}
      >
        <div
          className="pointer-events-none absolute -right-8 top-0 h-full w-[min(55%,20rem)] opacity-[0.18] sm:w-[min(50%,24rem)]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.55) 1px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-4 text-center md:text-left">
          <div className="flex justify-center md:justify-start">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/95 backdrop-blur-sm">
              Portal Educacional
            </span>
          </div>
          <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            {heroTitulo}
          </h1>
          <p className="text-base leading-relaxed text-white/85 sm:text-lg">{heroSubtitulo}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground md:text-left">
          Sistemas disponíveis
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {sistemas.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground">
              Nenhum sistema ativo cadastrado.
            </p>
          ) : (
            sistemas.map((sys) => {
              const isBoletim = sys.nome.toLowerCase().includes('boletim')
              const { Icon, cardBg, iconColor } = sistemaVisual(sys.nome)
              return (
                <article
                  key={sys.id}
                  className={
                    isBoletim
                      ? 'flex flex-col gap-4 rounded-2xl border-2 bg-card p-5 shadow-md'
                      : 'flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm'
                  }
                  style={isBoletim ? { borderColor: '#185FA5' } : undefined}
                >
                  {isBoletim && (
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                        style={{ backgroundColor: '#185FA5' }}
                      >
                        Acesso por perfil
                      </span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: cardBg }}
                    >
                      <Icon className="size-6" strokeWidth={2} style={{ color: iconColor }} aria-hidden />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-foreground">{sys.nome}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{sys.descricao}</p>
                  </div>
                  <StatusOnline />
                  {isBoletim ? (
                    <button
                      type="button"
                      onClick={scrollToPerfis}
                      className="mt-auto inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
                      style={{ backgroundColor: '#185FA5' }}
                    >
                      Ver perfis abaixo
                      <ChevronDown className="size-4 shrink-0" aria-hidden />
                    </button>
                  ) : (
                    <a
                      href={sys.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Acessar sistema
                      <ExternalLink className="size-4 shrink-0 opacity-70" aria-hidden />
                    </a>
                  )}
                </article>
              )
            })
          )}
        </div>
      </section>

      {sistemaBoletim && (
        <section
          ref={perfisRef}
          className="scroll-mt-24 rounded-2xl border-2 bg-card p-6 shadow-sm sm:p-8 md:p-10"
          style={{ borderColor: '#185FA5' }}
          aria-labelledby="boletim-perfis-titulo"
        >
          <header className="mb-8 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start">
              <div
                className="mx-auto flex size-16 shrink-0 items-center justify-center rounded-2xl sm:mx-0"
                style={{ backgroundColor: '#E6F1FB' }}
              >
                <GraduationCap className="size-9" strokeWidth={2} style={{ color: '#185FA5' }} aria-hidden />
              </div>
              <div className="text-center sm:text-left">
                <h2
                  id="boletim-perfis-titulo"
                  className="text-xl font-black tracking-tight text-foreground sm:text-2xl"
                >
                  {sistemaBoletim.nome} — Escolha seu perfil
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Cada perfil acessa recursos e funcionalidades específicas
                </p>
              </div>
            </div>
            <span
              className="inline-flex shrink-0 items-center self-center rounded-full border px-3 py-1 text-xs font-semibold text-muted-foreground md:self-start"
              style={{ borderColor: '#185FA5', color: '#185FA5' }}
            >
              {boletimHostname}
            </span>
          </header>

          {perfisBoletim.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Perfis de acesso serão exibidos aqui quando cadastrados no painel administrativo.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {perfisBoletim.map((perfil) => {
                const PIcon = resolveLucideIcon(perfil.icone)
                return (
                  <a
                    key={perfil.id}
                    href={perfil.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full min-h-0"
                  >
                    <span className="flex h-full w-full flex-col items-center gap-2 rounded-lg border border-border bg-secondary p-4 text-center transition-colors hover:border-[#185FA5] hover:bg-[#E6F1FB]">
                      <PIcon className="size-6 shrink-0 text-[#185FA5]" strokeWidth={2} aria-hidden />
                      <span className="text-sm font-bold text-foreground">{perfil.nome}</span>
                      {perfil.descricao ? (
                        <span className="text-xs text-muted-foreground">{perfil.descricao}</span>
                      ) : null}
                    </span>
                  </a>
                )
              })}
            </div>
          )}

          <a
            href={boletimLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-95"
            style={{ backgroundColor: '#185FA5' }}
          >
            <LogIn className="size-5 shrink-0" aria-hidden />
            Entrar no Boletim Escolar
          </a>
        </section>
      )}

      <footer className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <ShieldCheck className="size-6 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
          <span className="text-sm font-medium text-foreground">Acesso seguro com login individual</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <Smartphone className="size-6 shrink-0 text-[#185FA5]" aria-hidden />
          <span className="text-sm font-medium text-foreground">Funciona no celular e computador</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <Headphones className="size-6 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <span className="text-sm font-medium text-foreground">Suporte: {suporteTelefone}</span>
        </div>
      </footer>
    </div>
  )
}
