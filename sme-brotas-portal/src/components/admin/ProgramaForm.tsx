import { useState, useEffect } from 'react'
import type { Programa } from '../../types'
import { RichTextEditor } from './RichTextEditor'
import { ImageUpload } from './ImageUpload'

interface ProgramaFormProps {
  initialData?: Partial<Programa>
  onSubmit: (data: Partial<Programa>) => void
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

export function ProgramaForm({ initialData, onSubmit, isSaving }: ProgramaFormProps) {
  const [formData, setFormData] = useState<Partial<Programa>>({
    titulo: '',
    resumo: '',
    descricao: '',
    publico_alvo: '',
    objetivos: '',
    imagem_url: '',
    texto_botao: 'Saiba mais',
    link_botao: '',
    categoria: 'Educação',
    ordem: 0,
    ativo: true,
    destaque: false,
    ...initialData
  })

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleChange = (field: keyof Programa, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo - Informações Principais */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-4">Conteúdo do Card</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Título do Programa *</span>
                <input
                  type="text"
                  required
                  value={formData.titulo || ''}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  className="rounded-lg border border-slate-300 h-12 px-4 text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all font-medium"
                  placeholder="Ex: Programa Alfabetiza Mais"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Resumo (Texto do Card) *</span>
                <textarea
                  required
                  value={formData.resumo || ''}
                  onChange={(e) => handleChange('resumo', e.target.value)}
                  rows={3}
                  className="rounded-lg border border-slate-300 p-4 text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all resize-none text-sm"
                  placeholder="Breve descrição que aparece na listagem principal..."
                />
              </label>

              <div className="md:col-span-2">
                <span className="text-sm font-semibold text-slate-700 block mb-2">Imagem de Capa</span>
                <ImageUpload
                  value={formData.imagem_url || ''}
                  onChange={(url) => handleChange('imagem_url', url)}
                  bucket="programas"
                />
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Categoria</span>
                <input
                  type="text"
                  value={formData.categoria || ''}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  className="rounded-lg border border-slate-300 h-12 px-4 text-slate-900 focus:border-[var(--color-primary)] outline-none text-sm"
                  placeholder="Ex: Educação Infantil, Inovação"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Texto do Botão</span>
                <input
                  type="text"
                  value={formData.texto_botao || ''}
                  onChange={(e) => handleChange('texto_botao', e.target.value)}
                  className="rounded-lg border border-slate-300 h-12 px-4 text-slate-900 focus:border-[var(--color-primary)] outline-none text-sm"
                  placeholder="Ex: Saiba mais"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-4">Detalhes do Programa</h3>
            
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Descrição Completa</span>
                <RichTextEditor
                  content={formData.descricao || ''}
                  onChange={(val) => handleChange('descricao', val)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Objetivos</span>
                <RichTextEditor
                  content={formData.objetivos || ''}
                  onChange={(val) => handleChange('objetivos', val)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Público-alvo</span>
                <input
                  type="text"
                  value={formData.publico_alvo || ''}
                  onChange={(e) => handleChange('publico_alvo', e.target.value)}
                  className="rounded-lg border border-slate-300 h-10 px-3 text-sm"
                  placeholder="Ex: Alunos do Ensino Fundamental I"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Lado Direito - Configurações e Links */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-4">Configurações</h3>
            
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Link Externo (Opcional)</span>
                <input
                  type="url"
                  value={formData.link_botao || ''}
                  onChange={(e) => handleChange('link_botao', e.target.value)}
                  className="rounded-lg border border-slate-300 h-10 px-3 text-sm font-mono"
                  placeholder="https://exemplo.com"
                />
                <p className="text-[10px] text-slate-400">Se preenchido, o botão levará diretamente a este link.</p>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Link Permanente (Slug)</span>
                <input
                  type="text"
                  required
                  value={formData.slug || ''}
                  onChange={(e) => handleChange('slug', generateSlug(e.target.value))}
                  className="rounded-lg border border-slate-300 h-10 px-3 text-sm font-mono bg-slate-50"
                  placeholder="slug-do-programa"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Ordem</span>
                  <input
                    type="number"
                    value={formData.ordem || 0}
                    onChange={(e) => handleChange('ordem', parseInt(e.target.value))}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-sm"
                  />
                </label>
                <div className="flex flex-col gap-2 justify-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => handleChange('ativo', e.target.checked)}
                      className="rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm font-medium text-slate-700">Ativo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.destaque}
                      onChange={(e) => handleChange('destaque', e.target.checked)}
                      className="rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm font-medium text-slate-700">Destaque</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold transition-all disabled:opacity-60 shadow-lg"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><span className="material-symbols-outlined">save</span> Salvar Programa</>
              )}
            </button>
          </div>

          {/* Preview do Card */}
          <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Preview do Card</h3>
            
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm pointer-events-none">
              <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-300">
                {formData.imagem_url ? (
                  <img src={formData.imagem_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl">image</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-2">
                  <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider bg-[var(--color-primary)]/10 px-2 py-0.5 rounded">
                    {formData.categoria || 'Educação'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2 line-clamp-1">{formData.titulo || 'Título do Programa'}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{formData.resumo || 'Descrição curta...'}</p>
                <div className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                  {formData.texto_botao || 'Saiba mais'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
