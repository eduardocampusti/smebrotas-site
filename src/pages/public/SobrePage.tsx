import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Diamond,
  Eye,
  GraduationCap,
  Target,
  Users,
} from 'lucide-react'
import { supabase } from '../../config/supabase'
import type { SobreConfig } from '../../types'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const DEFAULT_CONFIG: SobreConfig = {
  id: 'default',
  hero_title: "Sobre a Secretaria de Educação",
  hero_subtitle: "Conheça a nossa história, nossa missão como instituição formadora e a equipe gestora dedicada ao avanço da educação no município.",
  hero_banner_url: "/secretaria_foto.jpg",
  hero_banner_text: "Trabalhando diariamente para construir um futuro mais brilhante através do conhecimento.",
  intro_title: "Apresentação",
  intro_text: "A Secretaria Municipal de Educação atua como o órgão responsável por organizar, administrar e supervisionar o sistema educacional do município. Nosso compromisso é com a oferta de uma educação básica de excelência, pautada na equidade, inclusão e inovação pedagógica.\n\nGerenciamos uma rede composta por dezenas de unidades escolares, desde a Educação Infantil até o Ensino Fundamental, além da Educação de Jovens e Adultos (EJA) e Educação Especial. Trabalhamos em conjunto com a comunidade escolar para garantir que cada estudante alcance seu pleno potencial.",
  mission: "Garantir o acesso, a permanência e o sucesso de todos os alunos na escola, oferecendo uma educação pública gratuita, democrática e de qualidade, que promova o desenvolvimento integral do cidadão.",
  vision: "Ser referência nacional em gestão educacional e inovação pedagógica, reconhecida por uma rede de ensino acolhedora e eficiente que transforma a realidade local através do conhecimento.",
  values: [
    "Ética e Transparência",
    "Gestão Democrática",
    "Inclusão e Diversidade",
    "Valorização dos Profissionais"
  ],
  management_team: [
    { id: '1', name: 'Dra. Helena Mendes', role: 'Secretária de Educação', photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrNnWZr7Robgj8wIGhvAl_9ZawhTShF4reqPwlXKsLBNUk4MCIIvBNU5xs0nSR_7OUX2xd8InOoHpx4PWuQIzABMd6yInQcuyWjtGJ3E2c1h3jrRqw2_iAzp-noGNGYpVHTGQJLTgNgH9rESI3qjmStEoTsbpBu-NXQPQVQSJ4WF4upmnq4GQSMxsA33WbhYIhosXm7G7TFfrnTZup0_iZwQ9Og1AH1V0EVkaZgaY25T_a30wtDVztq-i8nSyAZ0APU0tpdaTXCuE', order: 0 },
    { id: '2', name: 'Roberto Carvalho', role: 'Diretor de Ensino', photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTIEqMWUkWgUAhRgKYAHMmthqG_e6SL-8dt-boq5XMY2XSlW-9jNqcFWqs1_s3m8Oi5b1u8WemWw3qGZyTP5xc8cSHYIIoLr0WxNN_D5ABNcapLbsBdaW1vQVKsjEEHKK9ZKdGSl5ex8TzLJvjlC_xZtoLxIMoYh2UJ0FSWehHUEYcjYUQd_yB-XKJE9jbxHv3V-6A-dTktmUbM0YpnFwu324vF1O7GbWRm_rIY0qo70RhxRQQzLLTq71VPn5__l7imMXfHQS6FZY', order: 1 },
    { id: '3', name: 'Ana Lúcia Costa', role: 'Diretora Administrativa', photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtiKcnAf459gSwcOi4vcBtr537dk9X1pujmCDRvp23ejU8Z7piSEQ4D-ERNMMQhivzuDC1mSMeud7eOuIDk-ctleJlAWvuzLzUNuEZrlaK0H4lLCi6FxXIfwgAfqqA_DhVpp1mcmWqyu5EuWSLQprS93ycdLUPhNZ3NaYi5UFoA6lsp-t4OJt5E9xS9k7fmPxbDwPHKHYrCwFnFBpNLDaG4rSUOSfV87qqHgtxZ-hMtTFfKRWbwTCTVoDFHoBK1GTFOihCH39WOpQ', order: 2 },
    { id: '4', name: 'Carlos Eduardo', role: 'Gestão de Pessoas', photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg3R_hoIukiHDdMIwCyRbW0OMa7ADiUx9juuBnOJYxFtJrKpbREVS0fTd-OsMMIE4hU1ikjRce6JAD8RYkeGoxI1OnViaPw4vJMoaBpfwC0pMWOJfankxjVfzA-uixKeuOmFeYiyuAoQaXoBynAm5luKPJcTaT6A-r_Z408VJYgStoS32Disqwsr8d064DLsaAjJxL3RMvAxKELycf3ECpufkAJcdKbPZ0MGElXpx4gjE_O3j2DVSBz1nZ5wtXqoUJtpzyBewB5K0', order: 3 }
  ]
}

const VALUE_BADGE_LABELS = [
  "Ética",
  "Gestão Democrática",
  "Inclusão",
  "Valorização",
] as const

const TIMELINE = [
  {
    year: '1990',
    title: 'Criação da Secretaria',
    description:
      'Constituição formal do órgão municipal responsável pela política educacional, unificando a gestão das escolas e ampliando o acesso à educação básica.',
    dotClass: 'bg-[#1D4ED8]',
  },
  {
    year: '2003',
    title: 'Expansão para a zona rural',
    description:
      'Fortalecimento do transporte escolar e da infraestrutura nas comunidades do interior, garantindo equidade no acesso às unidades da rede.',
    dotClass: 'bg-[#0B4F8A]',
  },
  {
    year: '2016',
    title: 'Tecnologia nas escolas',
    description:
      'Investimento em laboratórios, conectividade e formação docente para integrar recursos digitais ao cotidiano pedagógico.',
    dotClass: 'bg-[#065F46]',
  },
  {
    year: '2021',
    title: 'Educação especial e inclusiva',
    description:
      'Consolidação de programas de atendimento educacional especializado e práticas inclusivas em toda a rede municipal.',
    dotClass: 'bg-[#7C3AED]',
  },
] as const

const ORG_TOOLTIPS = {
  root: 'Órgão executivo que planeja, coordena e avalia as políticas educacionais do município.',
  ensino:
    'Planejamento curricular, avaliação da aprendizagem, formação continuada e suporte pedagógico às escolas.',
  admin:
    'Orçamento, patrimônio, licitações, contratos e suporte logístico às unidades e à secretaria.',
  pessoas:
    'Recrutamento, desenvolvimento, avaliação de desempenho e clima organizacional dos servidores da educação.',
} as const

/** Normaliza `<br>` vindos do CMS e quebra em parágrafos para renderização em `<p>`. */
function introToParagraphs(raw: string): string[] {
  if (!raw.trim()) return []
  const normalized = raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n/g, '\n')
  return normalized
    .split(/\n+/)
    .map((p) => p.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)
}

/** Corrige exibição vinda do CMS (ex.: "Corrdenador FII"). */
function displayCargoRole(role: string): string {
  return role.replace(/corrdenador/gi, 'Coordenador')
}

function roleBadgeClass(role: string): string {
  const r = displayCargoRole(role).toLowerCase()
  if (r.includes('secretári') || r.includes('secretari')) {
    return 'border-transparent bg-[#0B2545] text-white hover:bg-[#0B2545]/90'
  }
  if (r.includes('coordenadora') || r.includes('diretora administrativa')) {
    return 'border-transparent bg-emerald-600 text-white hover:bg-emerald-600/90'
  }
  if (r.includes('coordenador fii') || r.includes('coordenador f ii')) {
    return 'border-transparent bg-amber-500 text-amber-950 hover:bg-amber-500/90'
  }
  if (r.includes('coordenador')) {
    return 'border-transparent bg-violet-600 text-white hover:bg-violet-600/90'
  }
  if (r.includes('diretor')) {
    return 'border-transparent bg-violet-600 text-white hover:bg-violet-600/90'
  }
  if (r.includes('gestão de pessoas') || r.includes('gestao de pessoas')) {
    return 'border-transparent bg-slate-600 text-white hover:bg-slate-600/90'
  }
  return 'border-transparent bg-[#0B4F8A] text-white hover:bg-[#0B4F8A]/90'
}

export default function SobrePage() {
  const [config, setConfig] = useState<SobreConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from('site_about')
          .select('*')
          .single()

        if (error && error.code !== 'PGRST116') throw error
        if (data) setConfig(data)
      } catch (err) {
        console.error('Erro ao carregar configurações da página Sobre:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const introParagraphs = introToParagraphs(config.intro_text)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Carregando informações institucionais...</p>
      </div>
    )
  }

  return (
    <TooltipProvider delay={200}>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl min-h-[320px] md:min-h-[420px] shadow-lg">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url("${config.hero_banner_url}")` }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(11,37,69,0.85) 40%, transparent)',
          }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-col justify-between min-h-[320px] md:min-h-[420px] p-6 md:p-10 gap-8">
          <div className="flex flex-col gap-6">
            <Breadcrumb>
              <BreadcrumbList className="text-white/80 sm:gap-2">
                <BreadcrumbItem>
                  <Link
                    to="/"
                    className="transition-colors hover:text-white text-sm font-medium"
                  >
                    Início
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/50 [&>svg]:text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-medium">
                    Sobre a Secretaria
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-3 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Sobre a Secretaria
              </h1>
              <p
                className="text-base md:text-lg leading-relaxed max-w-xl"
                style={{ color: '#94BAD9' }}
              >
                {config.hero_subtitle}
              </p>
              <div>
                <Badge
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur-md px-3 py-1 shadow-sm"
                >
                  Desde 1990
                </Badge>
              </div>
            </div>
          </div>

          {config.hero_banner_text ? (
            <p className="text-white/95 text-sm md:text-base max-w-2xl border border-white/20 bg-black/15 backdrop-blur-sm rounded-xl p-4">
              {config.hero_banner_text}
            </p>
          ) : null}
        </div>
      </section>

      {/* Apresentação */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-10">
        <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">
          {config.intro_title}
        </h2>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 text-slate-600 leading-relaxed dark:text-slate-400 lg:col-span-7">
            {introParagraphs.map((para, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-bold first-letter:text-[#0B4F8A] first-letter:text-5xl first-letter:leading-none'
                    : ''
                }
              >
                {para}
              </p>
            ))}
          </div>
          <div className="flex flex-col justify-center gap-8 border-t border-slate-100 pt-8 dark:border-slate-800 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <p className="text-4xl font-bold tracking-tight text-[#0B4F8A] md:text-5xl">
                25+
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                anos de história
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tight text-[#0B4F8A] md:text-5xl">
                143
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                escolas na rede
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tight text-[#0B4F8A] md:text-5xl">
                2.850
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                alunos atendidos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="h-full border-t-[3px] border-t-[#1D4ED8] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-14 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
                <Target className="size-7" strokeWidth={2} />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">{config.mission}</p>
            </CardContent>
          </Card>

          <Card className="h-full border-t-[3px] border-t-[#065F46] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-14 items-center justify-center rounded-xl bg-[#D1FAE5] text-[#065F46]">
                <Eye className="size-7" strokeWidth={2} />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Nossa Visão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">{config.vision}</p>
            </CardContent>
          </Card>

          <Card className="h-full border-t-[3px] border-t-[#7C3AED] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-14 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#7C3AED]">
                <Diamond className="size-7" strokeWidth={2} />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Nossos Valores
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {VALUE_BADGE_LABELS.map((label) => (
                <Badge key={label} variant="secondary" className="font-normal">
                  {label}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Equipe Gestora */}
      <section className="pt-2">
        <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Users className="size-7 text-[#0B4F8A]" aria-hidden />
          Equipe Gestora
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {config.management_team
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((gestor) => {
              const cargoLabel = displayCargoRole(gestor.role)
              return (
              <Card
                key={gestor.id}
                className="flex flex-col items-center text-center shadow-md transition-all duration-300 ease-in-out hover:-translate-y-[4px] hover:shadow-xl"
              >
                <CardHeader className="flex w-full flex-col items-center pb-6 text-center">
                  <div className="mx-auto mb-4 size-24 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-2 ring-blue-200 dark:bg-slate-800">
                    {gestor.photo_url ? (
                      <img
                        alt={`Foto de ${gestor.name}`}
                        className="size-full object-cover"
                        src={gestor.photo_url}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                        <Users className="size-10 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="w-full text-center text-base font-semibold text-slate-900 dark:text-white">
                    {gestor.name}
                  </CardTitle>
                  <Badge
                    className={`mx-auto mt-2 max-w-full justify-center whitespace-normal ${roleBadgeClass(gestor.role)}`}
                  >
                    {cargoLabel}
                  </Badge>
                </CardHeader>
              </Card>
              )
            })}
        </div>
      </section>

      {/* Organograma */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-10">
        <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Building2 className="size-7 text-[#0B4F8A]" aria-hidden />
          Organograma
        </h2>
        <div className="flex flex-col items-center py-4">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-[#0B2545] px-8 py-4 text-center font-bold text-white shadow-md outline-none transition hover:bg-[#0B2545]/95 focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Secretaria da Educação
                </button>
              }
            />
            <TooltipContent side="bottom" className="max-w-xs text-center">
              {ORG_TOOLTIPS.root}
            </TooltipContent>
          </Tooltip>

          <div
            className="relative z-0 h-8 w-px shrink-0 border-l-2 border-slate-300 dark:border-slate-600"
            aria-hidden
          />
          <div className="w-full max-w-2xl border-t-2 border-slate-300 dark:border-slate-600" />

          <div className="mt-0 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
            <div className="flex flex-col items-center">
              <div
                className="hidden h-6 w-px shrink-0 bg-slate-300 md:block dark:bg-slate-600"
                aria-hidden
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="flex h-full w-full flex-col items-center gap-3 rounded-xl border-2 border-[#0B4F8A] bg-white p-5 text-center shadow-sm outline-none transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0B4F8A]/30 dark:bg-slate-950"
                    >
                      <div className="flex size-12 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#0B4F8A]">
                        <GraduationCap className="size-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Diretoria de Ensino
                      </span>
                    </button>
                  }
                />
                <TooltipContent className="max-w-xs">{ORG_TOOLTIPS.ensino}</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex flex-col items-center">
              <div
                className="hidden h-6 w-px shrink-0 bg-slate-300 md:block dark:bg-slate-600"
                aria-hidden
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="flex h-full w-full flex-col items-center gap-3 rounded-xl border-2 border-[#0B4F8A] bg-white p-5 text-center shadow-sm outline-none transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0B4F8A]/30 dark:bg-slate-950"
                    >
                      <div className="flex size-12 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#0B4F8A]">
                        <Building2 className="size-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Diretoria Administrativa
                      </span>
                    </button>
                  }
                />
                <TooltipContent className="max-w-xs">{ORG_TOOLTIPS.admin}</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex flex-col items-center">
              <div
                className="hidden h-6 w-px shrink-0 bg-slate-300 md:block dark:bg-slate-600"
                aria-hidden
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="flex h-full w-full flex-col items-center gap-3 rounded-xl border-2 border-[#0B4F8A] bg-white p-5 text-center shadow-sm outline-none transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0B4F8A]/30 dark:bg-slate-950"
                    >
                      <div className="flex size-12 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#0B4F8A]">
                        <Users className="size-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Gestão de Pessoas
                      </span>
                    </button>
                  }
                />
                <TooltipContent className="max-w-xs">{ORG_TOOLTIPS.pessoas}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Trajetória */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/50 md:p-10">
        <h2 className="mb-10 text-center text-2xl font-bold text-slate-900 dark:text-white">
          Nossa Trajetória
        </h2>
        <div className="relative mx-auto max-w-3xl">
          <div
            className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-300 md:left-1/2 md:-translate-x-px dark:bg-slate-600"
            aria-hidden
          />
          <ul className="space-y-10 md:space-y-14">
            {TIMELINE.map((item, idx) => (
              <li
                key={item.year}
                className="relative grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start"
              >
                <div
                  className={`pl-10 md:pl-0 ${idx % 2 === 0 ? 'md:pr-10 md:text-right' : 'md:col-start-2 md:pl-10'}`}
                >
                  <span
                    className={`absolute left-0 top-1 size-4 rounded-full border-2 border-white shadow md:left-1/2 md:-translate-x-1/2 ${item.dotClass}`}
                    aria-hidden
                  />
                  <p className="font-bold text-[#0B4F8A]">{item.year}</p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </TooltipProvider>
  )
}
