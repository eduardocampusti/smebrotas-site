import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Noticia } from '../../types'
import { toast } from 'sonner'
import { CATEGORIAS_NOTICIAS, getCategoriaLabel, getStatusStyle } from '../../constants/noticias'
import type { StatusNoticia } from '../../constants/noticias'

export default function NoticiasListPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todas')
  const [filterStatus] = useState('todas')

  async function fetchNoticias() {
    setLoading(true)
    let query = supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filterCategoria !== 'todas') {
      query = query.eq('categoria', filterCategoria)
    }

    if (filterStatus !== 'todas') {
      query = query.eq('status', filterStatus)
    }

    const { data } = await query
    if (data) setNoticias(data as Noticia[])
    setLoading(false)
  }

  useEffect(() => {
    fetchNoticias()
  }, [filterCategoria, filterStatus])

  const filteredNoticias = noticias.filter(n => 
    n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.resumo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function updateStatus(noticia: Noticia, nextStatus: string) {
    const { error } = await supabase
      .from('noticias')
      .update({
        status: nextStatus,
        data_publicacao: nextStatus === 'publicado' ? (noticia.data_publicacao || new Date().toISOString()) : noticia.data_publicacao,
      })
      .eq('id', noticia.id)

    if (!error) {
      toast.success(`Status atualizado para ${nextStatus}.`)
      setNoticias(noticias.map((n) => n.id === noticia.id ? { ...n, status: nextStatus as any } : n))
    } else {
      toast.error('Erro ao atualizar status.')
    }
  }

  async function deleteNoticia(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.')) return
    
    const noticia = noticias.find(n => n.id === id)
    
    // Deleta do Banco de Dados
    const { error } = await supabase.from('noticias').delete().eq('id', id)
    
    if (!error) {
      // Tenta deletar a imagem do storage se existir e for uma URL do Supabase
      if (noticia?.imagem_url && noticia.imagem_url.includes('/storage/v1/object/public/noticias/')) {
        const urlParts = noticia.imagem_url.split('/storage/v1/object/public/noticias/')
        if (urlParts.length === 2) {
          const filePath = urlParts[1]
          await supabase.storage.from('noticias').remove([filePath])
        }
      }
      
      toast.success('Notícia excluída com sucesso.')
      setNoticias(noticias.filter((n) => n.id !== id))
    } else {
      toast.error('Erro ao excluir notícia.')
    }
  }

  if (loading && noticias.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Notícias</h1>
          <p className="text-slate-500 text-sm mt-1">Total de {noticias.length} notícia(s) no portal</p>
        </div>
        <Link
          to="/admin/noticias/nova"
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nova Notícia
        </Link>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="md:col-span-2 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Buscar por título ou resumo..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="h-10 px-3 rounded-lg border border-slate-200 focus:border-[var(--color-primary)] outline-none text-sm bg-white cursor-pointer"
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
        >
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS_NOTICIAS.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      {filteredNoticias.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-slate-300 text-4xl">newspaper</span>
          </div>
          <p className="text-slate-500 text-lg font-medium">Nenhuma notícia encontrada</p>
          <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
            Tente ajustar seus filtros ou crie uma nova publicação.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[400px]">Notícia</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNoticias.map((noticia) => (
                  <tr key={noticia.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                          {noticia.imagem_url ? (
                            <img 
                              src={noticia.imagem_url} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <span className="material-symbols-outlined text-xl">image</span>
                            </div>
                          )}
                          {noticia.destaque && (
                            <div className="absolute top-0 right-0 bg-amber-400 p-0.5 rounded-bl-md shadow-sm" title="Destaque">
                              <span className="material-symbols-outlined text-[10px] text-white font-bold block">star</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                            {noticia.titulo}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              {new Date(noticia.created_at || '').toLocaleDateString('pt-BR')}
                            </span>
                            {noticia.destaque && (
                              <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-amber-100">
                                Destaque
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 capitalize border border-slate-200">
                        {getCategoriaLabel(noticia.categoria)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={noticia.status}
                        onChange={(e) => updateStatus(noticia, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all ${
                          getStatusStyle(noticia.status as StatusNoticia).bg
                        } ${getStatusStyle(noticia.status as StatusNoticia).color} ${
                          noticia.status === 'publicado' ? 'border-emerald-100' : 
                          noticia.status === 'rascunho' ? 'border-slate-200' : 'border-amber-100'
                        }`}
                      >
                        <option value="rascunho">Rascunho</option>
                        <option value="publicado">Publicado</option>
                        <option value="arquivado">Arquivado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/noticias/${noticia.id}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
                          title="Editar notícia"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </Link>
                        <button
                          onClick={() => deleteNoticia(noticia.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Excluir notícia"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
