import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart,
  BarChart2,
  Briefcase,
  FileSearch,
  FileText,
  Home,
  Info,
  LayoutDashboard,
  Mail,
  Map,
  MessageSquare,
  Scale,
  Newspaper,
  School,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type LucideCmp = React.ComponentType<{ className?: string }>

type NavItem = {
  titulo: string
  descricao: string
  link: string
  Icon: LucideCmp
  iconWrapClass: string
  iconClass: string
}

const SECOES_PRINCIPAIS: NavItem[] = [
  {
    titulo: "Início",
    descricao: "Página inicial do portal",
    link: "/",
    Icon: Home,
    iconWrapClass: "bg-[#DBEAFE]",
    iconClass: "text-[#1D4ED8]",
  },
  {
    titulo: "Sobre",
    descricao: "Informações institucionais da Secretaria",
    link: "/sobre",
    Icon: Info,
    iconWrapClass: "bg-[#FEF3C7]",
    iconClass: "text-[#92400E]",
  },
  {
    titulo: "Escolas",
    descricao: "Unidades escolares do município",
    link: "/escolas",
    Icon: School,
    iconWrapClass: "bg-[#D1FAE5]",
    iconClass: "text-[#065F46]",
  },
  {
    titulo: "Serviços",
    descricao: "Serviços oferecidos pela Secretaria",
    link: "/servicos",
    Icon: Briefcase,
    iconWrapClass: "bg-[#EDE9FE]",
    iconClass: "text-[#7C3AED]",
  },
  {
    titulo: "Notícias",
    descricao: "Notícias e comunicados",
    link: "/noticias",
    Icon: Newspaper,
    iconWrapClass: "bg-[#FCE7F3]",
    iconClass: "text-[#9D174D]",
  },
  {
    titulo: "Programas",
    descricao: "Programas e projetos educacionais",
    link: "/programas",
    Icon: Sparkles,
    iconWrapClass: "bg-[#FEF9C3]",
    iconClass: "text-[#713F12]",
  },
  {
    titulo: "Transparência",
    descricao: "Dados abertos e prestação de contas",
    link: "/transparencia",
    Icon: BarChart,
    iconWrapClass: "bg-[#F0FDF4]",
    iconClass: "text-[#166534]",
  },
  {
    titulo: "Contato",
    descricao: "Canais de atendimento ao cidadão",
    link: "/contato",
    Icon: Mail,
    iconWrapClass: "bg-[#FFF7ED]",
    iconClass: "text-[#C2410C]",
  },
]

const ATALHOS_TOPO: NavItem[] = [
  {
    titulo: "Ouvidoria",
    descricao: "Canal de escuta e manifestações",
    link: "/ouvidoria",
    Icon: MessageSquare,
    iconWrapClass: "bg-[#FEE2E2]",
    iconClass: "text-[#991B1B]",
  },
  {
    titulo: "Acesso à Informação",
    descricao: "e-SIC e pedidos conforme a LAI",
    link: "/acesso-a-informacao",
    Icon: FileSearch,
    iconWrapClass: "bg-[#E0F2FE]",
    iconClass: "text-[#0369A1]",
  },
  {
    titulo: "Proteção de Dados (LGPD)",
    descricao: "Privacidade e tratamento de dados",
    link: "/lgpd",
    Icon: Shield,
    iconWrapClass: "bg-[#EFF6FF]",
    iconClass: "text-[#1D4ED8]",
  },
  {
    titulo: "Mapa do Site",
    descricao: "Visão geral das páginas do portal",
    link: "/mapa-do-site",
    Icon: Map,
    iconWrapClass: "bg-[#F1F5F9]",
    iconClass: "text-[#334155]",
  },
]

const DOCS_PUBLICOS: NavItem[] = [
  {
    titulo: "Portal da Transparência",
    descricao: "Receitas, despesas e convênios",
    link: "/transparencia",
    Icon: BarChart2,
    iconWrapClass: "bg-[#EDE9FE]",
    iconClass: "text-[#6D28D9]",
  },
  {
    titulo: "Atos Oficiais",
    descricao: "Portarias, resoluções e decretos",
    link: "/transparencia/atos-oficiais",
    Icon: FileText,
    iconWrapClass: "bg-[#F0FDF4]",
    iconClass: "text-[#065F46]",
  },
]

function matchesQuery(item: NavItem, q: string) {
  if (!q.trim()) return true
  const s = q.toLowerCase()
  return (
    item.titulo.toLowerCase().includes(s) ||
    item.descricao.toLowerCase().includes(s) ||
    item.link.toLowerCase().includes(s)
  )
}

function SiteNavLink({ item }: { item: NavItem }) {
  const Icon = item.Icon
  return (
    <Link
      to={item.link}
      className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-slate-50"
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          item.iconWrapClass
        )}
      >
        <Icon className={cn("size-4", item.iconClass)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#0B2545]">{item.titulo}</div>
        <p className="text-xs text-slate-400">{item.descricao}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#0B4F8A]" />
    </Link>
  )
}

type SectionCardProps = {
  borderTopClass: string
  sectionIconWrap: string
  sectionIconClass: string
  SectionIcon: LucideCmp
  titulo: string
  subtitulo: string
  children: React.ReactNode
}

function SectionCard({
  borderTopClass,
  sectionIconWrap,
  sectionIconClass,
  SectionIcon,
  titulo,
  subtitulo,
  children,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border border-slate-100 py-0 shadow-md ring-0 transition-shadow duration-200 hover:shadow-lg",
        borderTopClass
      )}
    >
      <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            sectionIconWrap
          )}
        >
          <SectionIcon className={cn("size-5", sectionIconClass)} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[#0B2545]">{titulo}</h2>
          <p className="text-sm text-slate-500">{subtitulo}</p>
        </div>
      </div>
      <Separator />
      <CardContent className="px-4 pb-6 pt-4">{children}</CardContent>
    </Card>
  )
}

export default function MapaSitePage() {
  const [query, setQuery] = useState("")

  const principais = useMemo(
    () => SECOES_PRINCIPAIS.filter((i) => matchesQuery(i, query)),
    [query]
  )
  const atalhos = useMemo(
    () => ATALHOS_TOPO.filter((i) => matchesQuery(i, query)),
    [query]
  )
  const docs = useMemo(
    () => DOCS_PUBLICOS.filter((i) => matchesQuery(i, query)),
    [query]
  )

  return (
    <>
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link className="text-slate-500 hover:text-primary font-medium flex items-center gap-1" to="/">
          <span className="material-symbols-outlined text-[18px]">home</span> Início
        </Link>
        <span className="text-slate-400 material-symbols-outlined text-[18px]">chevron_right</span>
        <span className="text-slate-900 font-medium">Mapa do Site</span>
      </nav>

      <section className="flex flex-col items-center text-center">
        <Badge
          variant="secondary"
          className="mb-3 gap-1.5 border-0 bg-[#EFF6FF] px-3 py-1 text-[#0B4F8A] hover:bg-[#EFF6FF]"
        >
          <Map className="size-3.5" aria-hidden />
          Portal SME — Brotas de Macaúbas
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#0B2545] md:text-5xl">
          Mapa do Site
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Encontre rapidamente todas as páginas e seções disponíveis no portal da Secretaria Municipal
          de Educação.
        </p>

        <div className="relative mx-auto mt-4 w-full max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar página ou seção..."
            className="h-10 border-2 border-input pl-9 text-sm transition-colors focus-visible:border-[#0B4F8A] focus-visible:ring-[#0B4F8A]/20"
            aria-label="Buscar no mapa do site"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary">8 páginas principais</Badge>
          <Badge variant="secondary">4 atalhos rápidos</Badge>
          <Badge variant="secondary">2 documentos públicos</Badge>
        </div>
      </section>

      <div className="flex flex-col gap-8">
        {principais.length > 0 ? (
          <SectionCard
            borderTopClass="border-t-4 border-t-[#0B4F8A]"
            sectionIconWrap="bg-[#DBEAFE]"
            sectionIconClass="text-[#1D4ED8]"
            SectionIcon={LayoutDashboard}
            titulo="Páginas Principais"
            subtitulo="Navegação principal do portal"
          >
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
              {principais.map((item) => (
                <SiteNavLink key={item.link} item={item} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {atalhos.length > 0 ? (
          <SectionCard
            borderTopClass="border-t-4 border-t-[#065F46]"
            sectionIconWrap="bg-[#D1FAE5]"
            sectionIconClass="text-[#065F46]"
            SectionIcon={Zap}
            titulo="Atalhos Rápidos"
            subtitulo="Links da barra superior do portal"
          >
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
              {atalhos.map((item) => (
                <SiteNavLink key={item.link} item={item} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {docs.length > 0 ? (
          <SectionCard
            borderTopClass="border-t-4 border-t-[#7C3AED]"
            sectionIconWrap="bg-[#EDE9FE]"
            sectionIconClass="text-[#7C3AED]"
            SectionIcon={Scale}
            titulo="Transparência e Atos Oficiais"
            subtitulo="Documentos e informações públicas"
          >
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {docs.map((item) => (
                <SiteNavLink key={item.link} item={item} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {principais.length === 0 && atalhos.length === 0 && docs.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            Nenhuma página encontrada para &quot;{query}&quot;.
          </p>
        ) : null}
      </div>

      <Card className="mx-auto max-w-2xl gap-0 rounded-2xl border-0 bg-gradient-to-r from-[#0B2545] to-[#0B4F8A] p-8 text-white shadow-lg ring-0">
        <p className="text-lg font-semibold text-white">Não encontrou o que procura?</p>
        <p className="mt-1 text-sm text-[#94BAD9]">
          Fale com nossa equipe de atendimento
        </p>
        <Button
          asChild
          size="lg"
          className="mt-5 bg-white text-[#0B2545] hover:bg-white/90"
        >
          <Link to="/contato">
            Ir para Contato →
          </Link>
        </Button>
      </Card>
    </>
  )
}
