import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import type { ArquivoTransparencia, CategoriaTransparencia, IndicadorTransparencia, SiteConfig } from '../../types'
import { toast } from 'sonner'
import { AdminTransparenciaOverviewTab } from '../../components/admin/transparencia/AdminTransparenciaOverviewTab'
import { AdminTransparenciaIndicatorsTab } from '../../components/admin/transparencia/AdminTransparenciaIndicatorsTab'
import { AdminTransparenciaIndicatorDataTab } from '../../components/admin/transparencia/AdminTransparenciaIndicatorDataTab'
import {
  AdminTransparenciaPageStructureTab,
  type AdminStructureFormValues,
} from '../../components/admin/transparencia/AdminTransparenciaPageStructureTab'
import { AdminTransparenciaComplementaryDocsTab } from '../../components/admin/transparencia/AdminTransparenciaComplementaryDocsTab'
import { createDefaultDashboardIndicators, createDefaultIndicatorDataMap } from '../../components/admin/transparencia/adminIndicatorMocks'
import type { AdminDashboardIndicator, IndicatorDataBlock } from '../../components/admin/transparencia/types'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'

type TabType = 'visao-geral' | 'indicadores' | 'dados-indicadores' | 'estrutura' | 'documentos-complementares'
type DocsTab = 'arquivos' | 'categorias' | 'indicadores-legados'

const defaultConfigForm: AdminStructureFormValues = {
  titulo_pagina: '',
  descricao_pagina: '',
  indicadores_titulo: 'Painel de Indicadores',
  painel_texto_apoio: '',
  indicador_padrao: 'IDEB',
  exibir_dados_abertos: true,
  dados_abertos_url: '',
  documentos_titulo: '',
  atos_oficiais_titulo: '',
  atos_oficiais_limite: 10,
  atos_oficiais_categoria_slug: '',
}

const tabDescriptions: Record<TabType, string> = {
  'visao-geral': 'Acompanhe o status geral dos indicadores exibidos na página pública.',
  indicadores: 'Edite os cards que aparecem no Painel de Indicadores da página pública.',
  'dados-indicadores': 'Preencha indicadores resumidos, dados para gráficos e informações detalhadas de cada indicador.',
  estrutura: 'Configure títulos, textos e botões principais da página pública.',
  'documentos-complementares': 'Gerencie arquivos, atos oficiais e documentos antigos preservados.',
}

export default function TransparenciaListPage() {
  const [activeTab, setActiveTab] = useState<TabType>('visao-geral')
  const [activeDocsTab, setActiveDocsTab] = useState<DocsTab>('arquivos')
  const [arquivos, setArquivos] = useState<ArquivoTransparencia[]>([])
  const [indicadores, setIndicadores] = useState<IndicadorTransparencia[]>([])
  const [categorias, setCategorias] = useState<CategoriaTransparencia[]>([])
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Partial<CategoriaTransparencia> | null>(null)

  const [dashboardIndicators, setDashboardIndicators] = useState<AdminDashboardIndicator[]>(createDefaultDashboardIndicators())
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>(dashboardIndicators[0]?.id || '')
  const [indicatorDataMap, setIndicatorDataMap] = useState<Record<string, IndicatorDataBlock>>(() =>
    createDefaultIndicatorDataMap(createDefaultDashboardIndicators()),
  )

  const [configForm, setConfigForm] = useState<AdminStructureFormValues>(defaultConfigForm)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; table: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchData() {
    try {
      const [arquivosRes, indicadoresRes, categoriasRes, configRes] = await Promise.all([
        supabase.from('transparencia_arquivos').select('*').order('data_publicacao', { ascending: false }),
        supabase.from('transparencia_indicadores').select('*').order('ordem', { ascending: true }),
        supabase.from('transparencia_categorias').select('*').order('ordem', { ascending: true }),
        supabase.from('site_config').select('*').single(),
      ])

      if (arquivosRes.error) throw arquivosRes.error
      if (indicadoresRes.error) throw indicadoresRes.error
      if (categoriasRes.error) throw categoriasRes.error
      if (configRes.error) throw configRes.error

      setArquivos(arquivosRes.data || [])
      setIndicadores(indicadoresRes.data || [])
      setCategorias(categoriasRes.data || [])
      setSiteConfig(configRes.data)

      const transparencyConfig = configRes.data?.transparencia_config || {}
      setConfigForm({
        titulo_pagina: transparencyConfig.titulo_pagina || '',
        descricao_pagina: transparencyConfig.descricao_pagina || '',
        indicadores_titulo: transparencyConfig.indicadores_titulo || 'Painel de Indicadores',
        painel_texto_apoio: transparencyConfig.painel_texto_apoio || '',
        indicador_padrao: transparencyConfig.indicador_padrao || 'IDEB',
        exibir_dados_abertos: transparencyConfig.exibir_dados_abertos !== false,
        dados_abertos_url: transparencyConfig.dados_abertos_url || '',
        documentos_titulo: transparencyConfig.documentos_titulo || '',
        atos_oficiais_titulo: transparencyConfig.atos_oficiais_titulo || '',
        atos_oficiais_limite: transparencyConfig.atos_oficiais_limite || 10,
        atos_oficiais_categoria_slug: transparencyConfig.atos_oficiais_categoria_slug || '',
      })
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      toast.error('Erro ao carregar dados da transparência')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function saveConfig() {
    if (!siteConfig) return
    setSaving(true)
    try {
      const newConfig = { ...siteConfig.transparencia_config, ...configForm }
      const { error } = await supabase.from('site_config').update({ transparencia_config: newConfig }).eq('id', siteConfig.id)
      if (error) throw error
      toast.success('Estrutura da página atualizada!')
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  async function saveCategory() {
    if (!editingCategory?.nome || !editingCategory?.slug) {
      toast.error('Nome e slug são obrigatórios')
      return
    }

    setSaving(true)
    try {
      if (editingCategory.id) {
        const { error } = await supabase.from('transparencia_categorias').update(editingCategory).eq('id', editingCategory.id)
        if (error) throw error
        toast.success('Categoria atualizada!')
      } else {
        const { error } = await supabase.from('transparencia_categorias').insert([editingCategory])
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

  async function toggleAtivo(item: { id: string; ativo: boolean }, table: string) {
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

  function requestDeleteItem(id: string, table: string) {
    setDeleteTarget({ id, table })
  }

  async function executeDeleteItem() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error } = await supabase.from(deleteTarget.table).delete().eq('id', deleteTarget.id)
      if (!error) {
        toast.success('Item excluído com sucesso.')
        setDeleteTarget(null)
        fetchData()
      } else {
        toast.error('Erro ao excluir item.')
      }
    } finally {
      setDeleting(false)
    }
  }

  const lastUpdated = new Date().toLocaleString('pt-BR')

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transparência e Indicadores</h1>
          <p className="text-slate-500 mt-1">Painel administrativo da dashboard pública de Transparência Educacional.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/transparencia/ideb"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-base">query_stats</span>
            Ir para gestão IDEB
          </Link>
          <Link
            to="/admin/transparencia/fundeb"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-base">account_balance</span>
            Ir para gestão FUNDEB
          </Link>
        </div>
      </div>

      <div className="w-full bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5">
        {[
          { id: 'visao-geral', label: 'Visão Geral', icon: 'dashboard', step: '01' },
          { id: 'indicadores', label: 'Indicadores', icon: 'grid_view', step: '02' },
          { id: 'dados-indicadores', label: 'Dados dos Indicadores', icon: 'table_chart', step: '03' },
          { id: 'estrutura', label: 'Estrutura da Página', icon: 'settings', step: '04' },
          { id: 'documentos-complementares', label: 'Documentos Complementares', icon: 'folder', step: '05' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200 hover:bg-white'
            }`}
          >
            <span className={`text-[10px] px-2 py-1 rounded-md font-black ${activeTab === tab.id ? 'bg-white/15' : 'bg-slate-200 text-slate-700'}`}>
              {tab.step}
            </span>
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            <span className="text-left leading-tight">{tab.label}</span>
          </button>
        ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm text-slate-700 font-medium">{tabDescriptions[activeTab]}</p>
      </div>

      {activeTab === 'visao-geral' && (
        <AdminTransparenciaOverviewTab
          indicators={dashboardIndicators}
          documentosCount={arquivos.length}
          ultimaAtualizacao={lastUpdated}
        />
      )}

      {activeTab === 'indicadores' && (
        <AdminTransparenciaIndicatorsTab indicators={dashboardIndicators} onChange={setDashboardIndicators} />
      )}

      {activeTab === 'dados-indicadores' && (
        <AdminTransparenciaIndicatorDataTab
          indicators={dashboardIndicators}
          selectedIndicatorId={selectedIndicatorId}
          onSelectIndicator={setSelectedIndicatorId}
          indicatorDataMap={indicatorDataMap}
          onUpdateData={(id, next) => setIndicatorDataMap((prev) => ({ ...prev, [id]: next }))}
        />
      )}

      {activeTab === 'estrutura' && (
        <AdminTransparenciaPageStructureTab
          values={configForm}
          categorias={categorias}
          saving={saving}
          onChange={setConfigForm}
          onSave={saveConfig}
        />
      )}

      {activeTab === 'documentos-complementares' && (
        <AdminTransparenciaComplementaryDocsTab
          arquivos={arquivos}
          categorias={categorias}
          indicadores={indicadores}
          docsTab={activeDocsTab}
          onChangeDocsTab={setActiveDocsTab}
          onNewCategory={() =>
            setEditingCategory({
              nome: '',
              slug: '',
              icone: 'description',
              ordem: categorias.length + 1,
              ativo: true,
            })
          }
          onEditCategory={(category) => setEditingCategory(category)}
          onToggleArquivo={(arquivo) => toggleAtivo(arquivo, 'transparencia_arquivos')}
          onDeleteArquivo={(id) => requestDeleteItem(id, 'transparencia_arquivos')}
          onToggleCategoria={(categoria) => toggleAtivo(categoria, 'transparencia_categorias')}
          onToggleIndicador={(indicador) => toggleAtivo(indicador, 'transparencia_indicadores')}
          onDeleteIndicador={(id) => requestDeleteItem(id, 'transparencia_indicadores')}
        />
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent showCloseButton={!deleting}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={() => void executeDeleteItem()} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900">{editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nome da categoria">
                  <input
                    type="text"
                    className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]"
                    value={editingCategory.nome || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, nome: e.target.value })}
                  />
                </Field>
                <Field label="Slug">
                  <input
                    type="text"
                    className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]"
                    value={editingCategory.slug || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    disabled={!!editingCategory.id}
                  />
                </Field>
              </div>
              <Field label="Descrição">
                <input
                  type="text"
                  className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]"
                  value={editingCategory.descricao || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, descricao: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ícone">
                  <input
                    type="text"
                    className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]"
                    value={editingCategory.icone || 'description'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icone: e.target.value })}
                  />
                </Field>
                <Field label="Ordem">
                  <input
                    type="number"
                    className="h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-[var(--color-primary)]"
                    value={editingCategory.ordem || 1}
                    onChange={(e) => setEditingCategory({ ...editingCategory, ordem: Number(e.target.value) || 1 })}
                  />
                </Field>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditingCategory(null)} className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200">
                Cancelar
              </button>
              <button onClick={saveCategory} disabled={saving} className="px-6 py-2 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar Categoria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}
