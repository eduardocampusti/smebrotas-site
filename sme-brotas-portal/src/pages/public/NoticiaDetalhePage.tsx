import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Noticia } from '../../types'
import { getCategoriaLabel } from '../../constants/noticias'

import DOMPurify from 'dompurify'

export default function NoticiaDetalhePage() {
  const { slug } = useParams()
  const [noticia, setNoticia] = useState<Noticia | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNoticia() {
      setLoading(true)
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'publicado')
        .single()

      if (error || !data) {
        console.error('Erro ao buscar notícia:', error)
        // Se não encontrar, poderíamos redirecionar ou mostrar erro 404
        setLoading(false)
        return
      }

      setNoticia(data as Noticia)
      setLoading(false)
    }

    if (slug) {
      fetchNoticia()
    }
  }, [slug])

  // Função para formatar o conteúdo (suporta HTML vindo do editor rico)
  const renderConteudo = (content: string) => {
    if (!content) return null
    
    // Verifica se o conteúdo é HTML (se tem tags)
    const isHtml = /<[a-z][\s\S]*>/i.test(content)
    
    if (isHtml) {
      return (
        <div 
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
        />
      )
    }

    // Fallback para conteúdo legado (apenas texto com quebras de linha)
    return content.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
      <p key={index} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
        {paragraph}
      </p>
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!noticia) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full">
          <span className="material-symbols-outlined text-6xl text-slate-400">search_off</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notícia não encontrada</h1>
          <p className="text-slate-500 mt-2">A publicação que você procura não existe ou foi removida.</p>
        </div>
        <Link 
          to="/noticias" 
          className="px-6 h-12 flex items-center justify-center bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Ver todas as notícias
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb / Back */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-primary transition-colors">Início</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to="/noticias" className="hover:text-primary transition-colors">Notícias</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-md">{noticia.titulo}</span>
      </nav>

      <article className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
              {getCategoriaLabel(noticia.categoria)}
            </span>
            <span className="text-slate-400 text-sm font-medium">
              {new Date(noticia.data_publicacao || noticia.created_at).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
            {noticia.titulo}
          </h1>
          
          {noticia.resumo && (
            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed border-l-4 border-primary/30 pl-6 italic">
              {noticia.resumo}
            </p>
          )}
        </header>

        {noticia.imagem_url && (
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-slate-800">
            <img 
              src={noticia.imagem_url} 
              alt={noticia.titulo} 
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm prose prose-slate dark:prose-invert max-w-none">
          {renderConteudo(noticia.conteudo)}
        </div>

        {/* Footer da Notícia */}
        <footer className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all text-sm font-bold"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              Imprimir
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: noticia.titulo,
                    text: noticia.resumo,
                    url: window.location.href,
                  })
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all text-sm font-bold"
            >
              <span className="material-symbols-outlined text-lg">share</span>
              Compartilhar
            </button>
          </div>

          <Link 
            to="/noticias" 
            className="flex items-center gap-2 text-primary font-bold hover:underline"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar para a listagem
          </Link>
        </footer>
      </article>
    </div>
  )
}
