import { useEffect, useState } from 'react'
import { supabase } from '../../config/supabase'
import type { ArquivoTransparencia, CategoriaTransparencia } from '../../types'
import { FileUpload } from './FileUpload'
import { toast } from 'sonner'

interface ArquivoFormProps {
  initialData?: Partial<ArquivoTransparencia>
  onSubmit: (data: Partial<ArquivoTransparencia>) => void
  isSaving: boolean
}

export function ArquivoForm({ initialData, onSubmit, isSaving }: ArquivoFormProps) {
  const [formData, setFormData] = useState<Partial<ArquivoTransparencia>>({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    categoria: initialData?.categoria || '',
    arquivo_url: initialData?.arquivo_url || '',
    data_publicacao: initialData?.data_publicacao || new Date().toISOString().split('T')[0],
    numero: initialData?.numero || '',
    ordem: initialData?.ordem || 0,
    ativo: initialData?.ativo !== undefined ? initialData.ativo : true,
  })

  const [categorias, setCategorias] = useState<CategoriaTransparencia[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const { data, error } = await supabase
          .from('transparencia_categorias')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true })

        if (error) throw error
        setCategorias(data || [])
        
        // Se estiver criando um novo e não tiver categoria selecionada, pega a primeira
        if (!formData.categoria && data && data.length > 0) {
          setFormData(prev => ({ ...prev, categoria: data[0].slug }))
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
        toast.error('Não foi possível carregar as categorias de documentos.')
      } finally {
        setLoadingCategorias(false)
      }
    }

    fetchCategorias()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.categoria) {
      toast.error('Por favor, selecione uma categoria.')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Informações Principais */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">info</span>
              Informações do Documento
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título do Documento</label>
              <input
                type="text"
                required
                placeholder="Ex: Plano Municipal de Educação 2024"
                className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição/Resumo (Opcional)</label>
              <textarea
                placeholder="Breve descrição sobre o conteúdo deste documento..."
                rows={4}
                className="p-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm resize-none"
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                <div className="relative">
                  <select
                    required
                    disabled={loadingCategorias}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm appearance-none bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    {loadingCategorias ? (
                      <option>Carregando categorias...</option>
                    ) : categorias.length === 0 ? (
                      <option value="">Nenhuma categoria encontrada</option>
                    ) : (
                      categorias.map(cat => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.nome}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número do Documento (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: 01/2024 ou Lei 123"
                  className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                  value={formData.numero || ''}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">upload_file</span>
              Arquivo do Documento
            </h2>
            <FileUpload
              value={formData.arquivo_url || ''}
              onChange={(url) => setFormData({ ...formData, arquivo_url: url })}
              bucket="transparencia"
            />
          </div>
        </div>

        {/* Lado Direito: Configurações e Publicação */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">settings</span>
              Configurações
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data de Publicação</label>
              <input
                type="date"
                required
                className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                value={formData.data_publicacao?.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordem de Exibição</label>
              <input
                type="number"
                required
                className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                value={formData.ordem}
                onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Visibilidade</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                  {formData.ativo ? 'Público no Portal' : 'Oculto (Rascunho)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, ativo: !formData.ativo })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  formData.ativo ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.ativo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={isSaving || !formData.arquivo_url || loadingCategorias || categorias.length === 0}
              className="w-full h-12 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold transition-all shadow-lg shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Salvar Documento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
