import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { SiteConfig, Noticia, AcessoRapido } from '../../types'
import { getCategoriaLabel } from '../../constants/noticias'

export default function HomePage() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [acessosRapidos, setAcessosRapidos] = useState<AcessoRapido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        // Usa Promise.allSettled para tolerar falhas em queries opcionais
        const promises = []
        
        // Config do site (obrigatória)
        promises.push(supabase.from('site_config').select('*').single())
        
        // Notícias (opcional - pode falhar se tabela não existir)
        promises.push(
          supabase.from('noticias')
            .select('*')
            .eq('status', 'publicado')
            .order('destaque', { ascending: false })
            .order('data_publicacao', { ascending: false })
            .limit(6)
        )
        
        // Acessos rápidos (opcional - pode falhar se tabela não existir)
        promises.push(
          supabase.from('acessos_rapidos').select('*').eq('ativo', true).order('ordem', { ascending: true })
        )

        const results = await Promise.allSettled(promises)
        
        // Processa os resultados
        if (results[0].status === 'fulfilled') {
          const configRes = results[0].value
          if (configRes.data && !configRes.error) {
            setConfig(configRes.data as SiteConfig)
          }
        }

        if (results[1].status === 'fulfilled') {
          const noticiasRes = results[1].value
          if (noticiasRes.data && !noticiasRes.error) {
            setNoticias(noticiasRes.data as Noticia[])
          }
        }

        if (results[2].status === 'fulfilled') {
          const acessosRapidosRes = results[2].value
          if (acessosRapidosRes.data && !acessosRapidosRes.error) {
            setAcessosRapidos(acessosRapidosRes.data as AcessoRapido[])
          }
        }

        console.log('✅ HomePage - Dados carregados:', {
          config: !!config,
          noticias: noticias.length,
          acessosRapidos: acessosRapidos.length
        })

      } catch (err: any) {
        console.error('Erro ao carregar dados:', err)
        setError('Ocorreu um erro ao carregar as informações do portal.')
      } finally {
        setLoading(false)
        console.log('✅ HomePage - Loading finalizado')
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 animate-in fade-in duration-700">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Carregando portal...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Ops! Algo deu errado</h2>
        <p className="text-slate-500 max-w-md mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 h-11 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  // Define defaults in case config lacks fields
  const heroOpacidade = config?.hero_overlay_opacidade ?? 80
  const overlayRgba = `rgba(16, 25, 34, ${heroOpacidade / 100})`
  const heroImage = config?.hero_imagem_url || '/secretaria_foto.jpg'
  const tituloPrincipal = config?.titulo_principal || 'Educação Pública de Qualidade para Todos'
  const subtitulo = config?.subtitulo || 'Construindo o futuro da nossa cidade através do ensino integral.'
  
  const heroBotaoPri = config?.hero_botao_primario || { texto: '', link: '' }
  const heroBotaoSec = config?.hero_botao_secundario || { texto: '', link: '' }

  // Estatisticas - Exibir apenas se houver dados ativos no banco
  const estatisticasAtuais = (config?.estatisticas && Array.isArray(config.estatisticas))
    ? config.estatisticas.filter(a => a.ativo).sort((a,b) => a.ordem - b.ordem)
    : []
  
  // Perfis de Acesso - Exibir apenas se houver dados ativos no banco
  const acessosPerfilAtuais = (config?.acessos_perfil && Array.isArray(config.acessos_perfil))
    ? config.acessos_perfil.filter(a => a.ativo).sort((a,b) => a.ordem - b.ordem)
    : []

  // Helper to render links (handles external target="_blank" check)
  const isExternalLink = (url?: string) => Boolean(url?.startsWith('http'))
  
  return (
    <>
      {/* Hero Section */}
      <section className="@container">
        <div className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-2xl items-start justify-end p-8 md:p-12 relative overflow-hidden group shadow-xl" style={{ backgroundImage: `linear-gradient(rgba(19, 127, 236, 0.2) 0%, ${overlayRgba} 100%), url("${heroImage}")` }}>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {tituloPrincipal}
            </h1>
            <p className="text-lg text-white/90 mb-6">
              {subtitulo}
            </p>
            <div className="flex flex-wrap gap-4">
              {heroBotaoPri?.texto && heroBotaoPri?.link && (
                <a 
                  href={heroBotaoPri.link}
                  target={isExternalLink(heroBotaoPri.link) ? '_blank' : undefined}
                  rel={isExternalLink(heroBotaoPri.link) ? 'noopener noreferrer' : undefined}
                  className="px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg"
                >
                  {heroBotaoPri.texto}
                </a>
              )}
              {heroBotaoSec?.texto && heroBotaoSec?.link && (
                <a 
                  href={heroBotaoSec.link}
                  target={isExternalLink(heroBotaoSec.link) ? '_blank' : undefined}
                  rel={isExternalLink(heroBotaoSec.link) ? 'noopener noreferrer' : undefined}
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-white/20 transition-colors"
                >
                  {heroBotaoSec.texto}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Notícias */}
      {(noticias && noticias.length > 0) && (
        <section className="@container mt-12">
          <div className="flex flex-col gap-4 py-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                {config?.noticias_secao_titulo || 'Últimas Notícias'}
              </h2>
              {config?.noticias_secao_link_texto && (
                <Link 
                  to="/noticias" 
                  className="px-5 h-10 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
                >
                  {config.noticias_secao_link_texto}
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.map((noticia) => (
                <Link 
                  key={noticia.id} 
                  to={`/noticias/${noticia.slug}`}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                >
                  {noticia.imagem_url && (
                    <img 
                      src={noticia.imagem_url} 
                      alt={noticia.titulo}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-3">
                    {getCategoriaLabel(noticia.categoria)}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-primary transition-colors">
                    {noticia.titulo}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                    {noticia.resumo}
                  </p>
                  {noticia.data_publicacao && (
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {new Date(noticia.data_publicacao).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Acessos Rápidos */}
      {(acessosRapidos && acessosRapidos.length > 0) && (
        <section className="@container">
          <div className="flex flex-col gap-4 py-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              {config?.acesso_rapido_titulo || 'Acesso Rápido'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {acessosRapidos.map((acesso) => (
                <a 
                  key={acesso.id}
                  href={acesso.link}
                  target={isExternalLink(acesso.link) ? '_blank' : undefined}
                  rel={isExternalLink(acesso.link) ? 'noopener noreferrer' : undefined}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                >
                  {acesso.icone && (
                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-2xl">{acesso.icone}</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-primary transition-colors">
                    {acesso.nome}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Estatísticas */}
      {(estatisticasAtuais && estatisticasAtuais.length > 0) && (
        <section className="@container">
          <div className="flex flex-col gap-4 py-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              {config?.estatisticas_titulo || 'Estatísticas'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {estatisticasAtuais.map((stat) => (
                <div key={stat.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                  <div className="flex items-center gap-4">
                    {stat.icone && (
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">{stat.icone}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {stat.valor}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {stat.nome}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Perfis de Acesso */}
      {(acessosPerfilAtuais && acessosPerfilAtuais.length > 0) && (
        <section className="@container">
          <div className="flex flex-col gap-4 py-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              {config?.acesso_perfil_titulo || 'Acesso por Perfil'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {acessosPerfilAtuais.map((perfil) => (
                <a 
                  key={perfil.id}
                  href={perfil.link}
                  target={isExternalLink(perfil.link) ? '_blank' : undefined}
                  rel={isExternalLink(perfil.link) ? 'noopener noreferrer' : undefined}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                >
                  {perfil.icone && (
                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-2xl">{perfil.icone}</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-primary transition-colors">
                    {perfil.nome}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}