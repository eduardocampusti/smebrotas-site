import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../config/supabase'
import type { ContatoInfo, Faq } from '../../types'
import { toast } from 'sonner'

function normalizeContato(data: ContatoInfo): ContatoInfo {
  return {
    ...data,
    setores: Array.isArray(data.setores) ? data.setores : [],
    formulario_assuntos: Array.isArray(data.formulario_assuntos) ? data.formulario_assuntos : [],
    links_uteis: Array.isArray(data.links_uteis) ? data.links_uteis : [],
    redes_sociais: data.redes_sociais && typeof data.redes_sociais === 'object' ? data.redes_sociais : {},
    sede_titulo: data.sede_titulo || 'Sede da Secretaria',
    endereco_label: data.endereco_label || 'Endereço Principal',
    telefone_label: data.telefone_label || 'Telefone Geral',
    whatsapp_label: data.whatsapp_label || 'WhatsApp',
    email_label: data.email_label || 'E-mail Institucional',
    mapa_botao_texto: data.mapa_botao_texto || 'Abrir no Google Maps',
    formulario_titulo: data.formulario_titulo || 'Envie sua Mensagem',
    formulario_placeholder_mensagem: data.formulario_placeholder_mensagem || 'Descreva sua solicitação com detalhes...',
    formulario_botao_texto: data.formulario_botao_texto || 'Enviar Mensagem',
    formulario_mensagem_sucesso: data.formulario_mensagem_sucesso || 'Mensagem enviada com sucesso! Em breve retornaremos o contato.',
    faq_titulo: data.faq_titulo || 'Dúvidas Frequentes',
    faq_subtitulo: data.faq_subtitulo || 'Encontre respostas rápidas para as solicitações mais comuns.',
  }
}

export default function ContatoPage() {
  const [contato, setContato] = useState<ContatoInfo | null>(null)
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [contatoRes, faqRes] = await Promise.all([
          supabase.from('contato_info').select('*').single(),
          supabase.from('faq').select('*').eq('ativo', true).order('ordem', { ascending: true })
        ])

        if (contatoRes.data) setContato(normalizeContato(contatoRes.data as ContatoInfo))
        if (faqRes.data) setFaqs(faqRes.data as Faq[])
      } catch (error) {
        console.error('Erro ao carregar dados de contato:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    toast.success(contato?.formulario_mensagem_sucesso || 'Mensagem enviada com sucesso! Em breve retornaremos o contato.')
    const form = e.target as HTMLFormElement
    form.reset()
  }

  if (loading || !contato) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const setoresAtivos = contato.setores.filter((setor) => setor.ativo !== false)
  const redesSociais = Object.entries(contato.redes_sociais).filter(([, url]) => Boolean(url))
  const assuntosFormulario = contato.formulario_assuntos.filter(Boolean)
  const hasEndereco = Boolean(contato.endereco || contato.cep || contato.horario_funcionamento)
  const hasTelefone = Boolean(contato.telefone_geral || contato.telefone_secundario)
  const hasEmail = Boolean(contato.email_institucional || contato.email_contato)
  const hasMapa = Boolean(contato.mapa_url || contato.mapa_imagem_url)

  return (
    <>
      <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
          {contato.titulo_pagina}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-normal max-w-2xl">
          {contato.subtitulo_pagina}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mt-8">
        {/* Formulário */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">mail</span>
            {contato.formulario_titulo}
          </h2>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col w-full">
                <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Nome Completo *</span>
                <input className="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-slate-400 text-base outline-none" placeholder="Seu nome" required type="text"/>
              </label>
              <label className="flex flex-col w-full">
                <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">E-mail *</span>
                <input className="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-slate-400 text-base outline-none" placeholder="seu.email@exemplo.com" required type="email"/>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col w-full">
                <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Telefone (Opcional)</span>
                <input className="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 placeholder:text-slate-400 text-base outline-none" placeholder="(00) 00000-0000" type="tel"/>
              </label>
              <label className="flex flex-col w-full">
                <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Assunto *</span>
                <select className="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-base outline-none cursor-pointer" required defaultValue="">
                  <option disabled value="">Selecione um assunto</option>
                  {assuntosFormulario.map((assunto, i) => (
                    <option key={i} value={assunto}>{assunto}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <label className="flex flex-col w-full">
              <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Mensagem *</span>
              <textarea className="form-textarea flex w-full rounded-lg text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary p-4 placeholder:text-slate-400 text-base min-h-[160px] resize-y outline-none" placeholder={contato.formulario_placeholder_mensagem} required></textarea>
            </label>
            
            <div className="flex justify-end pt-2">
              <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition-all flex items-center gap-2" type="submit">
                <span>{contato.formulario_botao_texto}</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </form>
        </div>
        
        <div className="lg:col-span-5 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
          {/* Card Sede */}
          <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-primary/20">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{contato.sede_titulo}</h3>
            <div className="flex flex-col gap-4">
              {hasEndereco && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{contato.endereco_label}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {contato.endereco && <>{contato.endereco}<br/></>}
                      {contato.cep && <>CEP {contato.cep}<br/></>}
                      {contato.horario_funcionamento && <>Horário: {contato.horario_funcionamento}</>}
                    </p>
                  </div>
                </div>
              )}
              
              {hasTelefone && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">phone</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{contato.telefone_label}</p>
                      {contato.telefone_geral && <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{contato.telefone_geral}</p>}
                    </div>
                  </div>
                  {contato.telefone_secundario && (
                    <div className="flex items-center gap-3 ml-9">
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{contato.telefone_secundario}</p>
                    </div>
                  )}
                </div>
              )}

              {contato.whatsapp && (
                <a 
                  href={`https://wa.me/55${contato.whatsapp.replace(/\D/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-green-500">chat</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{contato.whatsapp_label}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{contato.whatsapp}</p>
                  </div>
                </a>
              )}

              {hasEmail && (
                <div className="flex flex-col gap-1 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">alternate_email</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{contato.email_label}</p>
                      {contato.email_institucional && <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{contato.email_institucional}</p>}
                    </div>
                  </div>
                  {contato.email_contato && (
                    <div className="flex items-center gap-3 ml-9">
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{contato.email_contato}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Redes Sociais */}
              {redesSociais.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-primary/20">
                  {redesSociais.map(([key, url]) => {
                    const iconMap: Record<string, string> = {
                      instagram: 'photo_camera',
                      facebook: 'facebook',
                      youtube: 'play_circle',
                      linkedin: 'link'
                    };

                    return (
                      <a 
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all"
                        title={key.charAt(0).toUpperCase() + key.slice(1)}
                      >
                        <span className="material-symbols-outlined">{iconMap[key] || 'link'}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Setores Dinâmicos */}
          {setoresAtivos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {setoresAtivos.map((setor, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">{setor.icone || 'group'}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{setor.nome}</h4>
                </div>
                {setor.telefone && <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">{setor.telefone}</p>}
                {setor.email && <p className="text-slate-500 text-xs truncate" title={setor.email}>{setor.email}</p>}
              </div>
              ))}
            </div>
          )}
          
          {/* Mapa Dinâmico */}
          {hasMapa && (
            <div 
              className="w-full h-48 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-cover bg-center"
              style={contato.mapa_imagem_url ? { backgroundImage: `url(${contato.mapa_imagem_url})` } : undefined}
            >
              <div className="absolute inset-0 bg-slate-900/30"></div>
              {contato.mapa_url && (
                <a className="relative bg-white text-slate-900 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-slate-50 transition-colors flex items-center gap-2 z-10" href={contato.mapa_url} rel="noopener noreferrer" target="_blank">
                  <span className="material-symbols-outlined text-primary">map</span>
                  {contato.mapa_botao_texto}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* FAQ Dinâmico */}
      {faqs.length > 0 && (
        <div className="mt-8 pt-10 border-t border-slate-200 dark:border-slate-800 max-w-4xl mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{contato.faq_titulo}</h2>
            <p className="text-slate-600 dark:text-slate-400">{contato.faq_subtitulo}</p>
          </div>
          
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <details key={faq.id} className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" open={i === 0}>
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden focus:outline-none">
                  {faq.pergunta}
                  <span className="material-symbols-outlined transform group-open:rotate-180 transition-transform text-slate-400">expand_more</span>
                </summary>
                <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <p className="pt-3">{faq.resposta}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
