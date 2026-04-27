import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../config/supabase'
import type { SobreConfig } from '../../types'
import { ImageUpload } from '../../components/admin/ImageUpload'

const OMIT_SITE_ABOUT_UPDATE = new Set(['id', 'updated_at', 'updated_by', 'created_at'])

export default function SobreEditorPage() {
  const [config, setConfig] = useState<SobreConfig | null>(null)
  const siteAboutColumnKeysRef = useRef<Set<string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'visual' | 'conteudo' | 'mvv' | 'equipe'>('visual')

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase.from('site_about').select('*').single()
        if (error) throw error
        if (data) {
          siteAboutColumnKeysRef.current = new Set(Object.keys(data as Record<string, unknown>))
          setConfig(data as SobreConfig)
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
        toast.error('Não foi possível carregar as configurações da página Sobre.')
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  async function handleSave() {
    if (!config) return
    setSaving(true)

    try {
      const allowedKeys = siteAboutColumnKeysRef.current
      const updates: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(config)) {
        if (OMIT_SITE_ABOUT_UPDATE.has(key)) continue
        if (allowedKeys && !allowedKeys.has(key)) continue
        updates[key] = value
      }
      const { error } = await supabase
        .from('site_about')
        .update(updates)
        .eq('id', config.id)

      if (error) throw error

      toast.success('Página Sobre atualizada com sucesso.')
    } catch (error: unknown) {
      console.error('Erro ao salvar:', error)
      const message =
        error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Não foi possível salvar as alterações.'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  // Helper functions for management team
  const addTeamMember = () => {
    if (!config) return
    const newMember = {
      id: crypto.randomUUID(),
      name: 'Novo Integrante',
      role: 'Cargo',
      photo_url: '',
      order: config.management_team.length
    }
    setConfig({
      ...config,
      management_team: [...config.management_team, newMember]
    })
  }

  const updateTeamMember = (id: string, updates: Partial<SobreConfig['management_team'][0]>) => {
    if (!config) return
    const updatedTeam = config.management_team.map(member => 
      member.id === id ? { ...member, ...updates } : member
    )
    setConfig({ ...config, management_team: updatedTeam })
  }

  const removeTeamMember = (id: string) => {
    if (!config) return
    if (!confirm('Tem certeza que deseja remover este integrante?')) return
    const updatedTeam = config.management_team.filter(member => member.id !== id)
    // Reorder
    const reorderedTeam = updatedTeam.map((member, index) => ({ ...member, order: index }))
    setConfig({ ...config, management_team: reorderedTeam })
  }

  const moveMember = (index: number, direction: 'up' | 'down') => {
    if (!config) return
    const newTeam = [...config.management_team]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newTeam.length) return
    
    const temp = newTeam[index]
    newTeam[index] = newTeam[targetIndex]
    newTeam[targetIndex] = temp
    
    // Update order values
    const reorderedTeam = newTeam.map((member, i) => ({ ...member, order: i }))
    setConfig({ ...config, management_team: reorderedTeam })
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: 'visual', label: 'Banner (Hero)', icon: 'image' },
    { id: 'conteudo', label: 'Apresentação', icon: 'description' },
    { id: 'mvv', label: 'Missão, Visão e Valores', icon: 'diamond' },
    { id: 'equipe', label: 'Equipe Gestora', icon: 'groups' },
  ] as const

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Editar Página Sobre</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie as informações institucionais da Secretaria</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-colors disabled:opacity-60 shadow-sm"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
          ) : (
            <><span className="material-symbols-outlined text-lg">save</span> Salvar Alterações</>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar Tabs */}
        <div className="flex flex-col gap-1 w-full md:w-64 shrink-0 bg-white p-2 rounded-xl border border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-6 w-full">
          
          {/* Aba Visual (Hero) */}
          {activeTab === 'visual' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Configuração do Banner Superior</h2>
              
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Título Principal (H1)</span>
                  <input
                    type="text"
                    value={config.hero_title}
                    onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Subtítulo do Topo</span>
                  <textarea
                    value={config.hero_subtitle}
                    onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
                    rows={3}
                    className="rounded-lg border border-slate-300 p-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none resize-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Frase de Destaque no Banner</span>
                  <input
                    type="text"
                    value={config.hero_banner_text}
                    onChange={(e) => setConfig({ ...config, hero_banner_text: e.target.value })}
                    placeholder="Frase que aparece sobre a foto..."
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-900">Imagem de Fundo do Banner</span>
                  <span className="text-xs text-slate-500">Recomendado: 1920x600px ou similar.</span>
                </div>
                <ImageUpload 
                  value={config.hero_banner_url} 
                  onChange={(url) => setConfig({ ...config, hero_banner_url: url })}
                  folder="about"
                />
              </div>
            </section>
          )}

          {/* Aba Conteúdo (Apresentação) */}
          {activeTab === 'conteudo' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Apresentação Institucional</h2>
              
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-500 uppercase">Título da Seção</span>
                <input
                  type="text"
                  value={config.intro_title}
                  onChange={(e) => setConfig({ ...config, intro_title: e.target.value })}
                  className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-500 uppercase">Texto de Apresentação</span>
                <p className="text-xs text-slate-400 mb-1">Use &lt;br/&gt; para quebras de linha se necessário.</p>
                <textarea
                  value={config.intro_text}
                  onChange={(e) => setConfig({ ...config, intro_text: e.target.value })}
                  rows={10}
                  className="rounded-lg border border-slate-300 p-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none resize-y leading-relaxed font-mono"
                />
              </label>
            </section>
          )}

          {/* Aba MVV (Missão, Visão e Valores) */}
          {activeTab === 'mvv' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Missão, Visão e Valores</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <label className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">track_changes</span>
                    <span className="text-sm font-semibold text-slate-500 uppercase">Nossa Missão</span>
                  </div>
                  <textarea
                    value={config.mission}
                    onChange={(e) => setConfig({ ...config, mission: e.target.value })}
                    rows={3}
                    className="rounded-lg border border-slate-300 p-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none resize-none"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">visibility</span>
                    <span className="text-sm font-semibold text-slate-500 uppercase">Nossa Visão</span>
                  </div>
                  <textarea
                    value={config.vision}
                    onChange={(e) => setConfig({ ...config, vision: e.target.value })}
                    rows={3}
                    className="rounded-lg border border-slate-300 p-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none resize-none"
                  />
                </label>

                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">diamond</span>
                    <span className="text-sm font-semibold text-slate-500 uppercase">Nossos Valores (Lista)</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {config.values.map((value, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            const newValues = [...config.values]
                            newValues[index] = e.target.value
                            setConfig({ ...config, values: newValues })
                          }}
                          className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-[var(--color-primary)] outline-none"
                        />
                        <button
                          onClick={() => {
                            const newValues = config.values.filter((_, i) => i !== index)
                            setConfig({ ...config, values: newValues })
                          }}
                          className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setConfig({ ...config, values: [...config.values, ''] })}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline mt-2 self-start"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Adicionar Valor
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Aba Equipe */}
          {activeTab === 'equipe' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Equipe Gestora</h2>
                <button
                  onClick={addTeamMember}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold transition-all shadow-sm hover:brightness-110"
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Adicionar Gestor
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {config.management_team.sort((a,b) => a.order - b.order).map((member, index) => (
                  <div key={member.id} className="flex flex-col sm:flex-row gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl group transition-all hover:border-[var(--color-primary)]/30 shadow-sm">
                    {/* Foto do Gestor */}
                    <div className="w-full sm:w-32 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase text-center">Foto</span>
                      <div className="w-24 h-24 mx-auto rounded-full bg-white border border-slate-200 overflow-hidden relative">
                        <ImageUpload 
                          value={member.photo_url} 
                          onChange={(url) => updateTeamMember(member.id, { photo_url: url })}
                          folder="team"
                          hidePreview={true}
                        />
                        {member.photo_url && (
                          <img src={member.photo_url} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                        )}
                      </div>
                    </div>

                    {/* Dados do Gestor */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</span>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateTeamMember(member.id, { name: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Cargo / Função</span>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateTeamMember(member.id, { role: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                        />
                      </label>
                      <div className="sm:col-span-2 flex items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => moveMember(index, 'up')}
                          disabled={index === 0}
                          className="p-2 text-slate-400 hover:text-[var(--color-primary)] disabled:opacity-30"
                          title="Subir na lista"
                        >
                          <span className="material-symbols-outlined">arrow_upward</span>
                        </button>
                        <button
                          onClick={() => moveMember(index, 'down')}
                          disabled={index === config.management_team.length - 1}
                          className="p-2 text-slate-400 hover:text-[var(--color-primary)] disabled:opacity-30"
                          title="Descer na lista"
                        >
                          <span className="material-symbols-outlined">arrow_downward</span>
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="flex items-center gap-1 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">person_remove</span>
                          Remover Gestor
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {config.management_team.length === 0 && (
                  <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 text-sm">Nenhum gestor cadastrado.</p>
                    <button onClick={addTeamMember} className="text-[var(--color-primary)] font-bold text-sm mt-2 hover:underline">
                      Adicionar primeiro integrante
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
