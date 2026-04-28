import type { CategoriaTransparencia } from '../../../types'
import type { ReactNode } from 'react'

export interface AdminStructureFormValues {
  titulo_pagina: string
  descricao_pagina: string
  indicadores_titulo: string
  painel_texto_apoio: string
  indicador_padrao: string
  exibir_dados_abertos: boolean
  dados_abertos_url: string
  documentos_titulo: string
  atos_oficiais_titulo: string
  atos_oficiais_limite: number
  atos_oficiais_categoria_slug: string
}

interface AdminTransparenciaPageStructureTabProps {
  values: AdminStructureFormValues
  categorias: CategoriaTransparencia[]
  saving: boolean
  onChange: (next: AdminStructureFormValues) => void
  onSave: () => void
}

export function AdminTransparenciaPageStructureTab({
  values,
  categorias,
  saving,
  onChange,
  onSave,
}: AdminTransparenciaPageStructureTabProps) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
      <h3 className="text-xl font-black text-slate-900">Estrutura da Página Pública (dashboard)</h3>
      <p className="text-sm text-slate-600 -mt-3">
        Configure títulos, textos e botões principais da página pública.
      </p>

      <Field label="Título da página">
        <input
          className="h-11 px-4 rounded-xl border border-slate-200"
          value={values.titulo_pagina}
          onChange={(e) => onChange({ ...values, titulo_pagina: e.target.value })}
        />
      </Field>

      <Field label="Descrição institucional">
        <textarea
          className="p-4 min-h-24 rounded-xl border border-slate-200"
          value={values.descricao_pagina}
          onChange={(e) => onChange({ ...values, descricao_pagina: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Título do painel de indicadores">
          <input
            className="h-11 px-4 rounded-xl border border-slate-200"
            value={values.indicadores_titulo}
            onChange={(e) => onChange({ ...values, indicadores_titulo: e.target.value })}
          />
        </Field>
        <Field label="Indicador padrão selecionado">
          <input
            className="h-11 px-4 rounded-xl border border-slate-200"
            value={values.indicador_padrao}
            onChange={(e) => onChange({ ...values, indicador_padrao: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Texto de apoio do painel">
        <textarea
          className="p-4 min-h-20 rounded-xl border border-slate-200"
          value={values.painel_texto_apoio}
          onChange={(e) => onChange({ ...values, painel_texto_apoio: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Exibir botão Dados Abertos</span>
          <input
            type="checkbox"
            checked={values.exibir_dados_abertos}
            onChange={(e) => onChange({ ...values, exibir_dados_abertos: e.target.checked })}
          />
        </label>
        <Field label="Link do botão Dados Abertos">
          <input
            className="h-11 px-4 rounded-xl border border-slate-200"
            value={values.dados_abertos_url}
            onChange={(e) => onChange({ ...values, dados_abertos_url: e.target.value })}
          />
        </Field>
      </div>

      <details className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <summary className="cursor-pointer font-bold text-slate-800">Configurações legadas de documentos e atos</summary>
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Título da seção de documentos (legado)">
            <input
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white"
              value={values.documentos_titulo}
              onChange={(e) => onChange({ ...values, documentos_titulo: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Título da seção de atos">
              <input
                className="h-11 px-4 rounded-xl border border-slate-200 bg-white"
                value={values.atos_oficiais_titulo}
                onChange={(e) => onChange({ ...values, atos_oficiais_titulo: e.target.value })}
              />
            </Field>
            <Field label="Limite de atos">
              <input
                type="number"
                className="h-11 px-4 rounded-xl border border-slate-200 bg-white"
                value={values.atos_oficiais_limite}
                onChange={(e) => onChange({ ...values, atos_oficiais_limite: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Categoria de atos oficiais">
              <select
                className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm"
                value={values.atos_oficiais_categoria_slug}
                onChange={(e) => onChange({ ...values, atos_oficiais_categoria_slug: e.target.value })}
              >
                <option value="">Selecione...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </details>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="h-11 px-6 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Estrutura'}
        </button>
      </div>
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
