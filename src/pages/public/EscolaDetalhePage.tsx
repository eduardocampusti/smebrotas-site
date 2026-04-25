import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Escola } from '../../types'

export default function EscolaDetalhePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [school, setSchool] = useState<Escola | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchSchool()
    }
  }, [slug])

  // SEO Dinâmico
  useEffect(() => {
    if (school) {
      document.title = `${school.nome} - Rede Municipal de Ensino - SME Brotas`
      
      // Update meta description if possible (simple way)
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute('content', school.descricao_curta || `Conheça a unidade escolar ${school.nome} da Rede Municipal de Ensino de Brotas.`)
      }
    }
    
    return () => {
      document.title = 'SME Brotas - Secretaria Municipal de Educação'
    }
  }, [school])

  async function fetchSchool() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .eq('slug', slug)
        .eq('status', true)
        .single()

      if (error || !data) {
        console.error('Escola não encontrada:', error)
        navigate('/escolas')
        return
      }

      setSchool(data)
    } catch (error) {
      console.error('Erro ao carregar detalhes da escola:', error)
      navigate('/escolas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse p-4 md:p-6 max-w-6xl mx-auto">
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="h-10 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-60 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!school) return null

  const getBadgeColor = (modalidade: string) => {
    switch (modalidade?.toLowerCase()) {
      case 'infantil': return 'bg-primary'
      case 'fundamental i': return 'bg-emerald-600'
      case 'fundamental ii': return 'bg-amber-600'
      case 'eja': return 'bg-purple-600'
      case 'educação especial': return 'bg-indigo-600'
      case 'ensino médio': return 'bg-rose-600'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      {/* Navegação */}
      <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500 overflow-hidden">
        <Link to="/" className="hover:text-primary transition-colors shrink-0">Início</Link>
        <span className="material-symbols-outlined text-[16px] shrink-0">chevron_right</span>
        <Link to="/escolas" className="hover:text-primary transition-colors shrink-0">Rede Municipal</Link>
        <span className="material-symbols-outlined text-[16px] shrink-0">chevron_right</span>
        <span className="text-slate-900 dark:text-white truncate font-bold">{school.nome}</span>
      </nav>

      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none mb-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row">
          {/* Imagem de Capa */}
          <div className="lg:w-1/2 aspect-video lg:aspect-auto h-full min-h-[350px] bg-slate-100 dark:bg-slate-800 relative group overflow-hidden">
            {school.imagem_url ? (
              <img 
                src={school.imagem_url} 
                alt={school.nome} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <span className="material-symbols-outlined text-8xl">school</span>
              </div>
            )}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-10">
              {(school.tipos_ensino && school.tipos_ensino.length > 0 ? school.tipos_ensino : [school.modalidade]).map((m, idx) => (
                <div key={idx} className={`text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider ${getBadgeColor(m)}`}>
                  {m}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
          </div>

          {/* Informações Básicas */}
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-8">
              {school.nome}
            </h1>
            
            <div className="flex flex-col gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço</p>
                  <p className="text-slate-900 dark:text-white font-bold leading-snug">
                    {school.logradouro ? (
                      <>
                        {school.logradouro}, {school.numero || 'S/N'}
                        {school.complemento && ` - ${school.complemento}`}<br />
                        {school.bairro && `${school.bairro} - `}{school.cidade || 'Brotas'} - {school.estado || 'SP'}
                        {school.cep && <span className="block text-xs font-medium text-slate-400 mt-1">CEP: {school.cep}</span>}
                      </>
                    ) : (
                      school.endereco
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                    <p className="text-slate-900 dark:text-white font-bold">{school.telefone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                    <p className="text-slate-900 dark:text-white font-bold truncate break-all">{school.email}</p>
                  </div>
                </div>

                {school.contato_complementar && (
                  <div className="flex items-start gap-4 group md:col-span-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                      <span className="material-symbols-outlined">share</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outros Contatos</p>
                      <p className="text-slate-900 dark:text-white font-bold">{school.contato_complementar}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {school.nota_ideb && (
              <div className="mt-10 p-5 bg-amber-500/5 dark:bg-amber-500/10 rounded-3xl flex items-center gap-5 border border-amber-500/20">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
                  <span className="material-symbols-outlined text-3xl">military_tech</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Nota IDEB</p>
                  <div className="flex items-end gap-1">
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{school.nota_ideb}</p>
                    <span className="text-sm font-bold text-slate-400 mb-1">/ 10</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* Coluna Esquerda: Sobre e Outros */}
        <div className="lg:col-span-2 flex flex-col gap-16">
          {/* Descrição */}
          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
              <span className="w-3 h-10 bg-primary rounded-full shadow-lg shadow-primary/20" />
              Sobre a Unidade
            </h2>
            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">
              {school.descricao_completa || school.descricao_curta || 'Informações sobre a escola em breve.'}
            </div>
          </section>

          {/* Informações Institucionais */}
          {school.infos_institucionais && (
            <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                <span className="w-3 h-10 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20" />
                Informações Institucionais
              </h2>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800/50">
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-medium italic">
                  {school.infos_institucionais}
                </div>
              </div>
            </section>
          )}

          {/* Galeria de Fotos */}
          {school.galeria && school.galeria.length > 0 && (
            <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                <span className="w-3 h-10 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20" />
                Galeria de Fotos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {school.galeria.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className="aspect-square rounded-3xl overflow-hidden shadow-sm hover:shadow-xl group relative"
                  >
                    <img 
                      src={img} 
                      alt={`Galeria ${school.nome}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                       <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all text-4xl">zoom_in</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Localização / Mapa */}
          <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
              <span className="w-3 h-10 bg-amber-500 rounded-full shadow-lg shadow-amber-500/20" />
              Localização
            </h2>
            <div className="w-full h-[450px] rounded-[40px] bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-inner group">
              {school.coordenadas?.lat && school.coordenadas?.lng ? (
                <iframe
                  title="Mapa da Escola"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${school.coordenadas.lat},${school.coordenadas.lng}&z=16&output=embed`}
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-6 animate-bounce">
                    <span className="material-symbols-outlined text-4xl text-primary">map</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Veja a localização no mapa</h4>
                  <p className="text-sm max-w-sm mb-8 font-medium">Acesse o mapa interativo para ver a rota exata até a unidade escolar.</p>
                  <a 
                    href={school.coordenadas?.lat && school.coordenadas?.lng 
                      ? `https://www.google.com/maps/dir/?api=1&destination=${school.coordenadas.lat},${school.coordenadas.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${school.nome}, ${school.endereco || school.logradouro || ''}, Brotas, SP`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-10 py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined">directions</span>
                    TRAÇAR ROTA NO GOOGLE MAPS
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Coluna Direita: Sidebar */}
        <div className="flex flex-col gap-8 animate-slide-right">
          {/* Gestão */}
          <div className="p-10 bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              Gestão Escolar
            </h3>
            
            <div className="flex flex-col gap-10">
              <div className="relative">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gestor Responsável</p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">person</span>
                  </div>
                  <p className="text-slate-900 dark:text-white font-black text-lg leading-tight">{school.gestor_responsavel || 'Não informado'}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Horário de Funcionamento</p>
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'Manhã', val: school.horarios?.manha, icon: 'light_mode', color: 'text-amber-500' },
                    { label: 'Tarde', val: school.horarios?.tarde, icon: 'wb_sunny', color: 'text-orange-500' },
                    { label: 'Noite', val: school.horarios?.noite, icon: 'dark_mode', color: 'text-indigo-500' }
                  ].map((h, i) => {
                    const formatTime = (val: any) => {
                      if (!val) return 'Não disponível'
                      if (typeof val === 'string') return val
                      if (val.inicio && val.fim) return `${val.inicio} às ${val.fim}`
                      if (val.inicio) return `Inicia às ${val.inicio}`
                      if (val.fim) return `Até às ${val.fim}`
                      return 'Não disponível'
                    }
                    
                    return (
                      <div key={i} className={`flex items-center justify-between py-4 ${i !== 2 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-xl ${h.color}`}>{h.icon}</span>
                          <span className="text-sm font-bold text-slate-500">{h.label}</span>
                        </div>
                        <span className={`text-sm font-black ${h.val ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
                          {formatTime(h.val)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Links Úteis */}
          {school.links_uteis && school.links_uteis.length > 0 && (
            <div className="p-10 bg-slate-900 dark:bg-primary/10 rounded-[40px] shadow-2xl shadow-slate-200 dark:shadow-none text-white dark:text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
              <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
                <span className="material-symbols-outlined">link</span>
                Recursos e Links
              </h3>
              <div className="flex flex-col gap-4 relative z-10">
                {school.links_uteis.map((link, idx) => (
                  <a 
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-3xl transition-all group border border-white/5"
                  >
                    <span className="font-bold text-sm">{link.titulo}</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform bg-white/20 p-2 rounded-full">arrow_forward</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* CTA Contato */}
          <div className="p-10 bg-primary rounded-[40px] shadow-xl shadow-primary/30 text-white relative overflow-hidden group">
             <div className="absolute bottom-0 left-0 w-full h-2 bg-white/20" />
            <h3 className="text-2xl font-black mb-6 relative z-10 leading-tight">Dúvidas sobre Matrículas?</h3>
            <p className="text-white/80 text-base mb-10 leading-relaxed relative z-10 font-medium">
              Entre em contato com o setor de Atendimento ao Cidadão da SME para informações sobre vagas e documentação.
            </p>
            <Link 
              to="/contato"
              className="w-full flex items-center justify-center gap-3 bg-white text-primary font-black py-5 rounded-[24px] hover:scale-[1.02] transition-all shadow-xl relative z-10"
            >
              FALAR COM A SECRETARIA
              <span className="material-symbols-outlined">send</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveImage(null)}
        >
          <button 
            className="absolute top-8 right-8 text-white w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"
            onClick={() => setActiveImage(null)}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <img 
            src={activeImage} 
            alt="Visualização" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-zoom-in"
          />
        </div>
      )}
    </div>
  )
}
