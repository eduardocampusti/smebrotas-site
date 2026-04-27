import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Servico } from '../../types'

export default function ServicoDetalhePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [servico, setServico] = useState<Servico | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServico() {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        navigate('/servicos')
        return
      }

      setServico(data as Servico)
      setLoading(false)
    }

    fetchServico()
  }, [slug, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!servico) return null

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link 
        to="/servicos"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-[var(--color-primary)] mb-8 transition-colors text-sm font-medium"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Voltar para Serviços
      </Link>

      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-6">
          <div className="size-16 md:size-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined !text-4xl md:!text-5xl">{servico.icone}</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {servico.titulo}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mt-2 leading-relaxed">
              {servico.resumo}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 flex flex-col gap-8">
            {servico.descricao && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Sobre o Serviço</h2>
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400"
                  dangerouslySetInnerHTML={{ __html: servico.descricao }}
                />
              </section>
            )}

            {servico.como_solicitar && (
              <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  Como Solicitar
                </h2>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {servico.como_solicitar}
                </p>
              </section>
            )}

            {servico.documentos && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  Documentos Necessários
                </h2>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed italic">
                      {servico.documentos}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Informações Úteis</h3>
              
              <div className="flex flex-col gap-6">
                {servico.publico_alvo && (
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary shrink-0">groups</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Público-alvo</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{servico.publico_alvo}</p>
                    </div>
                  </div>
                )}

                {servico.prazo && (
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary shrink-0">schedule</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Prazo Estimado</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{servico.prazo}</p>
                    </div>
                  </div>
                )}

                {servico.canal_atendimento && (
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary shrink-0">contact_support</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Onde Solicitar</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{servico.canal_atendimento}</p>
                    </div>
                  </div>
                )}
              </div>

              {servico.link_externo ? (
                <a 
                  href={servico.link_externo}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                  {servico.texto_link || 'Acessar Serviço'}
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                </a>
              ) : null}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-6 rounded-2xl">
              <div className="flex gap-3 text-amber-600 dark:text-amber-400 mb-2">
                <span className="material-symbols-outlined">warning</span>
                <p className="text-sm font-bold uppercase tracking-wider">Atenção</p>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                As informações contidas nesta página podem sofrer alterações sem aviso prévio. Em caso de dúvida, entre em contato com a Secretaria.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
