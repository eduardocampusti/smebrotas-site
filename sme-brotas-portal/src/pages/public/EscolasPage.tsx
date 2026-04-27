import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  School,
  Search,
  Star,
} from 'lucide-react'
import { supabase } from '../../config/supabase'
import type { Escola, EscolasPageConfig } from '../../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const MODALITY_OPTIONS = [
  'Todas',
  'Educação Infantil',
  'Ensino Fundamental I',
  'Ensino Fundamental II',
  'EJA',
  'Educação Especial',
] as const

const ZONE_OPTIONS = ['Todas', 'Urbana', 'Rural'] as const

const MODALITY_BADGE_CLASS: Record<string, string> = {
  'Educação Infantil': 'border-0 bg-[#DBEAFE] text-[#1D4ED8]',
  'Ensino Fundamental I': 'border-0 bg-[#D1FAE5] text-[#065F46]',
  'Ensino Fundamental II': 'border-0 bg-[#FEF3C7] text-[#92400E]',
  EJA: 'border-0 bg-[#EDE9FE] text-[#7C3AED]',
  'Educação Especial': 'border-0 bg-[#FCE7F3] text-[#9D174D]',
}

function modalityBadgeClass(modalidade: string): string {
  const m = modalidade?.trim() || ''
  if (MODALITY_BADGE_CLASS[m]) return MODALITY_BADGE_CLASS[m]
  const low = m.toLowerCase()
  if (low.includes('infantil')) return MODALITY_BADGE_CLASS['Educação Infantil']
  if (low.includes('fundamental') && low.includes('i') && !low.includes('ii'))
    return MODALITY_BADGE_CLASS['Ensino Fundamental I']
  if (low.includes('fundamental') && low.includes('ii'))
    return MODALITY_BADGE_CLASS['Ensino Fundamental II']
  if (low.includes('eja')) return MODALITY_BADGE_CLASS.EJA
  if (low.includes('especial')) return MODALITY_BADGE_CLASS['Educação Especial']
  return 'border-0 bg-black/40 text-white backdrop-blur-sm'
}

function matchesZone(school: Escola, zonaFilter: string): boolean {
  if (zonaFilter === 'Todas') return true
  const z = school.zona?.trim()
  if (!z) return true
  return z === zonaFilter
}

export default function EscolasPage() {
  const [schools, setSchools] = useState<Escola[]>([])
  const [config, setConfig] = useState<Partial<EscolasPageConfig>>({
    titulo: 'Rede Municipal de Ensino',
    subtitulo: 'Encontre escolas da rede municipal por bairro, nível de ensino ou pesquise diretamente pelo nome da instituição.',
    placeholder_busca: 'Buscar escolas por nome, bairro ou endereço...',
    filtros_visiveis: [
      'Todos',
      'Educação Infantil',
      'Ensino Fundamental I',
      'Ensino Fundamental II',
      'EJA',
    ],
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalityFilter, setModalityFilter] = useState<string>('Todas')
  const [zonaFilter, setZonaFilter] = useState<string>('Todas')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const { data: configData } = await supabase
          .from('escolas_config')
          .select('*')
          .single()

        if (configData) setConfig(configData)

        const { data: schoolsData } = await supabase
          .from('escolas')
          .select('*')
          .eq('status', true)
          .order('ordem', { ascending: true })

        if (schoolsData) setSchools(schoolsData)
      } catch (error) {
        console.error('Erro ao carregar escolas:', error)
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [])

  const filteredSchools = schools.filter((school) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      school.nome.toLowerCase().includes(searchLower) ||
      school.endereco?.toLowerCase().includes(searchLower) ||
      school.tipos_ensino?.some((t) => t.toLowerCase().includes(searchLower)) ||
      school.modalidade?.toLowerCase().includes(searchLower)

    const matchesModality =
      modalityFilter === 'Todas' ||
      (school.tipos_ensino && school.tipos_ensino.includes(modalityFilter)) ||
      school.modalidade === modalityFilter

    return matchesSearch && matchesModality && matchesZone(school, zonaFilter)
  })

  const sortedSchools = [...filteredSchools].sort((a, b) => {
    switch (config.ordenacao_padrao) {
      case 'nome_asc':
        return a.nome.localeCompare(b.nome)
      case 'nome_desc':
        return b.nome.localeCompare(a.nome)
      case 'recentes':
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        )
      case 'ordem':
      default:
        return (a.ordem || 0) - (b.ordem || 0)
    }
  })

  function clearFilters() {
    setSearchTerm('')
    setModalityFilter('Todas')
    setZonaFilter('Todas')
  }

  const count = sortedSchools.length
  const countLabel =
    count === 1 ? '1 escola encontrada' : `${count} escolas encontradas`

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2545] dark:text-slate-100">
              Nossas Escolas
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Conheça todas as unidades da rede municipal
            </p>
          </div>
          <Badge variant="secondary" className="w-fit shrink-0">
            {countLabel}
          </Badge>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              className="h-9 pl-9"
              placeholder="Buscar escola..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={config.placeholder_busca || 'Buscar escola'}
            />
          </div>

          <Select
            value={modalityFilter}
            onValueChange={(v) => setModalityFilter(v ?? 'Todas')}
          >
            <SelectTrigger className="h-9 min-w-0 w-full sm:min-w-[200px] sm:flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODALITY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={zonaFilter} onValueChange={(v) => setZonaFilter(v ?? 'Todas')}>
            <SelectTrigger className="h-9 min-w-0 w-full sm:min-w-[140px] sm:flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ZONE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {sortedSchools.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
            <School
              className="mb-4 text-[#CBD5E1]"
              strokeWidth={1.25}
              size={64}
              aria-hidden
            />
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Nenhuma escola encontrada
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tente ajustar os filtros de busca
            </p>
            <Button variant="default" className="mt-6" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
              '[&>*:last-child:nth-child(3n-2)]:col-span-1',
            )}
          >
            {sortedSchools.map((school) => {
              const phone = school.telefone?.trim()
              const email = school.email?.trim()
              const overlayGradient =
                'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4))'

              return (
                <Card
                  key={school.id}
                  size="sm"
                  className={cn(
                    'group h-full min-h-0 gap-0 border border-slate-100 py-0 shadow-md ring-0 transition-all duration-300 ease-in-out',
                    'hover:-translate-y-[4px] hover:shadow-xl dark:border-slate-800',
                  )}
                >
                  <div className="relative h-48 w-full shrink-0 overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {school.imagem_url ? (
                      <img
                        src={school.imagem_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ background: overlayGradient }}
                    />
                    <Badge
                      className={cn(
                        'absolute top-3 left-3 z-10 max-w-[calc(100%-5rem)] truncate text-xs font-semibold shadow-sm sm:max-w-[70%]',
                        modalityBadgeClass(school.modalidade),
                      )}
                    >
                      {school.modalidade}
                    </Badge>
                    {school.nota_ideb != null && (
                      <Badge
                        className="absolute top-3 right-3 z-10 gap-1 border-0 bg-yellow-400 px-2 py-0.5 text-xs font-bold text-yellow-900 shadow-sm"
                      >
                        <Star className="size-3.5 fill-yellow-900" aria-hidden />
                        {school.nota_ideb} IDEB
                      </Badge>
                    )}
                  </div>

                  <CardContent className="flex min-h-0 flex-1 flex-col gap-0 pt-4 pb-2">
                    <h2 className="text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary dark:text-white">
                      {school.nome}
                    </h2>
                    <div className="mt-3 flex flex-1 flex-col gap-2">
                      {school.endereco?.trim() ? (
                        <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <MapPin
                            className="mt-0.5 size-4 shrink-0 text-[#0B4F8A]"
                            aria-hidden
                          />
                          <span>{school.endereco}</span>
                        </div>
                      ) : null}
                      {phone ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Phone
                            className="size-4 shrink-0 text-[#0B4F8A]"
                            aria-hidden
                          />
                          <span>{phone}</span>
                        </div>
                      ) : null}
                      {email ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Mail
                            className="size-4 shrink-0 text-[#0B4F8A]"
                            aria-hidden
                          />
                          <span className="truncate">{email}</span>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>

                  <CardFooter className="mt-auto border-t-0 bg-transparent p-4 pt-0">
                    <Button
                      variant="default"
                      size="lg"
                      className="group/btn h-10 w-full justify-between bg-[#0B4F8A] text-white hover:bg-[#0a3f72] dark:hover:bg-[#0a3f72]"
                      nativeButton={false}
                      render={<Link to={`/escolas/${school.slug}`} />}
                    >
                      Ver Detalhes
                      <ArrowRight className="size-4 transition-transform duration-300 ease-in-out group-hover/btn:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
