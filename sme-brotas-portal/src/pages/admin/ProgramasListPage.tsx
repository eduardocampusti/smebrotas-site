import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Programa } from '../../types'
import { toast } from 'sonner'

export default function ProgramasListPage() {
  const [programas, setProgramas] = useState<Programa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<string>('todos')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterDestaque, setFilterDestaque] = useState<string>('todos')

  async function fetchProgramas() {
    setLoading(true)
    const { data, error } = await supabase
      .from('programas')
      .select('*')
      .order('ordem', { ascending: true })
    
    if (error) {
      toast.error('Erro ao carregar programas')
    } else if (data) {
      setProgramas(data as Programa[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProgramas()
  }, [])

  const filteredProgramas = programas.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.resumo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategoria = filterCategoria === 'todos' || p.categoria === filterCategoria
    const matchesStatus = filterStatus === 'todos' || (filterStatus === 'ativo' ? p.ativo : !p.ativo)
    const matchesDestaque = filterDestaque === 'todos' || (filterDestaque === 'sim' ? p.destaque : !p.destaque)

    return matchesSearch && matchesCategoria && matchesStatus && matchesDestaque
  }).sort((a, b) => {
    // Primeiro: Ativos antes de Inativos
    if (a.ativo !== b.ativo) return a.ativo ? -1 : 1
    
    // Se ambos são inativos: ordenar pelo desativado_em (mais recentes primeiro)
    if (!a.ativo && !b.ativo) {
      const dateA = a.desativado_em ? new Date(a.desativado_em).getTime() : 0
      const dateB = b.desativado_em ? new Date(b.desativado_em).getTime() : 0
      return dateB - dateA
    }
    
    // Se ambos são ativos: manter a ordem definida pelo usuário
    return a.ordem - b.ordem
  })

  // Estatísticas para os cards de resumo
  const stats = {
    total: programas.length,
    ativos: programas.filter(p => p.ativo).length,
    inativos: programas.filter(p => !p.ativo).length,
    destaques: programas.filter(p => p.destaque).length
  }

  const categoriasDisponiveis = Array.from(
    new Set(programas.map(p => p.categoria).filter((categoria): categoria is string => Boolean(categoria)))
  ).sort()

  async function toggleAtivo(programa: Programa) {
    const nextAtivo = !programa.ativo
    const desativadoEm = nextAtivo ? null : new Date().toISOString()
    
    const { error } = await supabase
      .from('programas')
      .update({ 
        ativo: nextAtivo,
        desativado_em: desativadoEm 
      })
      .eq('id', programa.id)

    if (!error) {
      toast.success(`Programa ${nextAtivo ? 'ativado' : 'desativado'} com sucesso.`)
      setProgramas(programas.map((p) => p.id === programa.id ? { ...p, ativo: nextAtivo, desativado_em: desativadoEm } : p))
    } else {
      toast.error('Erro ao atualizar status.')
    }
  }

  async function deletePrograma(id: string) {
    if (!confirm('Tem certeza que deseja excluir este programa? Esta ação não pode ser desfeita.')) return
    
    const { error } = await supabase.from('programas').delete().eq('id', id)
    
    if (!error) {
      toast.success('Programa excluído com sucesso.')
      setProgramas(programas.filter((p) => p.id !== id))
    } else {
      toast.error('Erro ao excluir programa.')
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Programas e Projetos</h1>
          <p className="text-slate-500 text-base mt-1">
            Gerencie os programas pedagógicos e iniciativas da rede municipal.
          </p>
        </div>
        <Link
          to="/admin/programas/novo"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">add</span>
          Novo Programa
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Programas', value: stats.total, icon: 'assignment', color: 'blue' },
          { label: 'Programas Visíveis', value: stats.ativos, icon: 'check_circle', color: 'emerald' },
          { label: 'Programas Ocultos', value: stats.inativos, icon: 'visibility_off', color: 'slate' },
          { label: 'Em Destaque', value: stats.destaques, icon: 'star', color: 'amber' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-[var(--color-primary)]/20 transition-colors">
            <div className={`size-12 rounded-xl flex items-center justify-center ${
              card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              card.color === 'slate' ? 'bg-slate-50 text-slate-600' :
              'bg-amber-50 text-amber-600'
            }`}>
              <span className="material-symbols-outlined text-2xl">{card.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Area */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-end lg:items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Buscar por título ou resumo..."
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Categoria</label>
            <select 
              className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
            >
              <option value="todos">Todas</option>
              {categoriasDisponiveis.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label>
            <select 
              className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[100px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Destaque</label>
            <select 
              className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              value={filterDestaque}
              onChange={(e) => setFilterDestaque(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Carregando programas...</p>
        </div>
      ) : filteredProgramas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
          <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-slate-300 text-4xl">assignment_late</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhum programa encontrado</h3>
          <p className="text-slate-500 mt-1">Tente ajustar seus filtros ou crie um novo programa pedagógico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProgramas.map((programa) => (
            <div 
              key={programa.id} 
              className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
                programa.ativo 
                  ? 'border-slate-200 shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/30' 
                  : 'opacity-50 grayscale bg-slate-50 border-slate-200 border-dashed shadow-none'
              }`}
            >
              {/* Imagem de Capa */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                {programa.imagem_url ? (
                  <img 
                    src={programa.imagem_url} 
                    alt={programa.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-5xl">image</span>
                  </div>
                )}
                
                {/* Badges de Status sobre a imagem */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md border ${
                    programa.ativo 
                      ? 'bg-emerald-500/90 text-white border-emerald-400' 
                      : 'bg-slate-600/90 text-white border-slate-500'
                  }`}>
                    <span className={`size-1.5 rounded-full ${programa.ativo ? 'bg-white animate-pulse' : 'bg-slate-300'}`}></span>
                    {programa.ativo ? 'Visível' : 'Oculto'}
                  </div>
                  
                  {programa.destaque && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white border border-amber-400 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      Destaque
                    </div>
                  )}
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="p-6 flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-lg">
                    {programa.categoria || 'Sem Categoria'}
                  </span>
                </div>
                
                <h2 className="text-xl font-black text-slate-900 leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                  {programa.titulo}
                </h2>
                
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                  {programa.resumo}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordem de Exibição</span>
                    <span className="text-sm font-bold text-slate-700">{programa.ordem}º lugar</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAtivo(programa)}
                      className={`flex items-center gap-2 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                        programa.ativo 
                          ? 'bg-white text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-600' 
                          : 'bg-emerald-500 text-white border-emerald-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {programa.ativo ? 'visibility_off' : 'visibility'}
                      </span>
                      {programa.ativo ? 'Desativar' : 'Reativar'}
                    </button>
                    <Link
                      to={`/admin/programas/${programa.id}`}
                      className="size-10 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all border border-slate-200 shadow-sm"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </Link>
                    <button
                      onClick={() => deletePrograma(programa.id)}
                      className="size-10 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200 shadow-sm"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
