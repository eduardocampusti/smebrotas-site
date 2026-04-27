import { useState } from 'react'
import type { IndicadorTransparencia } from '../../types'
import { FileUpload } from './FileUpload'

interface IndicadorFormProps {
  initialData?: Partial<IndicadorTransparencia>
  onSubmit: (data: Partial<IndicadorTransparencia>) => void
  isSaving: boolean
}

interface ItemGrafico {
  label: string
  valor: string
}

export function IndicadorForm({ initialData, onSubmit, isSaving }: IndicadorFormProps) {
  const [formData, setFormData] = useState<Partial<IndicadorTransparencia>>({
    titulo: initialData?.titulo || '',
    valor: initialData?.valor || '',
    unidade: initialData?.unidade || '',
    meta: initialData?.meta || '',
    variacao: initialData?.variacao || '',
    icone: initialData?.icone || 'analytics',
    tipo_grafico: initialData?.tipo_grafico || 'linha',
    dados_grafico: initialData?.dados_grafico || [],
    ordem: initialData?.ordem || 0,
    ativo: initialData?.ativo !== undefined ? initialData.ativo : true,
    ano_referencia: initialData?.ano_referencia || new Date().getFullYear(),
    arquivos: initialData?.arquivos || [],
  })

  // Estado para anexos (arquivos relacionados)
  const [arquivos, setArquivos] = useState<{ titulo: string, url: string }[]>(() => {
    return initialData?.arquivos || []
  })

  // Estado para os itens do gráfico de forma estruturada
  const [itens, setItens] = useState<ItemGrafico[]>(() => {
    if (initialData?.dados_grafico && Array.isArray(initialData.dados_grafico)) {
      return initialData.dados_grafico.map(d => ({
        label: d.label?.toString() || '',
        valor: d.valor?.toString() || ''
      }))
    }
    return [{ label: '', valor: '' }]
  })

  const adicionarItem = () => {
    setItens([...itens, { label: '', valor: '' }])
  }

  const removerItem = (index: number) => {
    const novosItens = itens.filter((_, i) => i !== index)
    if (novosItens.length === 0) {
      setItens([{ label: '', valor: '' }])
    } else {
      setItens(novosItens)
    }
  }

  const atualizarItem = (index: number, campo: keyof ItemGrafico, valor: string) => {
    const novosItens = [...itens]
    novosItens[index][campo] = valor
    setItens(novosItens)
  }

  const adicionarArquivo = () => {
    setArquivos([...arquivos, { titulo: '', url: '' }])
  }

  const removerArquivo = (index: number) => {
    setArquivos(arquivos.filter((_, i) => i !== index))
  }

  const atualizarArquivo = (index: number, campo: 'titulo' | 'url', valor: string) => {
    const novosArquivos = [...arquivos]
    novosArquivos[index][campo] = valor
    setArquivos(novosArquivos)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Converte os itens para o formato final (limpando vazios e convertendo valores para número se possível)
    const dadosFormatados = itens
      .filter(item => item.label.trim() !== '')
      .map(item => ({
        label: item.label.trim(),
        valor: isNaN(Number(item.valor)) ? item.valor : Number(item.valor)
      }))

    const arquivosFormatados = arquivos.filter(arq => arq.titulo.trim() !== '' && arq.url.trim() !== '')

    onSubmit({ ...formData, dados_grafico: dadosFormatados, arquivos: arquivosFormatados })
  }

  const iconesDisponiveis = [
    'analytics', 'school', 'group', 'trending_up', 'payments', 'description', 'person', 'verified'
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Dados do Indicador */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">metrics</span>
              Dados Principais
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título do Indicador</label>
              <input
                type="text"
                required
                placeholder="Ex: Nota IDEB - Anos Iniciais"
                className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Atual</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 6.5"
                  className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unidade</label>
                <input
                  type="text"
                  placeholder="Ex: %, pts, alunos"
                  className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                  value={formData.unidade || ''}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta</label>
                <input
                  type="text"
                  placeholder="Ex: 7.0"
                  className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                  value={formData.meta || ''}
                  onChange={(e) => setFormData({ ...formData, meta: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Variação (+/-)</label>
                <input
                  type="text"
                  placeholder="Ex: +5.2%"
                  className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                  value={formData.variacao || ''}
                  onChange={(e) => setFormData({ ...formData, variacao: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">bar_chart</span>
              Dados do Gráfico
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Gráfico</label>
                <select
                  required
                  className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm bg-white"
                  value={formData.tipo_grafico}
                  onChange={(e) => setFormData({ ...formData, tipo_grafico: e.target.value as IndicadorTransparencia['tipo_grafico'] })}
                >
                  <option value="linha">Linha (Histórico)</option>
                  <option value="barra">Barras (Comparativo)</option>
                  <option value="pizza">Pizza (Distribuição)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ícone Representativo</label>
                <div className="flex items-center gap-2">
                  <div className="size-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[var(--color-primary)]">
                    <span className="material-symbols-outlined">{formData.icone}</span>
                  </div>
                  <select
                    className="flex-1 h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm bg-white"
                    value={formData.icone || ''}
                    onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                  >
                    {iconesDisponiveis.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pontos de Dados</label>
                <button
                  type="button"
                  onClick={adicionarItem}
                  className="flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Adicionar Ponto
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {itens.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Rótulo (Ex: 2023)"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-[var(--color-primary)] outline-none text-sm"
                        value={item.label}
                        onChange={(e) => atualizarItem(index, 'label', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Valor (Ex: 6.5)"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-[var(--color-primary)] outline-none text-sm"
                        value={item.valor}
                        onChange={(e) => atualizarItem(index, 'valor', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removerItem(index)}
                      className="size-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                      title="Remover ponto"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              
              <p className="text-[10px] text-slate-400">
                Os rótulos geralmente são anos ou categorias. Os valores devem ser numéricos para exibição no gráfico.
              </p>
            </div>
          </div>

          {/* Seção de Anexos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-primary)]">attach_file</span>
                Documentos Relacionados
              </h2>
              <button
                type="button"
                onClick={adicionarArquivo}
                className="flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Adicionar Arquivo
              </button>
            </div>

            {arquivos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arquivos.map((arquivo, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3 relative group animate-in fade-in slide-in-from-top-2 duration-300">
                    <button
                      type="button"
                      onClick={() => removerArquivo(index)}
                      className="absolute top-2 right-2 size-8 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-100 shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover arquivo"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título do Documento</label>
                      <input
                        type="text"
                        placeholder="Ex: Relatório Detalhado 2023"
                        className="h-9 px-3 rounded-lg border border-slate-200 focus:border-[var(--color-primary)] outline-none text-sm bg-white"
                        value={arquivo.titulo}
                        onChange={(e) => atualizarArquivo(index, 'titulo', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Arquivo</label>
                      <FileUpload
                        value={arquivo.url}
                        onChange={(url) => atualizarArquivo(index, 'url', url)}
                        folder="transparencia/indicadores"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2">folder_open</span>
                <p className="text-sm">Nenhum documento anexado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Configurações */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">settings</span>
              Configurações
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ano de Referência</label>
              <input
                type="number"
                required
                className="h-11 px-4 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                value={formData.ano_referencia}
                onChange={(e) => setFormData({ ...formData, ano_referencia: parseInt(e.target.value) })}
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
                  {formData.ativo ? 'Ativo no Portal' : 'Oculto (Rascunho)'}
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
              disabled={isSaving}
              className="w-full h-12 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold transition-all shadow-lg shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Salvar Indicador
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
