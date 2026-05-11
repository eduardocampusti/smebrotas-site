import { useRef } from 'react'
import {
  BadgeCheck,
  Building2,
  ChevronDown,
  ExternalLink,
  FileText,
  GraduationCap,
  Headphones,
  Heart,
  LogIn,
  Presentation,
  ShieldCheck,
  Smartphone,
  Sprout,
  Users,
  Utensils,
} from 'lucide-react'

/** Ajuste o número oficial de suporte da SME quando disponível. */
const NUMERO_SUPORTE = '3621-8400'

const BOLETIM_URL = 'https://boletim.smebrotas.com.br'
const NUTRI_URL = 'https://www.nutriassist.smebrotas.com.br/login'
const BROTAR_URL = 'https://brotar.smebrotas.com.br/login'

const perfisBoletim = [
  {
    titulo: 'Secretária de Educação',
    descricao: 'Visão geral da rede',
    Icon: Building2,
  },
  {
    titulo: 'Diretor',
    descricao: 'Gestão da escola',
    Icon: BadgeCheck,
  },
  {
    titulo: 'Coordenador',
    descricao: 'Turmas e pedagógico',
    Icon: Users,
  },
  {
    titulo: 'Professor',
    descricao: 'Notas e frequência',
    Icon: Presentation,
  },
  {
    titulo: 'Pais / Responsáveis',
    descricao: 'Boletim do filho',
    Icon: Heart,
  },
] as const

function StatusOnline() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]" aria-hidden />
      <span>Online</span>
    </div>
  )
}

export default function PortalPage() {
  const perfisRef = useRef<HTMLElement>(null)

  const scrollToPerfis = () => {
    perfisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* 1. Hero */}
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
            Sistemas da Secretaria Municipal de Educação
          </h1>
          <p className="text-base leading-relaxed text-white/85 sm:text-lg">
            Acesso unificado aos sistemas educacionais de Brotas de Macaúbas. Selecione o sistema ou seu perfil de acesso
            abaixo.
          </p>
        </div>
      </section>

      {/* 2. Grid dos 3 sistemas */}
      <section className="flex flex-col gap-3">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground md:text-left">
          Sistemas disponíveis
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* NutriAssist */}
          <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#E6F1FB' }}
              >
                <Utensils className="size-6" strokeWidth={2} style={{ color: '#185FA5' }} aria-hidden />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">NutriAssist</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Gestão da alimentação escolar, cardápios e controle nutricional da rede.
              </p>
            </div>
            <StatusOnline />
            <a
              href={NUTRI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Acessar sistema
              <ExternalLink className="size-4 shrink-0 opacity-70" aria-hidden />
            </a>
          </article>

          {/* Sistema Brotar */}
          <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#E1F5EE' }}
              >
                <Sprout className="size-6" strokeWidth={2} style={{ color: '#0F6E56' }} aria-hidden />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Sistema Brotar</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Gestão pedagógica, acompanhamento de alunos e coordenação da rede municipal.
              </p>
            </div>
            <StatusOnline />
            <a
              href={BROTAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Acessar sistema
              <ExternalLink className="size-4 shrink-0 opacity-70" aria-hidden />
            </a>
          </article>

          {/* Boletim Escolar — destacado */}
          <article
            className="flex flex-col gap-4 rounded-2xl border-2 bg-card p-5 shadow-md"
            style={{ borderColor: '#185FA5' }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: '#185FA5' }}
              >
                Acesso por perfil
              </span>
            </div>
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: '#E6F1FB' }}
            >
              <FileText className="size-6" strokeWidth={2} style={{ color: '#185FA5' }} aria-hidden />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Boletim Escolar</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Notas, frequências, relatórios e acompanhamento completo por perfil de usuário.
              </p>
            </div>
            <StatusOnline />
            <button
              type="button"
              onClick={scrollToPerfis}
              className="mt-auto inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
              style={{ backgroundColor: '#185FA5' }}
            >
              Ver perfis abaixo
              <ChevronDown className="size-4 shrink-0" aria-hidden />
            </button>
          </article>
        </div>
      </section>

      {/* 3. Boletim — perfis */}
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
              <h2 id="boletim-perfis-titulo" className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Boletim Escolar — Escolha seu perfil
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
            boletim.smebrotas.com.br
          </span>
        </header>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {perfisBoletim.map(({ titulo, descricao, Icon }, index) => (
            <a
              key={titulo}
              href={BOLETIM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={
                index === 4
                  ? 'col-span-2 flex justify-center md:col-span-1'
                  : ''
              }
            >
              <span
                className={
                  index === 4
                    ? 'flex w-full max-w-[calc(50%-0.25rem)] flex-col items-center gap-2 rounded-lg border border-border bg-secondary p-4 text-center transition-colors hover:border-[#185FA5] hover:bg-[#E6F1FB] md:max-w-none'
                    : 'flex h-full w-full flex-col items-center gap-2 rounded-lg border border-border bg-secondary p-4 text-center transition-colors hover:border-[#185FA5] hover:bg-[#E6F1FB]'
                }
              >
                <Icon className="size-6 shrink-0 text-[#185FA5]" strokeWidth={2} aria-hidden />
                <span className="text-sm font-bold text-foreground">{titulo}</span>
                <span className="text-xs text-muted-foreground">{descricao}</span>
              </span>
            </a>
          ))}
        </div>

        <a
          href={BOLETIM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-95"
          style={{ backgroundColor: '#185FA5' }}
        >
          <LogIn className="size-5 shrink-0" aria-hidden />
          Entrar no Boletim Escolar
        </a>
      </section>

      {/* 4. Rodapé informativo */}
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
          <span className="text-sm font-medium text-foreground">
            Suporte: (75) {NUMERO_SUPORTE}
          </span>
        </div>
      </footer>
    </div>
  )
}
