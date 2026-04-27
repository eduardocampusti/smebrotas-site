import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { MODALIDADES_ENSINO } from '../../types'
import type { Escola, EscolasPageConfig } from '../../types'
import { toast } from 'sonner'
import SchoolForm from '../../components/admin/SchoolForm'
import SchoolCardPreview from '../../components/admin/SchoolCardPreview'

export default function EscolasEditorPage() {
  const [config, setConfig] = useState<Partial<EscolasPageConfig>>({
    titulo: 'Rede Municipal de Ensino',
    subtitulo: 'Encontre escolas da rede municipal por bairro, nível de ensino ou pesquise diretamente pelo nome da instituição.',
    placeholder_busca: 'Buscar escolas por nome, bairro ou endereço...',
    filtros_visiveis: ['Todos', 'Educação Infantil', 'Ensino Fundamental I', 'Ensino Fundamental II', 'EJA'],
    cards_por_pagina: 12,
    ordenacao_padrao: 'ordem',
    contador_texto: 'escolas encontradas'
  })
  const [schools, setSchools] = useState<Escola[]>([])
  const [loading, setLoading] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<Escola | null>(null)
  const [isSavingSchool, setIsSavingSchool] = useState(false)
  const [adminSearch, setAdminSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'escolas' | 'config'>('escolas')
  const [previewData, setPreviewData] = useState<Partial<Escola>>({})

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      
      // 1. Carregar Configurações
      const { data: configData, error: configError } = await supabase
        .from('escolas_config')
        .select('*')
        .single()
      
      if (!configError && configData) {
        setConfig(configData)
      } else if (configError && configError.code !== 'PGRST116') {
        console.error('Erro ao carregar config:', configError)
      }

      // 2. Carregar Escolas
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('escolas')
        .select('*')
        .order('ordem', { ascending: true })
      
      if (schoolsError) throw schoolsError
      setSchools(schoolsData || [])

    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      setIsSavingConfig(true)
      const { error } = await supabase
        .from('escolas_config')
        .upsert({ 
          ...config, 
          id: config.id || undefined,
          updated_at: new Date().toISOString() 
        })

      if (error) throw error
      toast.success('Configurações da página salvas com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao salvar configurações: ' + error.message)
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleSaveSchool = async (data: Partial<Escola>) => {
    try {
      setIsSavingSchool(true)
      
      const slug = data.nome?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const payload = {
        ...data,
        slug: data.slug || slug,
        updated_at: new Date().toISOString()
      }

      const { data: savedData, error } = await supabase
        .from('escolas')
        .upsert(payload)
        .select()
        .single()

      if (error) throw error

      if (editingSchool) {
        setSchools(prev => prev.map(s => s.id === savedData.id ? savedData : s))
        toast.success('Escola atualizada com sucesso!')
      } else {
        setSchools(prev => [...prev, savedData])
        toast.success('Escola criada com sucesso!')
      }

      setIsFormOpen(false)
      setEditingSchool(null)
    } catch (error: any) {
      toast.error('Erro ao salvar escola: ' + error.message)
    } finally {
      setIsSavingSchool(false)
    }
  }

  const handleDeleteSchool = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta escola?')) return

    try {
      const { error } = await supabase
        .from('escolas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setSchools(prev => prev.filter(s => s.id !== id))
      toast.success('Escola excluída com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao excluir escola: ' + error.message)
    }
  }

  const filteredSchools = schools.filter(s => 
    s.nome.toLowerCase().includes(adminSearch.toLowerCase()) ||
    s.modalidade.toLowerCase().includes(adminSearch.toLowerCase()) ||
    s.endereco?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    s.tipo?.toLowerCase().includes(adminSearch.toLowerCase())
  )

  const toggleFilter = (modalidade: string) => {
    setConfig(prev => {
      const current = prev.filtros_visiveis || []
      if (current.includes(modalidade)) {
        return { ...prev, filtros_visiveis: current.filter(f => f !== modalidade) }
      } else {
        return { ...prev, filtros_visiveis: [...current, modalidade] }
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl">
      {/* Header da Área */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rede Municipal de Ensino</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie a listagem pública e os registros das escolas municipais</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'config' && (
            <button
              onClick={saveConfig}
              disabled={isSavingConfig}
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-all disabled:opacity-60 shadow-sm shadow-[var(--color-primary)]/20"
            >
              {isSavingConfig ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
              ) : (
                <><span className="material-symbols-outlined text-lg">save</span> Salvar Alterações</>
              )}
            </button>
          )}
          {activeTab === 'escolas' && (
            <button
              onClick={() => {
                setEditingSchool(null)
                setPreviewData({})
                setIsFormOpen(true)
              }}
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-sm shadow-emerald-600/20"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Nova Escola
            </button>
          )}
        </div>
      </div>

      {/* Navegação por Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('escolas')}
          className={`px-6 py-3 text-sm font-bold transition-all relative ${
            activeTab === 'escolas'
              ? 'text-[var(--color-primary)]'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">school</span>
            Gestão de Escolas
          </div>
          {activeTab === 'escolas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-6 py-3 text-sm font-bold transition-all relative ${
            activeTab === 'config'
              ? 'text-[var(--color-primary)]'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">settings_suggest</span>
            Configurações da Página
          </div>
          {activeTab === 'config' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full" />
          )}
        </button>
      </div>

      <div className="animate-fade-in">
        {/* Seção 1: Configurações da Página */}
        {activeTab === 'config' && (
          <section className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Aparência e Comportamento</h2>
              <p className="text-sm text-slate-500">Defina como a página de escolas será exibida para os cidadãos</p>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Título da Seção</label>
            <input
              type="text"
              value={config.titulo}
              onChange={e => setConfig(prev => ({ ...prev, titulo: e.target.value }))}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Placeholder de Busca</label>
            <input
              type="text"
              value={config.placeholder_busca}
              onChange={e => setConfig(prev => ({ ...prev, placeholder_busca: e.target.value }))}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Itens por Página</label>
            <input
              type="number"
              value={config.cards_por_pagina}
              onChange={e => setConfig(prev => ({ ...prev, cards_por_pagina: parseInt(e.target.value) }))}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ordenação Padrão</label>
            <select
              value={config.ordenacao_padrao}
              onChange={e => setConfig(prev => ({ ...prev, ordenacao_padrao: e.target.value as any }))}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="ordem">Ordem Manual (Definida no Registro)</option>
              <option value="nome_asc">Nome (A-Z)</option>
              <option value="nome_desc">Nome (Z-A)</option>
              <option value="recentes">Mais Recentes</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Filtros de Modalidade Ativos</label>
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              {['Todos', ...MODALIDADES_ENSINO].map(m => (
                <button
                  key={m}
                  onClick={() => toggleFilter(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    config.filtros_visiveis?.includes(m)
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1">* Estes botões aparecerão como filtros na página pública.</p>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subtítulo / Texto Introdutório</label>
            <textarea
              value={config.subtitulo}
              onChange={e => setConfig(prev => ({ ...prev, subtitulo: e.target.value }))}
              rows={2}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            />
          </div>
          </div>
          </section>
        )}

        {/* Seção 2: Gerenciamento de Escolas */}
        {activeTab === 'escolas' && (
          <section className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Escolas Cadastradas</h2>
                <p className="text-sm text-slate-500">Visualize e edite as informações de cada unidade escolar</p>
              </div>
              
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input
                  type="text"
                  placeholder="Buscar por nome ou modalidade..."
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

        {/* Lista de Escolas */}
        <div className="grid grid-cols-1 gap-4">
          {schools.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">school</span>
              <p className="text-slate-500">Nenhuma escola cadastrada ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-4 text-sm font-bold text-slate-400">Miniatura</th>
                    <th className="py-4 px-4 text-sm font-bold text-slate-400">Escola</th>
                    <th className="py-4 px-4 text-sm font-bold text-slate-400">Modalidade</th>
                    <th className="py-4 px-4 text-sm font-bold text-slate-400">Endereço</th>
                    <th className="py-4 px-4 text-sm font-bold text-slate-400 text-center">Status</th>
                    <th className="py-4 px-4 text-sm font-bold text-slate-400 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map(school => (
                    <tr key={school.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div 
                          className="w-16 h-10 rounded bg-slate-100 dark:bg-slate-800 bg-cover bg-center border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden"
                          style={{ backgroundImage: school.imagem_url ? `url("${school.imagem_url}")` : 'none' }}
                        >
                          {!school.imagem_url && (
                            <span className="material-symbols-outlined text-slate-300 text-xl">school</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{school.nome}</span>
                            {school.tipo === 'demo' && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-tighter border border-blue-200">DEMO</span>
                            )}
                            {school.tipo === 'exemplo' && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-tighter border border-slate-200">EXEMPLO</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{school.slug}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{school.modalidade}</td>
                      <td className="py-3 px-4 text-sm text-slate-500 truncate max-w-[200px]">{school.endereco}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          school.status 
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {school.status ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingSchool(school)
                              setIsFormOpen(true)
                            }}
                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteSchool(school.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Excluir"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </section>
        )}
      </div>

      {/* Modal / Overlay do Formulário */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            <header className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingSchool ? 'Editar Escola' : 'Nova Escola'}
                </h3>
                <p className="text-sm text-slate-500">Preencha os dados abaixo e visualize o resultado</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="flex-1 overflow-auto p-8 grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-10">
              {/* Formulário */}
              <div>
                <SchoolForm
                  school={editingSchool || undefined}
                  isLoading={isSavingSchool}
                  onSubmit={handleSaveSchool}
                  onCancel={() => setIsFormOpen(false)}
                  onChange={setPreviewData}
                />
              </div>

              {/* Preview Side */}
              <div className="hidden lg:flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview do Card</h4>
                <div className="sticky top-0">
                  {/* Este preview deve ser alimentado em tempo real se possível, 
                      ou via estado compartilhado no componente pai */}
                  <div className="w-full max-w-[300px]">
                    <p className="text-[10px] text-slate-400 mb-2 italic">* O preview reflete os dados salvos ou pré-preenchidos</p>
                    {/* Nota: Para um preview real-time perfeito, precisaríamos passar o estado do form aqui */}
                    <div className="opacity-90 scale-95 origin-top">
                      <SchoolCardPreview school={previewData} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
