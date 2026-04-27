import { useState, useEffect } from 'react'
import type { Servico } from '../../types'
import { RichTextEditor } from './RichTextEditor'

interface ServicoFormProps {
  initialData?: Partial<Servico>
  onSubmit: (data: Partial<Servico>) => void
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

export function ServicoForm({ initialData, onSubmit, isSaving }: ServicoFormProps) {
  const [formData, setFormData] = useState<Partial<Servico>>({
    titulo: '',
    resumo: '',
    descricao: '',
    publico_alvo: '',
    como_solicitar: '',
    documentos: '',
    prazo: '',
    canal_atendimento: '',
    link_externo: '',
    texto_link: 'Acessar Serviço',
    icone: 'description',
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

  const handleChange = (field: keyof Servico, value: any) => {
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
                <span className="text-sm font-semibold text-slate-700">Título do Serviço *</span>
                <input
                  type="text"
                  required
                  value={formData.titulo || ''}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  className="rounded-lg border border-slate-300 h-12 px-4 text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all font-medium"
                  placeholder="Ex: Matrícula Escolar"
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

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Ícone (Material Symbol)</span>
                <div className="flex gap-2">
                  <div className="size-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[var(--color-primary)]">
                    <span className="material-symbols-outlined">{formData.icone || 'description'}</span>
                  </div>
                  <input
                    type="text"
                    value={formData.icone || ''}
                    onChange={(e) => handleChange('icone', e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 h-12 px-4 text-slate-600 focus:border-[var(--color-primary)] outline-none text-sm font-mono"
                    placeholder="Ex: person_add"
                  />
                </div>
                <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-[10px] text-[var(--color-primary)] hover:underline">Ver galeria de ícones</a>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Texto do Botão</span>
                <input
                  type="text"
                  value={formData.texto_link || ''}
                  onChange={(e) => handleChange('texto_link', e.target.value)}
                  className="rounded-lg border border-slate-300 h-12 px-4 text-slate-900 focus:border-[var(--color-primary)] outline-none text-sm"
                  placeholder="Ex: Acessar Serviço"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-4">Informações Detalhadas</h3>
            
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Descrição Completa</span>
                <RichTextEditor
                  content={formData.descricao || ''}
                  onChange={(val) => handleChange('descricao', val)}
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Público-alvo</span>
                  <input
                    type="text"
                    value={formData.publico_alvo || ''}
                    onChange={(e) => handleChange('publico_alvo', e.target.value)}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-sm"
                    placeholder="Ex: Pais e responsáveis"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Prazo Estimado</span>
                  <input
                    type="text"
                    value={formData.prazo || ''}
                    onChange={(e) => handleChange('prazo', e.target.value)}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-sm"
                    placeholder="Ex: Imediato / 5 dias úteis"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Documentos Necessários</span>
                <textarea
                  value={formData.documentos || ''}
                  onChange={(e) => handleChange('documentos', e.target.value)}
                  rows={3}
                  className="rounded-lg border border-slate-300 p-3 text-sm"
                  placeholder="Liste os documentos necessários..."
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Como Solicitar</span>
                <textarea
                  value={formData.como_solicitar || ''}
                  onChange={(e) => handleChange('como_solicitar', e.target.value)}
                  rows={3}
                  className="rounded-lg border border-slate-300 p-3 text-sm"
                  placeholder="Passo a passo para solicitação..."
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Canais de Atendimento</span>
                <input
                  type="text"
                  value={formData.canal_atendimento || ''}
                  onChange={(e) => handleChange('canal_atendimento', e.target.value)}
                  className="rounded-lg border border-slate-300 h-10 px-3 text-sm"
                  placeholder="Ex: Presencial na SME / Online"
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
                  value={formData.link_externo || ''}
                  onChange={(e) => handleChange('link_externo', e.target.value)}
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
                  placeholder="slug-do-servico"
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
                <><span className="material-symbols-outlined">save</span> Salvar Serviço</>
              )}
            </button>
          </div>

          {/* Preview do Card */}
          <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Preview do Card</h3>
            
            <div className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm pointer-events-none">
              <div className="p-6 flex flex-col h-full">
                <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined !text-2xl">{formData.icone || 'description'}</span>
                </div>
                <h2 className="text-xl font-bold leading-tight mb-2 text-slate-900">{formData.titulo || 'Título do Serviço'}</h2>
                <p className="text-slate-600 text-sm font-normal leading-relaxed flex-grow mb-6">
                  {formData.resumo || 'Descrição curta do serviço para pré-visualização no site...'}
                </p>
                <div className="mt-auto flex w-full items-center justify-center rounded-lg h-10 px-4 bg-slate-50 text-primary border border-slate-200 text-sm font-bold transition-colors">
                  {formData.texto_link || 'Acessar Serviço'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
