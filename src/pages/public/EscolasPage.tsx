import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Escola, EscolasPageConfig } from '../../types'

export default function EscolasPage() {
  const [schools, setSchools] = useState<Escola[]>([])
  const [config, setConfig] = useState<Partial<EscolasPageConfig>>({
    titulo: 'Rede Municipal de Ensino',
    subtitulo: 'Encontre escolas da rede municipal por bairro, nível de ensino ou pesquise diretamente pelo nome da instituição.',
    placeholder_busca: 'Buscar escolas por nome, bairro ou endereço...',
    filtros_visiveis: ['Todos', 'Educação Infantil', 'Ensino Fundamental I', 'Ensino Fundamental II', 'EJA']
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('Todos')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      
      // Carregar Config
      const { data: configData } = await supabase
        .from('escolas_config')
        .select('*')
        .single()
      
      if (configData) setConfig(configData)

      // Carregar Escolas
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

  const filteredSchools = schools.filter(school => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = school.nome.toLowerCase().includes(searchLower) ||
                         school.endereco?.toLowerCase().includes(searchLower) ||
                         school.tipos_ensino?.some(t => t.toLowerCase().includes(searchLower)) ||
                         school.modalidade?.toLowerCase().includes(searchLower)
    
    const matchesFilter = activeFilter === 'Todos' || 
                         (school.tipos_ensino && school.tipos_ensino.includes(activeFilter)) ||
                         school.modalidade === activeFilter
    
    return matchesSearch && matchesFilter
  })

  const sortedSchools = [...filteredSchools].sort((a, b) => {
    switch (config.ordenacao_padrao) {
      case 'nome_asc':
        return a.nome.localeCompare(b.nome)
      case 'nome_desc':
        return b.nome.localeCompare(a.nome)
      case 'recentes':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      case 'ordem':
      default:
        return (a.ordem || 0) - (b.ordem || 0)
    }
  })

  const getBadgeColor = (modalidade: string) => {
    switch (modalidade?.toLowerCase()) {
      case 'infantil': return 'bg-primary'
      case 'fundamental i': return 'bg-emerald-600'
      case 'fundamental ii': return 'bg-amber-600'
      case 'eja': return 'bg-purple-600'
      default: return 'bg-slate-500'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-4 md:p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">{config.titulo}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed max-w-2xl">{config.subtitulo}</p>
        </div>
        
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex w-full items-stretch rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="text-slate-400 flex items-center justify-center pl-4 pr-2">
              <span className="material-symbols-outlined text-2xl">search</span>
            </div>
            <input 
              className="form-input flex w-full min-w-0 flex-1 resize-none text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-transparent h-14 placeholder:text-slate-400 px-2 text-base md:text-lg font-normal" 
              placeholder={config.placeholder_busca}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center mt-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">Filtrar por:</span>
            {(config.filtros_visiveis || ['Todos']).map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-colors shadow-sm text-sm font-medium ${
                  activeFilter === filter 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Mostrando <span className="text-slate-900 dark:text-white font-bold">{filteredSchools.length}</span> {config.contador_texto || 'escolas encontradas'}
          </p>
        </div>
        
        {sortedSchools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
            <p className="text-slate-500 font-medium">Nenhuma escola encontrada para sua busca.</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveFilter('Todos'); }}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedSchools.map((school) => (
              <div key={school.id} className="flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group">
                <div 
                  className="w-full bg-slate-200 dark:bg-slate-800 aspect-video bg-cover bg-center relative overflow-hidden" 
                  style={{backgroundImage: school.imagem_url ? `url("${school.imagem_url}")` : 'none'}}
                >
                  <div className={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm ${getBadgeColor(school.modalidade)}`}>
                      {school.modalidade}
                  </div>
                  {school.nota_ideb && (
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-amber-500">star</span> {school.nota_ideb} IDEB
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                    {school.nome}
                  </h3>
                  <div className="flex flex-col gap-2 mt-auto text-slate-600 dark:text-slate-400 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-base shrink-0 mt-0.5 text-slate-400">location_on</span>
                      <span>{school.endereco}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base shrink-0 text-slate-400">call</span>
                      <span>{school.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base shrink-0 text-slate-400">mail</span>
                      <span className="truncate">{school.email}</span>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2.5 rounded-lg transition-colors" to={`/escolas/${school.slug}`}>
                      <span>Ver Detalhes</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
