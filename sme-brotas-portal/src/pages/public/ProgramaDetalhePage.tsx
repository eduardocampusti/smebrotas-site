import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import type { Programa } from '../../types'
import { toast } from 'sonner'

export default function ProgramaDetalhePage() {
  const { slug } = useParams<{ slug: string }>()
  const [programa, setPrograma] = useState<Programa | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrograma() {
      try {
        const { data, error } = await supabase
          .from('programas')
          .select('*')
          .eq('slug', slug)
          .eq('ativo', true)
          .single()

        if (error) throw error
        setPrograma(data)
      } catch (error) {
        console.error('Erro ao buscar programa:', error)
        toast.error('Não foi possível carregar as informações do programa.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchPrograma()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  if (!programa) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Programa não encontrado</h2>
        <Link to="/programas" className="text-[var(--color-primary)] hover:underline">
          Voltar para a lista de programas
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-slate-900 flex items-center justify-center overflow-hidden">
        {programa.imagem_url && (
          <img
            src={programa.imagem_url}
            alt={programa.titulo}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Link 
            to="/programas" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Voltar para Programas
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{programa.titulo}</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">{programa.resumo}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="md:col-span-2">
                <div className="prose prose-lg max-w-none prose-slate prose-headings:text-[var(--color-primary)]">
                  <h3 className="text-2xl font-bold mb-4">Sobre o Programa</h3>
                  <div dangerouslySetInnerHTML={{ __html: programa.descricao || '' }} />
                  
                  {programa.objetivos && (
                    <>
                      <h3 className="text-2xl font-bold mt-12 mb-4">Objetivos</h3>
                      <div dangerouslySetInnerHTML={{ __html: programa.objetivos }} />
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <h4 className="text-xl font-bold text-slate-800 mb-6">Informações</h4>
                  
                  {programa.publico_alvo && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Público Alvo</p>
                      <p className="text-slate-700">{programa.publico_alvo}</p>
                    </div>
                  )}

                  {programa.categoria && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Categoria</p>
                      <span className="inline-block px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium rounded-full">
                        {programa.categoria}
                      </span>
                    </div>
                  )}

                  {programa.link_botao && (
                    <a
                      href={programa.link_botao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:bg-[var(--color-primary-dark)] transition-all shadow-lg shadow-[var(--color-primary)]/20 mt-4"
                    >
                      {programa.texto_botao || 'Saiba Mais'}
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
