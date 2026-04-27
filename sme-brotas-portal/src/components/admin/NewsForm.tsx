import { useState, useEffect } from 'react'
import type { Noticia } from '../../types'
import { ImageUpload } from './ImageUpload'
import { NewsCardPreview } from './NewsCardPreview'
import { RichTextEditor } from './RichTextEditor'

import { CATEGORIAS_NOTICIAS } from '../../constants/noticias'

interface NewsFormProps {
  initialData?: Partial<Noticia>
  onSubmit: (data: Partial<Noticia>) => void
  isSaving: boolean
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function NewsForm({ initialData, onSubmit, isSaving }: NewsFormProps) {
  const [formData, setFormData] = useState<Partial<Noticia>>({
    titulo: '',
    resumo: '',
    conteudo: '',
    categoria: 'geral',
    status: 'rascunho',
    destaque: false,
    imagem_url: '',
    ...initialData
  })

  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleChange = (field: keyof Noticia, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-generate slug if title changes and no slug exists yet (or it was auto-generated)
      if (field === 'titulo' && !initialData?.id) {
        newData.slug = generateSlug(value)
      }
      
      return newData
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form Side */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Conteúdo Principal</h3>
            <p className="text-xs text-slate-500">As informações básicas da notícia que aparecerão nos cards.</p>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Título da Notícia *</span>
              <input
                type="text"
                required
                value={formData.titulo || ''}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Secretaria lança novo programa de alfabetização"
                className="rounded-lg border border-slate-300 h-12 px-4 text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all font-medium"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Resumo / Subtítulo</span>
              <textarea
                value={formData.resumo || ''}
                onChange={(e) => handleChange('resumo', e.target.value)}
                rows={3}
                placeholder="Uma breve descrição para atrair o leitor..."
                className="rounded-lg border border-slate-300 p-4 text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all resize-none text-sm leading-relaxed"
              />
            </label>

            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Link Permanente (Slug)</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">URL da notícia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs bg-slate-50 px-3 h-10 flex items-center rounded-lg border border-slate-200">
                  /noticias/
                </span>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => handleChange('slug', generateSlug(e.target.value))}
                  placeholder="link-da-noticia"
                  className="flex-1 rounded-lg border border-slate-300 h-10 px-3 text-slate-600 text-sm focus:border-[var(--color-primary)] outline-none font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">O slug é gerado automaticamente a partir do título, mas você pode personalizá-lo.</p>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Categoria</span>
              <select
                value={formData.categoria || 'geral'}
                onChange={(e) => handleChange('categoria', e.target.value)}
                className="rounded-lg border border-slate-300 h-11 px-3 text-slate-900 focus:border-[var(--color-primary)] outline-none bg-white"
              >
                {CATEGORIAS_NOTICIAS.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Data de Publicação</span>
              <input
                type="date"
                value={formData.data_publicacao ? new Date(formData.data_publicacao).toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('data_publicacao', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="rounded-lg border border-slate-300 h-11 px-3 text-slate-900 focus:border-[var(--color-primary)] outline-none bg-white"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Status</span>
              <select
                value={formData.status || 'rascunho'}
                onChange={(e) => handleChange('status', e.target.value)}
                className={`rounded-lg border border-slate-300 h-11 px-3 text-sm font-bold focus:border-[var(--color-primary)] outline-none bg-white transition-colors ${
                  formData.status === 'publicado' ? 'text-emerald-600' : 
                  formData.status === 'arquivado' ? 'text-amber-600' : 'text-slate-500'
                }`}
              >
                <option value="rascunho">Rascunho</option>
                <option value="publicado">Publicado</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </label>

            <div className="flex flex-col gap-3 justify-center">
              <span className="text-sm font-semibold text-slate-700">Visibilidade</span>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.destaque || false}
                      onChange={(e) => handleChange('destaque', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Notícia em Destaque</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Imagem de Capa</h3>
            <p className="text-xs text-slate-500">Esta imagem aparecerá no banner da home (se for destaque) e nos cards.</p>
          </div>
          <ImageUpload
            value={formData.imagem_url || ''}
            onChange={(url) => handleChange('imagem_url', url)}
            bucket="noticias"
            folder="banners"
            maxSizeMB={5}
            recommendedSize="1920x1080 (16:9)"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Corpo da Notícia</h3>
            <p className="text-xs text-slate-500">O texto abaixo será formatado profissionalmente com parágrafos, subtítulos e listas.</p>
          </div>
          <RichTextEditor
            content={formData.conteudo || ''}
            onChange={(content) => {
              handleChange('conteudo', content)
              
              // Auxílio automático para o resumo se estiver vazio
              if (!formData.resumo || formData.resumo.length < 5) {
                const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
                if (plainText.length > 10) {
                  const suggestedResumo = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '')
                  setFormData(prev => ({ ...prev, resumo: suggestedResumo }))
                }
              }
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-4 pb-12">
          <button
            type="submit"
            disabled={isSaving || !formData.titulo}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold transition-all disabled:opacity-60 shadow-lg shadow-[var(--color-primary)]/20"
          >
            {isSaving ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
            ) : (
              <><span className="material-symbols-outlined">check_circle</span> Salvar Notícia</>
            )}
          </button>
        </div>
      </form>

      {/* Preview Side */}
      <aside className="w-full lg:w-[400px] shrink-0">
        <div className="sticky top-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Preview Real-time</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('edit')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeView === 'edit' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-slate-500'}`}
              >
                Card
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeView === 'preview' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-slate-500'}`}
              >
                Banner
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {activeView === 'edit' ? (
              <NewsCardPreview noticia={formData} />
            ) : (
              <div className="w-full">
                <NewsCardPreview noticia={formData} mode="highlight" />
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
            <span className="material-symbols-outlined text-amber-600">info</span>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-amber-900">Dica de SEO</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Títulos entre 50 e 60 caracteres e resumos de até 160 caracteres ajudam a sua notícia a aparecer melhor no Google.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
