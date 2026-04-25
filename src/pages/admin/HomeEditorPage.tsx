import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../config/supabase'
import { Link } from 'react-router-dom'
import type { SiteConfig, DraggableItem, NumericIndicatorItem, Noticia } from '../../types'
import { ArrayEditor } from '../../components/admin/ArrayEditor'
import { AcessoRapidoEditor } from '../../components/admin/AcessoRapidoEditor'
import { ImageUpload } from '../../components/admin/ImageUpload'
import { getCategoriaLabel, getStatusLabel, getStatusStyle } from '../../constants/noticias'
import type { StatusNoticia } from '../../constants/noticias'

export default function HomeEditorPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'hero' | 'cabecalho' | 'navegacao' | 'acesso-rapido' | 'noticias' | 'estatisticas' | 'perfil' | 'rodape'>('hero')
  const [latestNews, setLatestNews] = useState<Noticia[]>([])

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('site_config').select('*').single()
      if (data) {
        // Migration safeguard: Ensure empty arrays are ready
        const safeData = {
          ...data,
          hero_botao_primario: data.hero_botao_primario || { texto: 'Portal do Aluno', link: '/portal' },
          hero_botao_secundario: data.hero_botao_secundario || { texto: 'Conheça Nossas Escolas', link: '/escolas' },
          hero_overlay_opacidade: data.hero_overlay_opacidade ?? 80,
          acesso_rapido_titulo: data.acesso_rapido_titulo || 'Acesso Rápido',
          acessos_rapidos: data.acessos_rapidos || [],
          noticias_secao_titulo: data.noticias_secao_titulo || 'Últimas Notícias',
          noticias_secao_link_texto: data.noticias_secao_link_texto || 'Ver todas',
          estatisticas_titulo: data.estatisticas_titulo || 'Educação em Números',
          estatisticas: Array.isArray(data.estatisticas) ? data.estatisticas : [], // ignore legacy literal object for UI editing if missing
          acesso_perfil_titulo: data.acesso_perfil_titulo || 'Acesso por Perfil',
          acessos_perfil: data.acessos_perfil || [],
          rodape_texto: data.rodape_texto || '',
          rodape_endereco: data.rodape_endereco || '',
          rodape_telefone: data.rodape_telefone || '',
          rodape_email: data.rodape_email || '',
          rodape_links_uteis: data.rodape_links_uteis || [],
          rodape_redes_sociais: data.rodape_redes_sociais || [],
          rodape_links_estaticos: data.rodape_links_estaticos || [
            { id: '1', nome: 'Política de Privacidade', link: '/contato', ativo: true, ordem: 0 },
            { id: '2', nome: 'Termos de Uso', link: '/contato', ativo: true, ordem: 1 },
            { id: '3', nome: 'Mapa do Site', link: '/', ativo: true, ordem: 2 },
          ],
          header_action_buttons: data.header_action_buttons || [
            { id: '1', texto: 'Portal Educacional', link: '/portal', ativo: true, target_blank: false, cor: 'primary', ordem: 0 },
            { id: '2', texto: 'Portal do Servidor', link: 'https://www.keepinformatica.com.br/contracheque/web/user-management/auth/login', ativo: true, target_blank: true, cor: 'slate', ordem: 1 }
          ],
          nav_links: data.nav_links || [
            { id: '1', to: '/', label: 'Início', ativo: true, ordem: 0 },
            { id: '2', to: '/sobre', label: 'Sobre', ativo: true, ordem: 1 },
            { id: '3', to: '/escolas', label: 'Escolas', ativo: true, ordem: 2 },
            { id: '4', to: '/servicos', label: 'Serviços', ativo: true, ordem: 3 },
            { id: '5', to: '/noticias', label: 'Notícias', ativo: true, ordem: 4 },
            { id: '6', to: '/programas', label: 'Programas', ativo: true, ordem: 5 },
            { id: '7', to: '/transparencia', label: 'Transparência', ativo: true, ordem: 6 },
            { id: '8', to: '/contato', label: 'Contato', ativo: true, ordem: 7 },
          ]
        }
        
        // If estatisticas is ancient object, inject default
        if (!Array.isArray(data.estatisticas) && data.estatisticas) {
           safeData.estatisticas = [
             { id: '1', nome: 'Escolas da Rede', valor: data.estatisticas.escolas || 142, icone: 'apartment', ordem: 0, ativo: true },
             { id: '2', nome: 'Alunos Matriculados', valor: data.estatisticas.alunos || 45280, icone: 'face', ordem: 1, ativo: true },
             { id: '3', nome: 'Professores', valor: data.estatisticas.professores || 3850, icone: 'group', ordem: 2, ativo: true }
           ]
        }
        
        setConfig(safeData as SiteConfig)
      }
      setLoading(false)
    }
    fetchConfig()
    fetchLatestNews()
  }, [])

  async function fetchLatestNews() {
    const { data } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setLatestNews(data as Noticia[])
  }

  async function toggleDestaque(noticia: Noticia) {
    const nextStatus = !noticia.destaque
    
    // Se for marcar como destaque, desmarcar os outros (opcional, mas comum para manter apenas 1 destaque principal)
    // No nosso portal, pegamos o destaque mais recente, então não é estritamente necessário desmarcar,
    // mas visualmente ajuda o usuário a entender qual é o destaque atual.
    
    const { error } = await supabase
      .from('noticias')
      .update({ destaque: nextStatus })
      .eq('id', noticia.id)

    if (!error) {
      toast.success(nextStatus ? 'Notícia marcada como destaque!' : 'Destaque removido.')
      fetchLatestNews()
    } else {
      toast.error('Erro ao atualizar destaque.')
    }
  }

  async function deleteNoticia(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return
    const { error } = await supabase.from('noticias').delete().eq('id', id)
    if (!error) {
      toast.success('Notícia excluída.')
      fetchLatestNews()
    } else {
      toast.error('Erro ao excluir.')
    }
  }

  async function handleSave() {
    if (!config) return
    setSaving(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, updated_at, updated_by, ...updates } = config
      const { error } = await supabase
        .from('site_config')
        .update(updates)
        .eq('id', config.id)

      if (error) throw error

      toast.success('Página inicial salva com sucesso.')
    } catch {
      toast.error('Não foi possível salvar as alterações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: 'hero', label: 'Banner / Hero', icon: 'image' },
    { id: 'cabecalho', label: 'Cabeçalho', icon: 'top_panel_open' },
    { id: 'navegacao', label: 'Menu Navegação', icon: 'menu' },
    { id: 'acesso-rapido', label: 'Acesso Rápido', icon: 'grid_view' },
    { id: 'noticias', label: 'Últimas Notícias', icon: 'newspaper' },
    { id: 'estatisticas', label: 'Estatísticas', icon: 'bar_chart' },
    { id: 'perfil', label: 'Acesso por Perfil', icon: 'group' },
    { id: 'rodape', label: 'Rodapé', icon: 'bottom_panel_open' },
  ] as const

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Página Inicial</h1>
          <p className="text-slate-500 text-sm mt-1">Altere o conteúdo que aparece na home do site</p>
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
          
          {/* Aba Hero */}
          {activeTab === 'hero' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Conteúdo do Banner (Hero)</h2>

              {/* Aviso (Selo) */}
              <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-4 border border-slate-200 border-l-4 border-l-[var(--color-primary)]">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.aviso_ativo}
                      onChange={(e) => setConfig({ ...config, aviso_ativo: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                  </label>
                  <span className="text-sm font-bold text-slate-700">Ativar Selo Destacado</span>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Texto do Selo</span>
                  <input
                    type="text"
                    value={config.aviso_banner}
                    onChange={(e) => setConfig({ ...config, aviso_banner: e.target.value })}
                    placeholder="Ex: Matrículas 2024 Abertas"
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                  />
                </label>
              </div>

              {/* Títulos */}
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Título Principal (H1)</span>
                  <input
                    type="text"
                    value={config.titulo_principal}
                    onChange={(e) => setConfig({ ...config, titulo_principal: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Subtítulo Explicativo</span>
                  <textarea
                    value={config.subtitulo}
                    onChange={(e) => setConfig({ ...config, subtitulo: e.target.value })}
                    rows={3}
                    className="rounded-lg border border-slate-300 p-3 text-slate-900 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-y"
                  />
                </label>
              </div>

              {/* Visuals */}
              <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-900">Imagem de Fundo</span>
                    <span className="text-xs text-slate-500">Faça o upload da imagem principal que aparecerá no topo do site.</span>
                  </div>
                  <ImageUpload 
                    value={config.hero_imagem_url || ''} 
                    onChange={(url) => setConfig({ ...config, hero_imagem_url: url })}
                    recommendedSize="1920x1080 (Proporção 16:9)"
                    maxSizeMB={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex flex-col gap-2 flex-1">
                    <span className="text-sm font-semibold text-slate-500 uppercase">URL Imagem (Modo Avançado)</span>
                    <input
                      type="text"
                      value={config.hero_imagem_url}
                      onChange={(e) => setConfig({ ...config, hero_imagem_url: e.target.value })}
                      placeholder="https://..."
                      className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 sm:w-48">
                    <span className="text-sm font-semibold text-slate-500 uppercase">Opacidade Escura (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={config.hero_overlay_opacidade}
                      onChange={(e) => setConfig({ ...config, hero_overlay_opacidade: Number(e.target.value) })}
                      className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                    />
                  </label>
                </div>
              </div>

              {/* Botões */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="flex flex-col gap-4">
                  <span className="text-sm font-bold text-slate-900">Botão Primário</span>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Texto</span>
                    <input
                      type="text"
                      value={config.hero_botao_primario?.texto || ''}
                      onChange={(e) => setConfig({ ...config, hero_botao_primario: { ...config.hero_botao_primario!, texto: e.target.value } })}
                      className="rounded border border-slate-300 h-10 px-3 text-sm focus:border-[var(--color-primary)] outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Link</span>
                    <input
                      type="text"
                      value={config.hero_botao_primario?.link || ''}
                      onChange={(e) => setConfig({ ...config, hero_botao_primario: { ...config.hero_botao_primario!, link: e.target.value } })}
                      className="rounded border border-slate-300 h-10 px-3 text-sm focus:border-[var(--color-primary)] outline-none"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-sm font-bold text-slate-900">Botão Secundário</span>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Texto</span>
                    <input
                      type="text"
                      value={config.hero_botao_secundario?.texto || ''}
                      onChange={(e) => setConfig({ ...config, hero_botao_secundario: { ...config.hero_botao_secundario!, texto: e.target.value } })}
                      className="rounded border border-slate-300 h-10 px-3 text-sm focus:border-[var(--color-primary)] outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Link</span>
                    <input
                      type="text"
                      value={config.hero_botao_secundario?.link || ''}
                      onChange={(e) => setConfig({ ...config, hero_botao_secundario: { ...config.hero_botao_secundario!, link: e.target.value } })}
                      className="rounded border border-slate-300 h-10 px-3 text-sm focus:border-[var(--color-primary)] outline-none"
                    />
                  </label>
                </div>
              </div>

            </section>
          )}

          {/* Aba Cabeçalho */}
          {activeTab === 'cabecalho' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Botões de Ação do Cabeçalho</h2>
              <p className="text-sm text-slate-500 -mt-2">Configure os botões que aparecem no topo superior direito do site.</p>

              <div className="flex flex-col gap-8 mt-4">
                {config.header_action_buttons?.map((botao, index) => (
                  <div key={botao.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-5 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${botao.ativo ? 'bg-green-500' : 'bg-slate-300'}`} />
                        <span className="font-bold text-slate-900">Botão {index + 1}: {botao.texto}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={botao.ativo}
                          onChange={(e) => {
                            const newButtons = [...config.header_action_buttons!]
                            newButtons[index] = { ...botao, ativo: e.target.checked }
                            setConfig({ ...config, header_action_buttons: newButtons })
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                        <span className="ml-3 text-sm font-medium text-slate-600">{botao.ativo ? 'Ativo' : 'Inativo'}</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Título do Botão</span>
                        <input
                          type="text"
                          value={botao.texto}
                          onChange={(e) => {
                            const newButtons = [...config.header_action_buttons!]
                            newButtons[index] = { ...botao, texto: e.target.value }
                            setConfig({ ...config, header_action_buttons: newButtons })
                          }}
                          className="rounded-lg border border-slate-300 h-10 px-3 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Link / URL</span>
                        <input
                          type="text"
                          value={botao.link}
                          onChange={(e) => {
                            const newButtons = [...config.header_action_buttons!]
                            newButtons[index] = { ...botao, link: e.target.value }
                            setConfig({ ...config, header_action_buttons: newButtons })
                          }}
                          className="rounded-lg border border-slate-300 h-10 px-3 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={botao.target_blank}
                          onChange={(e) => {
                            const newButtons = [...config.header_action_buttons!]
                            newButtons[index] = { ...botao, target_blank: e.target.checked }
                            setConfig({ ...config, header_action_buttons: newButtons })
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Abrir em nova aba</span>
                      </label>

                      <div className="flex items-center gap-3 ml-auto">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Estilo:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newButtons = [...config.header_action_buttons!]
                              newButtons[index] = { ...botao, cor: 'primary' }
                              setConfig({ ...config, header_action_buttons: newButtons })
                            }}
                            className={`px-3 py-1 rounded text-xs font-bold border ${botao.cor === 'primary' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary'}`}
                          >
                            Azul
                          </button>
                          <button
                            onClick={() => {
                              const newButtons = [...config.header_action_buttons!]
                              newButtons[index] = { ...botao, cor: 'slate' }
                              setConfig({ ...config, header_action_buttons: newButtons })
                            }}
                            className={`px-3 py-1 rounded text-xs font-bold border ${botao.cor === 'slate' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-800'}`}
                          >
                            Escuro
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Aba Menu Navegação */}
          {activeTab === 'navegacao' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Menu de Navegação</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Edite, reordene e oculte itens do menu principal (Início, Sobre, Escolas, etc.).
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {config.nav_links?.map((link, index) => (
                  <div key={link.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${link.ativo ? 'bg-green-500' : 'bg-slate-300'}`} />
                        <span className="font-bold text-slate-900">Item {index + 1}: {link.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.ativo}
                          onChange={(e) => {
                            const newLinks = [...config.nav_links!]
                            newLinks[index] = { ...link, ativo: e.target.checked }
                            setConfig({ ...config, nav_links: newLinks })
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                        <span className="ml-3 text-sm font-medium text-slate-600">{link.ativo ? 'Visível' : 'Oculto'}</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Texto que aparece no menu</span>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const newLinks = [...config.nav_links!]
                            newLinks[index] = { ...link, label: e.target.value }
                            setConfig({ ...config, nav_links: newLinks })
                          }}
                          className="rounded-lg border border-slate-300 h-10 px-3 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Link de destino</span>
                        <input
                          type="text"
                          value={link.to}
                          onChange={(e) => {
                            const newLinks = [...config.nav_links!]
                            newLinks[index] = { ...link, to: e.target.value }
                            setConfig({ ...config, nav_links: newLinks })
                          }}
                          className="rounded-lg border border-slate-300 h-10 px-3 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Posição na ordem:</span>
                      <input
                        type="number"
                        min="0"
                        value={link.ordem}
                        onChange={(e) => {
                          const newLinks = [...config.nav_links!]
                          newLinks[index] = { ...link, ordem: Number(e.target.value) }
                          setConfig({ ...config, nav_links: newLinks })
                        }}
                        className="w-20 rounded-lg border border-slate-300 h-9 px-3 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                      />
                      <span className="text-xs text-slate-400 ml-2">(menor = aparece primeiro)</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-2">
                <p className="text-xs text-slate-700">
                  <span className="font-bold">Dica:</span> Use valores de ordem sequenciais (0, 1, 2, 3...) para organizar os itens. 
                  Itens com o mesmo valor aparecerão na ordem que foram salvos.
                </p>
              </div>
            </section>
          )}

          {/* Aba Acesso Rápido */}
          {activeTab === 'acesso-rapido' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Configuração do Acesso Rápido</h2>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Título da Seção (Aparece acima dos cards)</span>
                  <input
                    type="text"
                    value={config.acesso_rapido_titulo}
                    onChange={(e) => setConfig({ ...config, acesso_rapido_titulo: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none bg-white"
                  />
                </label>
              </div>

              <div className="pt-2">
                <AcessoRapidoEditor />
              </div>
            </section>
          )}

          {/* Aba Estatísticas */}
          {activeTab === 'estatisticas' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Educação em Números (Estatísticas)</h2>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-500 uppercase">Título da Seção</span>
                <input
                  type="text"
                  value={config.estatisticas_titulo}
                  onChange={(e) => setConfig({ ...config, estatisticas_titulo: e.target.value })}
                  className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                />
              </label>

              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Indicadores Numéricos</h3>
                <ArrayEditor<NumericIndicatorItem> 
                  itemType="numeric"
                  items={Array.isArray(config.estatisticas) ? config.estatisticas : []} 
                  onChange={(items) => setConfig({ ...config, estatisticas: items })} 
                />
              </div>
            </section>
          )}

          {/* Aba Perfil */}
          {activeTab === 'perfil' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Acesso por Perfil</h2>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-500 uppercase">Título da Seção</span>
                <input
                  type="text"
                  value={config.acesso_perfil_titulo}
                  onChange={(e) => setConfig({ ...config, acesso_perfil_titulo: e.target.value })}
                  className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                />
              </label>

              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Cards de Perfil</h3>
                <ArrayEditor<DraggableItem> 
                  items={config.acessos_perfil || []} 
                  onChange={(items) => setConfig({ ...config, acessos_perfil: items })} 
                />
              </div>
            </section>
          )}

          {/* Aba Notícias */}
          {activeTab === 'noticias' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Seção de Notícias (Home)</h2>
                  <p className="text-slate-500 text-sm mt-1">Gerencie as notícias e destaques que aparecem no portal.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/admin/noticias/nova"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-bold transition-all shadow-sm hover:brightness-110 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Nova Notícia
                  </Link>
                  <Link
                    to="/admin/noticias"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">list</span>
                    Ver Todas
                  </Link>
                </div>
              </div>

              {/* Configurações de Texto da Seção */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Título da Seção na Home</span>
                  <input
                    type="text"
                    value={config.noticias_secao_titulo}
                    onChange={(e) => setConfig({ ...config, noticias_secao_titulo: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Texto do Botão "Ver Todas"</span>
                  <input
                    type="text"
                    value={config.noticias_secao_link_texto}
                    onChange={(e) => setConfig({ ...config, noticias_secao_link_texto: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                  />
                </label>
              </div>

              {/* Gerenciamento Rápido de Notícias */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">rss_feed</span>
                    Últimas Publicações
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">MOSTRANDO AS ÚLTIMAS 5</span>
                </div>
                
                {latestNews.length === 0 ? (
                  <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400 text-sm">Nenhuma notícia publicada ainda.</p>
                    <Link to="/admin/noticias/nova" className="text-[var(--color-primary)] text-sm font-bold mt-2 inline-block hover:underline">
                      Criar minha primeira notícia
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {latestNews.map((news) => (
                      <div key={news.id} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm group hover:border-[var(--color-primary)]/30 transition-all">
                        {/* Thumbnail */}
                        <div className="w-20 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 relative">
                          {news.imagem_url ? (
                            <img src={news.imagem_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <span className="material-symbols-outlined">image</span>
                            </div>
                          )}
                          {news.destaque && (
                            <div className="absolute inset-0 bg-amber-500/10 flex items-start justify-end p-1">
                              <span className="material-symbols-outlined text-amber-500 text-sm font-bold drop-shadow-sm bg-white rounded-full">star</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-tight">
                              {getCategoriaLabel(news.categoria)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(news.created_at!).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 truncate group-hover:text-[var(--color-primary)] transition-colors">
                            {news.titulo}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStatusStyle(news.status as StatusNoticia).bg} ${getStatusStyle(news.status as StatusNoticia).color}`}>
                              {getStatusLabel(news.status as StatusNoticia)}
                            </span>
                            {news.destaque && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                                Destaque na Home
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleDestaque(news)}
                            className={`p-2 rounded-lg transition-all ${news.destaque ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                            title={news.destaque ? "Remover destaque" : "Marcar como destaque"}
                          >
                            <span className="material-symbols-outlined text-xl">star</span>
                          </button>
                          <Link
                            to={`/admin/noticias/${news.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </Link>
                          <button
                            onClick={() => deleteNoticia(news.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Excluir"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Aba Rodapé */}
          {activeTab === 'rodape' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Rodapé Público</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">E-mail</span>
                  <input
                    type="text"
                    value={config.rodape_email}
                    onChange={(e) => setConfig({ ...config, rodape_email: e.target.value })}
                    placeholder="exemplo@smebrotas.sp.gov.br"
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Endereço Físico</span>
                  <input
                    type="text"
                    value={config.rodape_endereco}
                    onChange={(e) => setConfig({ ...config, rodape_endereco: e.target.value })}
                    placeholder="Av. Mario Pinotti, 123..."
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Telefone Principal</span>
                  <input
                    type="text"
                    value={config.rodape_telefone}
                    onChange={(e) => setConfig({ ...config, rodape_telefone: e.target.value })}
                    placeholder="(14) 3653-xxxx"
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Texto Institucional (Sobre o Footer)</span>
                  <textarea
                    value={config.rodape_texto}
                    onChange={(e) => setConfig({ ...config, rodape_texto: e.target.value })}
                    rows={3}
                    className="rounded-lg border border-slate-300 p-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none resize-y"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Links Úteis (Acesso Rápido Footer)</h3>
                <ArrayEditor<DraggableItem> 
                  items={config.rodape_links_uteis || []} 
                  onChange={(items) => setConfig({ ...config, rodape_links_uteis: items })} 
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Redes Sociais</h3>
                <ArrayEditor<DraggableItem> 
                  items={config.rodape_redes_sociais || []} 
                  onChange={(items) => setConfig({ ...config, rodape_redes_sociais: items })} 
                />
                <p className="text-xs text-slate-500 mt-2">Dica: No ícone, escreva o nome da rede, por exemplo "facebook" (para Facebook) ou "instagram".</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Links Estáticos (Rodapé Inferior)</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  Configure os links que aparecem na parte inferior do rodapé (Política de Privacidade, Termos de Uso, Mapa do Site).
                </p>
                <ArrayEditor<DraggableItem> 
                  items={config.rodape_links_estaticos || []} 
                  onChange={(items) => setConfig({ ...config, rodape_links_estaticos: items })} 
                />
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
