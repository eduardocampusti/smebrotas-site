import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { Servico } from '../../types'
import { toast } from 'sonner'

export default function ServicosListPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  async function fetchServicos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .order('ordem', { ascending: true })
    
    if (error) {
      toast.error('Erro ao carregar serviços')
    } else if (data) {
      setServicos(data as Servico[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchServicos()
  }, [])

  const filteredServicos = servicos.filter(s => 
    s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.resumo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function toggleAtivo(servico: Servico) {
    const nextAtivo = !servico.ativo
    const { error } = await supabase
      .from('servicos')
      .update({ ativo: nextAtivo })
      .eq('id', servico.id)

    if (!error) {
      toast.success(`Serviço ${nextAtivo ? 'ativado' : 'desativado'} com sucesso.`)
      setServicos(servicos.map((s) => s.id === servico.id ? { ...s, ativo: nextAtivo } : s))
    } else {
      toast.error('Erro ao atualizar status.')
    }
  }

  async function deleteServico(id: string) {
    if (!confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) return
    
    const { error } = await supabase.from('servicos').delete().eq('id', id)
    
    if (!error) {
      toast.success('Serviço excluído com sucesso.')
      setServicos(servicos.filter((s) => s.id !== id))
    } else {
      toast.error('Erro ao excluir serviço.')
    }
  }

  if (loading && servicos.length === 0) {
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
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Serviços</h1>
          <p className="text-slate-500 text-sm mt-1">Total de {servicos.length} serviço(s) no portal</p>
        </div>
        <Link
          to="/admin/servicos/novo"
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Novo Serviço
        </Link>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Buscar por título ou resumo..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredServicos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-slate-300 text-4xl">construction</span>
          </div>
          <p className="text-slate-500 text-lg font-medium">Nenhum serviço encontrado</p>
          <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
            Tente ajustar sua busca ou crie um novo serviço.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServicos.map((servico) => (
            <div 
              key={servico.id} 
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all duration-300 flex flex-col"
            >
              {/* Header do Card: Ícone e Status */}
              <div className="p-6 pb-4 flex items-start justify-between">
                <div className="size-12 rounded-xl bg-slate-50 text-[var(--color-primary)] flex items-center justify-center border border-slate-100 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">{servico.icone}</span>
                </div>
                
                <button
                  onClick={() => toggleAtivo(servico)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    servico.ativo 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={servico.ativo ? 'Clique para desativar' : 'Clique para ativar'}
                >
                  <span className={`size-1.5 rounded-full ${servico.ativo ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  {servico.ativo ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              {/* Conteúdo do Card */}
              <div className="px-6 flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                  {servico.titulo}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                  {servico.resumo}
                </p>
              </div>

              {/* Footer do Card: Ordem e Ações */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordem:</span>
                  <span className="text-sm font-black text-slate-700 bg-white size-7 rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                    {servico.ordem}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/servicos/${servico.id}`}
                    className="size-9 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:shadow-sm transition-all"
                    title="Editar serviço"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </Link>
                  <button
                    onClick={() => deleteServico(servico.id)}
                    className="size-9 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-red-500 hover:border-red-200 hover:shadow-sm transition-all"
                    title="Excluir serviço"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
