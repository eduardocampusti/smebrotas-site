import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Programa } from '../../types'

export default function ProgramasPage() {
  const [searchParams] = useSearchParams()
  const categoriaFilter = searchParams.get('categoria')
  
  const [programas, setProgramas] = useState<Programa[]>([])
  const [categorias, setCategorias] = useState<{ id: string | null; label: string }[]>([{ id: null, label: 'Todos' }])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const { data, error } = await supabase
          .from('programas')
          .select('categoria')
          .eq('ativo', true)
          .not('categoria', 'is', null)

        if (error) throw error

        const uniqueCategories = Array.from(new Set(data.map(item => item.categoria)))
          .filter(Boolean)
          .sort()
          .map(cat => ({
            id: cat!.toLowerCase().replace(/\s+/g, '-'),
            label: cat!
          }))

        setCategorias([{ id: null, label: 'Todos' }, ...uniqueCategories])
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }

    fetchCategorias()
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



  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]">Programas e Projetos Pedagógicos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal max-w-3xl">Conheça as iniciativas que transformam a educação em nossa rede municipal, promovendo aprendizado, inclusão e inovação.</p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          {categorias.map(cat => (
            <Link 
              key={cat.label}
              to={cat.id ? `/programas?categoria=${cat.id}` : '/programas'} 
              className={`inline-flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-bold leading-normal transition-colors ${
                (categoriaFilter === cat.id || (!categoriaFilter && !cat.id))
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col gap-4">
                <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : programas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programas.map((programa) => (
              <Link key={programa.id} to={`/programas/${programa.slug}`} className="flex flex-col gap-4 group cursor-pointer">
                <div 
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl overflow-hidden relative" 
                  style={{backgroundImage: `url("${programa.imagem_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop'}")`}}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  {programa.categoria && (
                    <span className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-xs font-bold px-2 py-1 rounded capitalize">
                      {programa.categoria}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold leading-snug group-hover:text-primary transition-colors">{programa.titulo}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-relaxed line-clamp-2">{programa.resumo}</p>
                  <span className="text-primary text-sm font-bold leading-normal mt-2 inline-flex items-center gap-1 group-hover:underline">
                    Saiba mais <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Nenhum programa encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400">Tente ajustar sua busca ou filtro.</p>
          </div>
        )}
      </div>
    </>
  )
}
