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

        const promises = []

        promises.push(supabase.from('site_config').select('*').single())

        promises.push(
          supabase.from('noticias')
            .select('*')
            .eq('status', 'publicado')
            .order('destaque', { ascending: false })
            .order('data_publicacao', { ascending: false })
            .limit(6)
        )

        promises.push(
          supabase.from('acessos_rapidos').select('*').eq('ativo', true).order('ordem', { ascending: true })
        )

        const results = await Promise.allSettled(promises)

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
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err)
        setError('Ocorreu um erro ao carregar as informações do portal.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-[3px] border-slate-200 dark:border-slate-700" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-wide">Carregando portal...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Ops! Algo deu errado</h2>
        <p className="text-slate-500 max-w-md mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 h-11 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  const heroOpacidade = config?.hero_overlay_opacidade ?? 80
  const overlayRgba = `rgba(16, 25, 34, ${heroOpacidade / 100})`
  const heroImage = config?.hero_imagem_url || '/secretaria_foto.jpg'
  const tituloPrincipal = config?.titulo_principal || 'Educação Pública de Qualidade para Todos'
  const subtitulo = config?.subtitulo || 'Construindo o futuro da nossa cidade através do ensino integral.'

  const heroBotaoPri = config?.hero_botao_primario || { texto: '', link: '' }
  const heroBotaoSec = config?.hero_botao_secundario || { texto: '', link: '' }

  const estatisticasAtuais = (config?.estatisticas && Array.isArray(config.estatisticas))
    ? config.estatisticas.filter(a => a.ativo).sort((a, b) => a.ordem - b.ordem)
    : []

  const acessosPerfilAtuais = (config?.acessos_perfil && Array.isArray(config.acessos_perfil))
    ? config.acessos_perfil.filter(a => a.ativo).sort((a, b) => a.ordem - b.ordem)
    : []

  const isExternalLink = (url?: string) => Boolean(url?.startsWith('http'))

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="@container">
        <div
          className="relative flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-3xl
            items-start justify-end p-8 md:p-14 overflow-hidden group
            shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.18)]
            transition-shadow duration-500"
          style={{ backgroundImage: `linear-gradient(rgba(19, 127, 236, 0.25) 0%, ${overlayRgba} 100%), url("${heroImage}")` }}
        >
          {/* Subtle grain texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl animate-fade-in-up">
            <h1 className="text-4xl md:text-[3.25rem] font-bold text-white mb-4 leading-[1.15] tracking-[-0.02em] drop-shadow-sm">
              {tituloPrincipal}
            </h1>
            <p className="text-lg text-white/85 mb-8 leading-relaxed drop-shadow-sm">
              {subtitulo}
            </p>
            <div className="flex flex-wrap gap-4">
              {heroBotaoPri?.texto && heroBotaoPri?.link && (
                <a
                  href={heroBotaoPri.link}
                  target={isExternalLink(heroBotaoPri.link) ? '_blank' : undefined}
                  rel={isExternalLink(heroBotaoPri.link) ? 'noopener noreferrer' : undefined}
                  className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-[15px]
                    shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
                    hover:-translate-y-[2px] active:translate-y-0
                    transition-all duration-300 ease-out"
                >
                  {heroBotaoPri.texto}
                </a>
              )}
              {heroBotaoSec?.texto && heroBotaoSec?.link && (
                <a
                  href={heroBotaoSec.link}
                  target={isExternalLink(heroBotaoSec.link) ? '_blank' : undefined}
                  rel={isExternalLink(heroBotaoSec.link) ? 'noopener noreferrer' : undefined}
                  className="px-8 py-3.5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-[15px]
                    border border-white/20
                    hover:bg-white/20 hover:border-white/30
                    hover:-translate-y-[2px] active:translate-y-0
                    transition-all duration-300 ease-out"
                >
                  {heroBotaoSec.texto}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Notícias ── */}
      {noticias.length > 0 && (
        <section className="@container mt-14">
          <div className="flex flex-col gap-6 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[1.75rem] font-bold text-slate-800 dark:text-slate-200 tracking-[-0.02em]">
                {config?.noticias_secao_titulo || 'Últimas Notícias'}
              </h2>
              {config?.noticias_secao_link_texto && (
                <Link
                  to="/noticias"
                  className="px-5 h-10 bg-primary text-white rounded-xl font-bold text-[13px]
                    shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0
                    transition-all duration-300"
                >
                  {config.noticias_secao_link_texto}
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.map((noticia, i) => (
                <Link
                  key={noticia.id}
                  to={`/noticias/${noticia.slug}`}
                  className="group rounded-2xl bg-white dark:bg-slate-800/80 overflow-hidden
                    shadow-sm hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/40
                    hover:-translate-y-1
                    transition-all duration-300 ease-out
                    animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {noticia.imagem_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={noticia.imagem_url}
                        alt={noticia.titulo}
                        className="w-full h-52 object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full mb-3 tracking-wide uppercase">
                      {getCategoriaLabel(noticia.categoria)}
                    </span>
                    <h3 className="text-[17px] font-bold text-slate-800 dark:text-slate-200 mb-2 leading-snug group-hover:text-primary transition-colors duration-300">
                      {noticia.titulo}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {noticia.resumo}
                    </p>
                    {noticia.data_publicacao && (
                      <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(noticia.data_publicacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Acessos Rápidos ── */}
      {acessosRapidos.length > 0 && (
        <section className="@container">
          <div className="flex flex-col gap-6 py-8">
            <h2 className="text-[1.75rem] font-bold text-slate-800 dark:text-slate-200 tracking-[-0.02em]">
              {config?.acesso_rapido_titulo || 'Acesso Rápido'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {acessosRapidos.map((acesso, i) => (
                <a
                  key={acesso.id}
                  href={acesso.link}
                  target={isExternalLink(acesso.link) ? '_blank' : undefined}
                  rel={isExternalLink(acesso.link) ? 'noopener noreferrer' : undefined}
                  className="group rounded-2xl bg-white dark:bg-slate-800/80 p-6
                    shadow-sm hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/40
                    hover:-translate-y-1
                    transition-all duration-300 ease-out
                    animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {acesso.icone && (
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl
                      flex items-center justify-center mb-4
                      shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30
                      group-hover:scale-105
                      transition-all duration-300">
                      <span className="material-symbols-outlined text-2xl">{acesso.icone}</span>
                    </div>
                  )}
                  <h3 className="text-[17px] font-bold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-primary transition-colors duration-300">
                    {acesso.nome}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Estatísticas ── */}
      {estatisticasAtuais.length > 0 && (
        <section className="@container">
          <div className="flex flex-col gap-6 py-8">
            <h2 className="text-[1.75rem] font-bold text-slate-800 dark:text-slate-200 tracking-[-0.02em]">
              {config?.estatisticas_titulo || 'Estatísticas'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {estatisticasAtuais.map((stat, i) => (
                <div
                  key={stat.id}
                  className="rounded-2xl bg-white dark:bg-slate-800/80 p-6
                    shadow-sm hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/40
                    hover:-translate-y-0.5
                    transition-all duration-300 ease-out
                    animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {stat.icone && (
                      <div className="w-13 h-13 bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl
                        flex items-center justify-center
                        shadow-md shadow-primary/20
                        transition-all duration-300">
                        <span className="material-symbols-outlined text-xl">{stat.icone}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                        {stat.valor}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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

      {/* ── Perfis de Acesso ── */}
      {acessosPerfilAtuais.length > 0 && (
        <section className="@container">
          <div className="flex flex-col gap-6 py-8">
            <h2 className="text-[1.75rem] font-bold text-slate-800 dark:text-slate-200 tracking-[-0.02em]">
              {config?.acesso_perfil_titulo || 'Acesso por Perfil'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {acessosPerfilAtuais.map((perfil, i) => (
                <a
                  key={perfil.id}
                  href={perfil.link}
                  target={isExternalLink(perfil.link) ? '_blank' : undefined}
                  rel={isExternalLink(perfil.link) ? 'noopener noreferrer' : undefined}
                  className="group rounded-2xl bg-white dark:bg-slate-800/80 p-6
                    shadow-sm hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/40
                    hover:-translate-y-1
                    transition-all duration-300 ease-out
                    animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {perfil.icone && (
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl
                      flex items-center justify-center mb-4
                      shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30
                      group-hover:scale-105
                      transition-all duration-300">
                      <span className="material-symbols-outlined text-2xl">{perfil.icone}</span>
                    </div>
                  )}
                  <h3 className="text-[17px] font-bold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-primary transition-colors duration-300">
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
