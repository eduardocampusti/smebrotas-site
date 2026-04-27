import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { IndicadorTransparencia, ArquivoTransparencia, CategoriaTransparencia, SiteConfig } from '../../types'
import { toast } from 'sonner'

type TabType = 'arquivos' | 'indicadores' | 'categorias' | 'estrutura'

export default function TransparenciaListPage() {
  const [activeTab, setActiveTab] = useState<TabType>('arquivos')
  const [arquivos, setArquivos] = useState<ArquivoTransparencia[]>([])
  const [indicadores, setIndicadores] = useState<IndicadorTransparencia[]>([])
  const [categorias, setCategorias] = useState<CategoriaTransparencia[]>([])
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<string>('todos')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterAno, setFilterAno] = useState<string>('todos')

  // Estados para edição de categoria
  const [editingCategory, setEditingCategory] = useState<Partial<CategoriaTransparencia> | null>(null)
  
  // Estado para edição de estrutura
  const [configForm, setConfigForm] = useState({
    titulo_pagina: '',
    descricao_pagina: '',
    indicadores_titulo: '',
    documentos_titulo: '',
    atos_oficiais_titulo: '',
    atos_oficiais_limite: 10,
    atos_oficiais_categoria_slug: '',
    dados_abertos_url: ''
  })

  async function fetchData() {
    try {
      const [arquivosRes, indicadoresRes, categoriasRes, configRes] = await Promise.all([
        supabase
          .from('transparencia_arquivos')
          .select('*')
          .order('data_publicacao', { ascending: false }),
        supabase
          .from('transparencia_indicadores')
          .select('*')
          .order('ordem', { ascending: true }),
        supabase
          .from('transparencia_categorias')
          .select('*')
          .order('ordem', { ascending: true }),
        supabase
          .from('site_config')
          .select('*')
          .single()
      ])
      
      if (arquivosRes.error) throw arquivosRes.error
      if (indicadoresRes.error) throw indicadoresRes.error
      if (categoriasRes.error) throw categoriasRes.error
      if (configRes.error) throw configRes.error
      
      setArquivos(arquivosRes.data || [])
      setIndicadores(indicadoresRes.data || [])
      setCategorias(categoriasRes.data || [])
      setSiteConfig(configRes.data)
      
      if (configRes.data?.transparencia_config) {
        setConfigForm({
          titulo_pagina: configRes.data.transparencia_config.titulo_pagina || '',
          descricao_pagina: configRes.data.transparencia_config.descricao_pagina || '',
          indicadores_titulo: configRes.data.transparencia_config.indicadores_titulo || '',
          documentos_titulo: configRes.data.transparencia_config.documentos_titulo || '',
          atos_oficiais_titulo: configRes.data.transparencia_config.atos_oficiais_titulo || '',
          atos_oficiais_limite: configRes.data.transparencia_config.atos_oficiais_limite || 10,
          atos_oficiais_categoria_slug: configRes.data.transparencia_config.atos_oficiais_categoria_slug || '',
          dados_abertos_url: configRes.data.transparencia_config.dados_abertos_url || ''
        })
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      toast.error('Erro ao carregar dados da transparência')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Salvar Configuração de Estrutura
  async function saveConfig() {
    if (!siteConfig) return
    setSaving(true)
    try {
      const newConfig = {
        ...siteConfig.transparencia_config,
        ...configForm
      }
      
      const { error } = await supabase
        .from('site_config')
        .update({ transparencia_config: newConfig })
        .eq('id', siteConfig.id)
      
      if (error) throw error
      toast.success('Configurações da página atualizadas!')
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  // CRUD Categorias
  async function saveCategory() {
    if (!editingCategory?.nome || !editingCategory?.slug) {
      toast.error('Nome e Slug são obrigatórios')
      return
    }
    
    setSaving(true)
    try {
      if (editingCategory.id) {
        const { error } = await supabase
          .from('transparencia_categorias')
          .update(editingCategory)
          .eq('id', editingCategory.id)
        if (error) throw error
        toast.success('Categoria atualizada!')
      } else {
        const { error } = await supabase
          .from('transparencia_categorias')
          .insert([editingCategory])
        if (error) throw error
        toast.success('Categoria criada!')
      }
      setEditingCategory(null)
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar categoria')
    } finally {
      setSaving(false)
    }
  }

  const filteredArquivos = arquivos.filter(a => {
    const matchesSearch = a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.numero?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategoria = filterCategoria === 'todos' || a.categoria === filterCategoria
    const matchesStatus = filterStatus === 'todos' || (filterStatus === 'publico' ? a.ativo : !a.ativo)
    const matchesAno = filterAno === 'todos' || new Date(a.data_publicacao).getFullYear().toString() === filterAno

    return matchesSearch && matchesCategoria && matchesStatus && matchesAno
  }).sort((a, b) => {
    if (a.ativo !== b.ativo) return a.ativo ? -1 : 1
    if (!a.ativo && !b.ativo) {
      const dateA = a.desativado_em ? new Date(a.desativado_em).getTime() : 0
      const dateB = b.desativado_em ? new Date(b.desativado_em).getTime() : 0
      return dateB - dateA
    }
    return new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime()
  })

  const filteredIndicadores = indicadores.filter(i => {
    const matchesSearch = i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         i.valor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || (filterStatus === 'publico' ? i.ativo : !i.ativo)
    const matchesAno = filterAno === 'todos' || i.ano_referencia.toString() === filterAno
    return matchesSearch && matchesStatus && matchesAno
  }).sort((a, b) => {
    if (a.ativo !== b.ativo) return a.ativo ? -1 : 1
    if (!a.ativo && !b.ativo) {
      const dateA = a.desativado_em ? new Date(a.desativado_em).getTime() : 0
      const dateB = b.desativado_em ? new Date(b.desativado_em).getTime() : 0
      return dateB - dateA
    }
    return a.ordem - b.ordem
  })

  const stats = {
    totalDocs: arquivos.length,
    totalIndicadores: indicadores.length,
    publicos: arquivos.filter(a => a.ativo).length + indicadores.filter(i => i.ativo).length,
    ocultos: arquivos.filter(a => !a.ativo).length + indicadores.filter(i => !i.ativo).length,
  }

  const anosDisponiveis = Array.from(new Set([
    ...arquivos.map(a => new Date(a.data_publicacao).getFullYear()),
    ...indicadores.map(i => i.ano_referencia)
  ])).sort((a, b) => b - a)

  async function toggleAtivo(item: any, table: string) {
    const nextAtivo = !item.ativo
    const desativadoEm = nextAtivo ? null : new Date().toISOString()
    const { error } = await supabase.from(table).update({ ativo: nextAtivo, desativado_em: desativadoEm }).eq('id', item.id)
    if (!error) {
      toast.success(`Item ${nextAtivo ? 'ativado' : 'desativado'} com sucesso.`)
      fetchData()
    } else {
      toast.error('Erro ao atualizar status.')
    }
  }

  async function deleteItem(id: string, table: string) {
    if (!confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) {
      toast.success('Item excluído com sucesso.')
      fetchData()
    } else {
      toast.error('Erro ao excluir item.')
    }
  }

  async function moveIndicador(indicador: IndicadorTransparencia, direction: 'up' | 'down') {
    const currentIndex = indicadores.findIndex(i => i.id === indicador.id)
    if (currentIndex === -1) return
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= indicadores.length) return
    
    const targetIndicador = indicadores[targetIndex]
    
    // Swap orders
    const { error } = await supabase.rpc('swap_indicadores_order', {
      id1: indicador.id,
      order1: targetIndicador.ordem,
      id2: targetIndicador.id,
      order2: indicador.ordem
    })
    
    if (error) {
      // Fallback if RPC doesn't exist (using simple updates)
      const { error: err1 } = await supabase.from('transparencia_indicadores').update({ ordem: targetIndicador.ordem }).eq('id', indicador.id)
      const { error: err2 } = await supabase.from('transparencia_indicadores').update({ ordem: indicador.ordem }).eq('id', targetIndicador.id)
      if (err1 || err2) {
        toast.error('Erro ao reordenar indicadores')
        return
      }
    }
    
    fetchData()
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transparência e Indicadores</h1>
          <p className="text-slate-500 text-base mt-1">Gestão completa da página, documentos e métricas educacionais.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'arquivos' && (
            <Link to="/admin/transparencia/arquivo/novo" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-all shadow-md">
              <span className="material-symbols-outlined">add</span> Novo Arquivo
            </Link>
          )}
          {activeTab === 'indicadores' && (
            <Link to="/admin/transparencia/indicador/novo" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-all shadow-md">
              <span className="material-symbols-outlined">add</span> Novo Indicador
            </Link>
          )}
          {activeTab === 'categorias' && (
            <button onClick={() => setEditingCategory({ nome: '', slug: '', icone: 'description', ordem: categorias.length + 1, ativo: true })} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-all shadow-md">
              <span className="material-symbols-outlined">add</span> Nova Categoria
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Arquivos Oficiais', value: stats.totalDocs, icon: 'description', color: 'blue' },
          { label: 'Indicadores', value: stats.totalIndicadores, icon: 'analytics', color: 'indigo' },
          { label: 'Itens Públicos', value: stats.publicos, icon: 'check_circle', color: 'emerald' },
          { label: 'Itens Ocultos', value: stats.ocultos, icon: 'visibility_off', color: 'orange' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-[var(--color-primary)]/20 transition-colors">
            <div className={`size-12 rounded-xl bg-${card.color}-50 text-${card.color}-600 flex items-center justify-center`}>
              <span className="material-symbols-outlined text-2xl">{card.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Control */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
          {[
            { id: 'arquivos', label: 'Arquivos', icon: 'folder' },
            { id: 'indicadores', label: 'Indicadores', icon: 'monitoring' },
            { id: 'categorias', label: 'Categorias (Cards)', icon: 'grid_view' },
            { id: 'estrutura', label: 'Estrutura da Página', icon: 'settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- BARRA DE BUSCA E FILTROS COMPARTILHADA --- */}
        {(activeTab === 'arquivos' || activeTab === 'indicadores') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-end lg:items-center">
            <div className="relative flex-1 w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
              <input 
                type="text" 
                placeholder={activeTab === 'arquivos' ? "Buscar por título, categoria ou número..." : "Buscar por título ou valor..."} 
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 outline-none text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {activeTab === 'arquivos' && (
                <select className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none" value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
                  <option value="todos">Todas as categorias</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.slug}>{cat.nome}</option>)}
                </select>
              )}
              <select className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="todos">Todos os status</option>
                <option value="publico">Ativos</option>
                <option value="oculto">Ocultos</option>
              </select>
              <select className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none" value={filterAno} onChange={(e) => setFilterAno(e.target.value)}>
                <option value="todos">Todos os anos</option>
                {anosDisponiveis.map(ano => <option key={ano} value={ano}>{ano}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* --- ABA ARQUIVOS --- */}
        {activeTab === 'arquivos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArquivos.map(arquivo => (
              <ArquivoCard key={arquivo.id} arquivo={arquivo} categorias={categorias} onToggle={() => toggleAtivo(arquivo, 'transparencia_arquivos')} onDelete={() => deleteItem(arquivo.id, 'transparencia_arquivos')} />
            ))}
          </div>
        )}

        {/* --- ABA INDICADORES --- */}
        {activeTab === 'indicadores' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIndicadores.map((indicador, index) => (
              <IndicadorCard 
                key={indicador.id} 
                indicador={indicador} 
                onToggle={() => toggleAtivo(indicador, 'transparencia_indicadores')} 
                onDelete={() => deleteItem(indicador.id, 'transparencia_indicadores')}
                onMoveUp={() => moveIndicador(indicador, 'up')}
                onMoveDown={() => moveIndicador(indicador, 'down')}
                isFirst={index === 0}
                isLast={index === filteredIndicadores.length - 1}
              />
            ))}
          </div>
        )}

        {/* --- ABA CATEGORIAS --- */}
        {activeTab === 'categorias' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorias.map(cat => (
                <div key={cat.id} className={`bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 ${!cat.ativo ? 'opacity-50 grayscale' : ''}`}>
                  <div className="size-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                    <span className="material-symbols-outlined">{cat.icone}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{cat.nome} <span className="text-xs text-slate-400 font-normal ml-2">({cat.slug})</span></h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{cat.descricao}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingCategory(cat)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button onClick={() => toggleAtivo(cat, 'transparencia_categorias')} className={`p-2 rounded-lg transition-all ${cat.ativo ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                      <span className="material-symbols-outlined">{cat.ativo ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {editingCategory && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-black text-slate-900">{editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                    <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome da Categoria</label>
                        <input type="text" className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]" value={editingCategory.nome} onChange={e => setEditingCategory({...editingCategory, nome: e.target.value})} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Slug (identificador)</label>
                        <input type="text" className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]" value={editingCategory.slug} onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})} disabled={!!editingCategory.id} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Descrição Curta</label>
                      <input type="text" className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]" value={editingCategory.descricao || ''} onChange={e => setEditingCategory({...editingCategory, descricao: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Ícone (Material Symbols)</label>
                        <input type="text" className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]" value={editingCategory.icone} onChange={e => setEditingCategory({...editingCategory, icone: e.target.value})} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Ordem de Exibição</label>
                        <input type="number" className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]" value={editingCategory.ordem} onChange={e => setEditingCategory({...editingCategory, ordem: parseInt(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={() => setEditingCategory(null)} className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancelar</button>
                    <button onClick={saveCategory} disabled={saving} className="px-6 py-2 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all shadow-md disabled:opacity-50">
                      {saving ? 'Salvando...' : 'Salvar Categoria'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ABA ESTRUTURA --- */}
        {activeTab === 'estrutura' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">Textos e Estrutura da Página Pública</h3>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Título da Página</label>
                <input type="text" className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)] text-lg font-medium" value={configForm.titulo_pagina} onChange={e => setConfigForm({...configForm, titulo_pagina: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Descrição/Introdução</label>
                <textarea className="p-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)] min-h-[100px] text-sm leading-relaxed" value={configForm.descricao_pagina} onChange={e => setConfigForm({...configForm, descricao_pagina: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Título da Seção de Indicadores</label>
                  <input type="text" className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]" value={configForm.indicadores_titulo} onChange={e => setConfigForm({...configForm, indicadores_titulo: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Título da Seção de Documentos</label>
                  <input type="text" className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]" value={configForm.documentos_titulo} onChange={e => setConfigForm({...configForm, documentos_titulo: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Título da Seção de Atos</label>
                  <input type="text" className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-[var(--color-primary)]" value={configForm.atos_oficiais_titulo} onChange={e => setConfigForm({...configForm, atos_oficiais_titulo: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Limite de Atos (Home)</label>
                  <input type="number" className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-[var(--color-primary)]" value={configForm.atos_oficiais_limite} onChange={e => setConfigForm({...configForm, atos_oficiais_limite: parseInt(e.target.value)})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Categoria de Atos Oficiais</label>
                  <select 
                    className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-[var(--color-primary)]" 
                    value={configForm.atos_oficiais_categoria_slug} 
                    onChange={e => setConfigForm({...configForm, atos_oficiais_categoria_slug: e.target.value})}
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Link de Dados Abertos (Opcional)</label>
                  <input type="text" className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-[var(--color-primary)]" placeholder="Ex: /transparencia/dados-abertos ou link externo" value={configForm.dados_abertos_url} onChange={e => setConfigForm({...configForm, dados_abertos_url: e.target.value})} />
                </div>
              </div>
              <button onClick={saveConfig} disabled={saving} className="h-12 px-8 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-dark)] transition-all shadow-lg self-end disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar Alterações na Estrutura'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ArquivoCard({ arquivo, categorias, onToggle, onDelete }: { arquivo: ArquivoTransparencia, categorias: CategoriaTransparencia[], onToggle: () => void, onDelete: () => void }) {
  const getCategoriaNome = (slug: string) => categorias.find(c => c.slug === slug)?.nome || slug
  const ext = arquivo.arquivo_url.split('.').pop()?.toLowerCase()
  const icon = ext === 'pdf' ? 'picture_as_pdf' : (['xls', 'xlsx', 'csv'].includes(ext || '') ? 'table_chart' : 'description')
  const color = ext === 'pdf' ? 'red' : (['xls', 'xlsx', 'csv'].includes(ext || '') ? 'emerald' : 'blue')

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[var(--color-primary)]/40 transition-all group flex flex-col h-full overflow-hidden ${!arquivo.ativo ? 'opacity-50 grayscale bg-slate-50/50' : ''}`}>
      <div className="p-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${arquivo.ativo ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
          {arquivo.ativo ? 'Público' : 'Oculto'}
        </span>
        <span className="px-2 py-1 bg-white text-slate-500 text-[9px] font-black uppercase rounded-lg border border-slate-100 shadow-sm tracking-widest">
          {getCategoriaNome(arquivo.categoria)}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className={`size-14 rounded-2xl bg-${color}-50 text-${color}-500 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            <span className="material-symbols-outlined text-3xl font-variation-icon-bold">{icon}</span>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <h3 className="font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-tight min-h-[2.5rem]">{arquivo.titulo}</h3>
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
              <span className="material-symbols-outlined text-[14px]">calendar_month</span> {new Date(arquivo.data_publicacao).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{arquivo.descricao || 'Nenhuma descrição fornecida.'}</p>
      </div>
      <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <a href={arquivo.arquivo_url} target="_blank" rel="noopener noreferrer" className="size-9 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all border border-slate-200 shadow-sm"><span className="material-symbols-outlined text-xl">visibility</span></a>
          <Link to={`/admin/transparencia/arquivo/${arquivo.id}`} className="size-9 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all border border-slate-200 shadow-sm"><span className="material-symbols-outlined text-xl">edit</span></Link>
          <button onClick={onDelete} className="size-9 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200 shadow-sm"><span className="material-symbols-outlined text-xl">delete</span></button>
        </div>
        <button onClick={onToggle} className={`flex items-center gap-2 h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${arquivo.ativo ? 'bg-white text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-600' : 'bg-emerald-500 text-white border-emerald-600'}`}>
          <span className="material-symbols-outlined text-base">{arquivo.ativo ? 'visibility_off' : 'visibility'}</span>
          {arquivo.ativo ? 'Desativar' : 'Reativar'}
        </button>
      </div>
    </div>
  )
}

function IndicadorCard({ 
  indicador, 
  onToggle, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  isFirst,
  isLast 
}: { 
  indicador: IndicadorTransparencia, 
  onToggle: () => void, 
  onDelete: () => void,
  onMoveUp: () => void,
  onMoveDown: () => void,
  isFirst: boolean,
  isLast: boolean
}) {
  const chartIcon = {
    linha: 'show_chart',
    barra: 'bar_chart',
    pizza: 'pie_chart'
  }[indicador.tipo_grafico || 'linha']

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all group flex flex-col ${!indicador.ativo ? 'opacity-50 grayscale bg-slate-50/50' : ''}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-2">
          <div className="size-14 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shadow-inner relative">
            <span className="material-symbols-outlined text-3xl font-variation-icon-bold">{indicador.icone || 'analytics'}</span>
            <div className="absolute -bottom-1 -right-1 size-6 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400" title={`Tipo: ${indicador.tipo_grafico}`}>
              <span className="material-symbols-outlined text-base">{chartIcon}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <button 
              onClick={onMoveUp} 
              disabled={isFirst}
              className={`size-6 rounded-lg flex items-center justify-center transition-all ${isFirst ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:bg-slate-100 hover:text-[var(--color-primary)]'}`}
            >
              <span className="material-symbols-outlined text-lg">expand_less</span>
            </button>
            <button 
              onClick={onMoveDown} 
              disabled={isLast}
              className={`size-6 rounded-lg flex items-center justify-center transition-all ${isLast ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:bg-slate-100 hover:text-[var(--color-primary)]'}`}
            >
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${indicador.ativo ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
          {indicador.ativo ? 'Público' : 'Oculto'}
        </span>
      </div>
      <div className="flex flex-col gap-1 mb-6">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors leading-snug">{indicador.titulo}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-black text-slate-900 tracking-tight">{indicador.valor}</span>
          <span className="text-sm font-bold text-slate-400 uppercase">{indicador.unidade}</span>
        </div>
      </div>
      <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ano Referência</span>
          <span className="text-sm font-bold text-slate-700">{indicador.ano_referencia}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className={`flex items-center gap-2 h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${indicador.ativo ? 'bg-white text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-600' : 'bg-emerald-500 text-white border-emerald-600'}`}>
            <span className="material-symbols-outlined text-base">{indicador.ativo ? 'visibility_off' : 'visibility'}</span>
            {indicador.ativo ? 'Desativar' : 'Reativar'}
          </button>
          <Link to={`/admin/transparencia/indicador/${indicador.id}`} className="size-9 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-[var(--color-primary)]/10 border border-slate-200 shadow-sm"><span className="material-symbols-outlined text-xl">edit</span></Link>
          <button onClick={onDelete} className="size-9 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-red-50 border border-slate-200 shadow-sm"><span className="material-symbols-outlined text-xl">delete</span></button>
        </div>
      </div>
    </div>
  )
}
