import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../config/supabase'
import type { AcessoRapido } from '../../types'

const defaultItem: Omit<AcessoRapido, 'id' | 'ordem' | 'created_at'> = {
  nome: '',
  icone: 'link',
  link: '',
  ativo: true,
}

export function AcessoRapidoEditor() {
  const [items, setItems] = useState<AcessoRapido[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<AcessoRapido, 'id' | 'ordem' | 'created_at'>>(defaultItem)
  const formRef = useRef<HTMLDivElement>(null)

  // Função robusta para extrair o nome do ícone de tags, URLs ou texto sujo
  const sanitizeIconName = (input: string): string => {
    if (!input) return ''
    
    // 1. Tenta extrair de uma tag <span>...</span> (ex: <span class="...">home</span>)
    const spanMatch = input.match(/<span[^>]*>([^<]+)<\/span>/i)
    if (spanMatch && spanMatch[1]) return spanMatch[1].trim().toLowerCase()

    // 2. Tenta extrair de uma URL do Google Fonts (parâmetro selected)
    if (input.includes('selected=')) {
      const match = input.match(/selected=Material\+Symbols\+Outlined:([^:&?]+)/i)
      if (match && match[1]) return match[1].toLowerCase()
    }

    // 3. Se for uma tag <link> ou algo com "href", e contiver o nome do ícone na query
    if (input.includes('family=Material+Symbols')) {
      const iconMatch = input.match(/family=Material\+Symbols\+Outlined:([^&"'\s]+)/i)
      if (iconMatch && iconMatch[1]) return iconMatch[1].toLowerCase()
    }

    // 4. Limpeza geral: remove espaços, converte para minúsculo e remove caracteres especiais
    // Se sobrar algo que parece uma URL ou tag, pegamos apenas a última parte alfanumérica
    let clean = input.trim().toLowerCase()
    
    // Remove tags HTML se ainda sobrarem (pode ser que colou só metade da tag)
    clean = clean.replace(/<[^>]*>?/gm, '')
    
    if (clean.includes('/') || clean.includes('=') || clean.includes(':')) {
      // Tenta pegar a última palavra que parece um nome de ícone (letras e underscores)
      const parts = clean.split(/[\/\s?=&:]+/)
      const lastValid = parts.reverse().find(p => p.length > 2 && /^[a-z0-9_]+$/.test(p))
      if (lastValid) clean = lastValid
    }

    return clean.replace(/[^a-z0-9_]/g, '').slice(0, 40)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('acessos_rapidos')
      .select('*')
      .order('ordem', { ascending: true })
    
    if (error) {
      toast.error('Erro ao carregar os acessos rápidos.')
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleStartEdit = (item: AcessoRapido) => {
    setEditingId(item.id)
    setFormData({
      nome: item.nome,
      icone: item.icone || 'link',
      link: item.link || '',
      ativo: item.ativo,
    })
    
    // Scroll suave até o formulário
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData(defaultItem)
  }

  const handleSave = async () => {
    if (!formData.nome.trim() || !(formData.link || '').trim()) {
      toast.error('Preencha os campos obrigatórios (*)')
      return
    }

    setLoading(true)
    if (editingId) {
      const { error } = await supabase
        .from('acessos_rapidos')
        .update(formData)
        .eq('id', editingId)
      
      if (error) {
        toast.error('Erro ao atualizar o item.')
      } else {
        toast.success('Item atualizado com sucesso!')
        await fetchItems()
        setEditingId(null)
        setFormData(defaultItem)
      }
    } else {
      const { error } = await supabase
        .from('acessos_rapidos')
        .insert([{
          ...formData,
          ordem: items.length
        }])
      
      if (error) {
        toast.error('Erro ao criar o item.')
      } else {
        toast.success('Novo item criado com sucesso!')
        await fetchItems()
        setFormData(defaultItem)
      }
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    const { error } = await supabase
      .from('acessos_rapidos')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('Erro ao excluir item.')
    } else {
      toast.success('Item removido com sucesso.')
      await fetchItems()
      if (editingId === id) handleCancelEdit()
    }
  }

  const handleToggleActive = async (item: AcessoRapido) => {
    const { error } = await supabase
      .from('acessos_rapidos')
      .update({ ativo: !item.ativo })
      .eq('id', item.id)
      
    if (error) {
      toast.error('Erro ao alterar status.')
    } else {
      toast.success(item.ativo ? 'Item desativado.' : 'Item ativado.')
      await fetchItems()
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const newItems = [...items]
    const [movedItem] = newItems.splice(index, 1)
    newItems.splice(newIndex, 0, movedItem)

    // Update ordem for all
    const updatedItems = newItems.map((item, i) => ({
      ...item,
      ordem: i
    }))

    setItems(updatedItems) // Optimistic update

    const { error } = await supabase.from('acessos_rapidos').upsert(
      updatedItems.map(({ id, nome, icone, link, ativo, ordem }) => ({
        id, nome, icone, link, ativo, ordem
      }))
    )

    if (error) {
      toast.error('Erro ao reordenar.')
      fetchItems()
    }
  }

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-500">
      
      {/* SEÇÃO: FORMULÁRIO DE EDIÇÃO/CRIAÇÃO */}
      <div ref={formRef} className={`flex flex-col lg:flex-row gap-8 p-1 rounded-2xl transition-all duration-300 ${editingId ? 'bg-blue-50/50' : ''}`}>
        
        <div className={`flex-1 bg-white p-6 rounded-xl border-2 transition-all duration-300 ${editingId ? 'border-blue-400 shadow-lg shadow-blue-100' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className={`material-symbols-outlined p-2 rounded-lg ${editingId ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                  {editingId ? 'edit_square' : 'add_circle'}
                </span>
                {editingId ? 'Editando Acesso' : 'Novo Acesso Rápido'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 ml-11">
                {editingId ? 'Altere as informações do item selecionado abaixo.' : 'Preencha os campos para criar um novo botão no portal.'}
              </p>
            </div>
            {editingId && (
              <button 
                onClick={handleCancelEdit}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                Cancelar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Botão *</span>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Matrículas Escolares"
                className="h-12 px-4 rounded-xl text-sm font-medium border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ícone (Material Symbols) *</span>
              <div className="relative group">
                <input
                  type="text"
                  value={formData.icone}
                  onChange={(e) => setFormData({ ...formData, icone: sanitizeIconName(e.target.value) })}
                  placeholder="Ex: school, stars, calendar"
                  className="w-full h-12 pl-4 pr-12 rounded-xl text-sm font-medium border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 truncate"
                />
                <div className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg border border-slate-100 group-focus-within:text-blue-500 group-focus-within:bg-blue-50 transition-colors overflow-hidden">
                  <span className="material-symbols-outlined text-xl truncate">{formData.icone || 'help'}</span>
                </div>
              </div>
              <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline mt-1 ml-1 flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                Explorar Biblioteca de Ícones
              </a>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link de Destino *</span>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="Ex: /servicos ou https://..."
                className="w-full h-12 px-4 rounded-xl text-sm font-medium border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
              />
            </label>

            <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Status de Visibilidade</span>
                <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">Publicar imediatamente no portal?</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.ativo} 
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={loading || !formData.nome.trim()}
              className={`md:col-span-2 mt-2 h-14 rounded-xl font-black text-base transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-[0.98] ${editingId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-900 hover:bg-black text-white'}`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined font-bold">
                    {editingId ? 'check_circle' : 'add_task'}
                  </span>
                  {editingId ? 'SALVAR ALTERAÇÕES' : 'CRIAR NOVO ACESSO'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* PREVIEW CARD */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preview em tempo real</span>
          </div>
          <div className="flex-1 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className={`flex flex-col items-center gap-4 w-44 p-8 rounded-2xl bg-white shadow-xl transition-all duration-500 ${!formData.ativo ? 'opacity-40 grayscale scale-95' : 'hover:scale-105'}`}>
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0 overflow-hidden">
                <span className="material-symbols-outlined text-3xl truncate">{formData.icone || 'link'}</span>
              </div>
              <span className="text-slate-900 text-sm font-black text-center leading-tight w-full truncate">
                {formData.nome || 'Nome do Botão'}
              </span>
            </div>
            {!formData.ativo && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
                <span className="bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Item Inativo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO: LISTA DE ITENS */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 px-2">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-slate-400 bg-slate-100 p-2 rounded-lg">format_list_bulleted</span>
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
               Gerenciar Botões <span className="text-blue-600 ml-1">({items.length})</span>
             </h3>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter hidden md:block">Clique e arraste ou use as setas para ordenar</p>
        </div>
        
        {items.length === 0 ? (
          <div className="py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">cloud_off</span>
            <p className="font-bold">Nenhum item encontrado no banco de dados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className={`group flex items-center gap-4 p-4 bg-white border-2 rounded-2xl transition-all duration-300 ${editingId === item.id ? 'border-blue-500 bg-blue-50/30 scale-[1.01] shadow-lg' : 'border-slate-50 hover:border-slate-200 hover:shadow-md'}`}
              >
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-blue-500 disabled:opacity-10 transition-colors">
                    <span className="material-symbols-outlined text-2xl">arrow_drop_up</span>
                  </button>
                  <button onClick={() => handleMove(index, 'down')} disabled={index === items.length - 1} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-blue-500 disabled:opacity-10 transition-colors">
                    <span className="material-symbols-outlined text-2xl">arrow_drop_down</span>
                  </button>
                </div>

                {/* Mini Preview */}
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors ${item.ativo ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <span className="material-symbols-outlined text-2xl">{item.icone || 'link'}</span>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-sm truncate ${item.ativo ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                      {item.nome}
                    </span>
                    {!item.ativo && (
                      <span className="text-[9px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md uppercase">Oculto</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    {item.link}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleToggleActive(item)}
                    title={item.ativo ? 'Ocultar no Portal' : 'Mostrar no Portal'}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.ativo ? 'text-green-500 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <span className="material-symbols-outlined text-xl">{item.ativo ? 'visibility' : 'visibility_off'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleStartEdit(item)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${editingId === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-50 hover:bg-blue-50 hover:text-blue-600'}`}
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir Permanentemente"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
