import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Noticia } from '../../types'
import { CATEGORIAS_NOTICIAS, getCategoriaLabel } from '../../constants/noticias'

const CATEGORIAS_SIDEBAR = [
  { id: 'todas', label: 'Todas as Notícias', icon: 'newspaper' },
  ...CATEGORIAS_NOTICIAS
]

const ITEMS_PER_PAGE = 9

export default function NoticiasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaAtiva = searchParams.get('categoria') || 'todas'
  const paginaAtiva = parseInt(searchParams.get('page') || '1')
  
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    async function fetchNoticias() {
      setLoading(true)
      const from = (paginaAtiva - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('noticias')
        .select('*', { count: 'exact' })
        .eq('status', 'publicado')
        .order('data_publicacao', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (categoriaAtiva !== 'todas') {
        query = query.eq('categoria', categoriaAtiva)
      }

      const { data, count } = await query
      if (data) setNoticias(data as Noticia[])
      if (count !== null) setTotalCount(count)
      setLoading(false)
    }

    fetchNoticias()
    // Scroll to top when page/category changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [categoriaAtiva, paginaAtiva])

  // Lógica de Destaque (apenas na primeira página e sem categoria específica ou se houver marcada)
  const noticiaDestaque = (paginaAtiva === 1) 
    ? (noticias.find(n => n.destaque) || noticias[0])
    : null
    
  const outrasNoticias = noticiaDestaque 
    ? noticias.filter(n => n.id !== noticiaDestaque.id)
    : noticias

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handlePageChange = (newPage: number) => {
    setSearchParams({ categoria: categoriaAtiva, page: newPage.toString() })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]">Notícias e Comunicados Oficiais</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Fique por dentro das últimas novidades da Secretaria Municipal de Educação.</p>
          </div>
          
          {noticiaDestaque ? (
            <Link 
              to={`/noticias/${noticiaDestaque.slug}`} 
              className="relative group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 block hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="aspect-[21/9] w-full bg-cover bg-center relative transition-transform duration-700 group-hover:scale-105" 
                style={{backgroundImage: `url("${noticiaDestaque.imagem_url || 'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=2071&auto=format&fit=crop'}")`}}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      {noticiaDestaque.destaque ? 'Destaque' : getCategoriaLabel(noticiaDestaque.categoria)}
                    </span>
                    <span className="text-slate-200 text-sm font-medium">
                      {new Date(noticiaDestaque.data_publicacao || noticiaDestaque.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight max-w-3xl group-hover:text-primary transition-colors">
                    {noticiaDestaque.titulo}
                  </h2>
                </div>
              </div>
            </Link>
          ) : !noticias.length && (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">newspaper</span>
              <p className="text-slate-500">Nenhuma notícia encontrada nesta categoria.</p>
            </div>
          )}
        </section>
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Categorias</h3>
              <ul className="flex flex-col gap-1">
                {CATEGORIAS_SIDEBAR.map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => setSearchParams({ categoria: cat.id, page: '1' })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${
                        categoriaAtiva === cat.id 
                          ? 'bg-primary/10 text-primary font-bold border border-primary/20' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                        <span className="text-sm">{cat.label}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          
          {/* Grid de Notícias */}
          <section className="flex-1 flex flex-col gap-8">
            {outrasNoticias.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {outrasNoticias.map((noticia) => (
                  <Link 
                    key={noticia.id} 
                    to={`/noticias/${noticia.slug}`} 
                    className="group flex flex-col gap-4 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-full aspect-video relative overflow-hidden">
                      <img 
                        src={noticia.imagem_url || 'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=2071&auto=format&fit=crop'} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-primary text-[9px] font-black uppercase tracking-wider rounded border border-slate-100 dark:border-slate-800">
                          {getCategoriaLabel(noticia.categoria)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 p-5 pt-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        <span>{new Date(noticia.data_publicacao || noticia.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {noticia.titulo}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                        {noticia.resumo}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              !loading && !noticiaDestaque && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">search_off</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nenhuma notícia encontrada</h3>
                  <p className="text-slate-500 mt-2">Não encontramos resultados para os filtros selecionados.</p>
                </div>
              )
            )}
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => handlePageChange(paginaAtiva - 1)}
                  disabled={paginaAtiva === 1}
                  className="flex items-center justify-center size-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`size-10 rounded-lg text-sm font-bold transition-all ${
                        paginaAtiva === i + 1
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => handlePageChange(paginaAtiva + 1)}
                  disabled={paginaAtiva === totalPages}
                  className="flex items-center justify-center size-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
