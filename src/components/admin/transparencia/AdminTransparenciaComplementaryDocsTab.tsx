import { Link } from 'react-router-dom'
import type { ArquivoTransparencia, CategoriaTransparencia, IndicadorTransparencia } from '../../../types'

type DocsTab = 'arquivos' | 'categorias' | 'indicadores-legados'

interface AdminTransparenciaComplementaryDocsTabProps {
  arquivos: ArquivoTransparencia[]
  categorias: CategoriaTransparencia[]
  indicadores: IndicadorTransparencia[]
  docsTab: DocsTab
  onChangeDocsTab: (tab: DocsTab) => void
  onNewCategory: () => void
  onEditCategory: (category: CategoriaTransparencia) => void
  onToggleArquivo: (arquivo: ArquivoTransparencia) => void
  onDeleteArquivo: (id: string) => void
  onToggleCategoria: (categoria: CategoriaTransparencia) => void
  onToggleIndicador: (indicador: IndicadorTransparencia) => void
  onDeleteIndicador: (id: string) => void
}

export function AdminTransparenciaComplementaryDocsTab(props: AdminTransparenciaComplementaryDocsTabProps) {
  const {
    arquivos,
    categorias,
    indicadores,
    docsTab,
    onChangeDocsTab,
    onNewCategory,
    onEditCategory,
    onToggleArquivo,
    onDeleteArquivo,
    onToggleCategoria,
    onToggleIndicador,
    onDeleteIndicador,
  } = props

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">Documentos Complementares</h3>
        <p className="text-sm text-slate-600 mt-1">
          Gerencie arquivos, atos oficiais e documentos antigos preservados.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <TabButton active={docsTab === 'arquivos'} label="Arquivos" onClick={() => onChangeDocsTab('arquivos')} />
          <TabButton active={docsTab === 'categorias'} label="Categorias documentais" onClick={() => onChangeDocsTab('categorias')} />
          <TabButton active={docsTab === 'indicadores-legados'} label="Indicadores legados" onClick={() => onChangeDocsTab('indicadores-legados')} />
        </div>
        <div className="flex gap-2">
          {docsTab === 'arquivos' && (
            <Link to="/admin/transparencia/arquivo/novo" className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold inline-flex items-center">
              Novo Arquivo
            </Link>
          )}
          {docsTab === 'categorias' && (
            <button onClick={onNewCategory} className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold">
              Nova Categoria
            </button>
          )}
          {docsTab === 'indicadores-legados' && (
            <Link to="/admin/transparencia/indicador/novo" className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold inline-flex items-center">
              Novo Indicador Legado
            </Link>
          )}
        </div>
      </div>

      {docsTab === 'arquivos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {arquivos.map((arquivo) => (
            <div key={arquivo.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 ${!arquivo.ativo ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">{arquivo.categoria}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${arquivo.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{arquivo.ativo ? 'Ativo' : 'Oculto'}</span>
              </div>
              <h3 className="font-black text-slate-900">{arquivo.titulo}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{arquivo.descricao || 'Sem descrição'}</p>
              <div className="flex items-center gap-2.5 mt-auto pt-2">
                <Link to={`/admin/transparencia/arquivo/${arquivo.id}`} className="h-9 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 inline-flex items-center">
                  Editar
                </Link>
                <button onClick={() => onToggleArquivo(arquivo)} className="h-9 px-3 rounded-lg bg-slate-900 text-white text-sm font-bold">
                  {arquivo.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => onDeleteArquivo(arquivo.id)} className="h-9 px-3 rounded-lg border border-red-200 text-red-600 text-sm font-bold">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {docsTab === 'categorias' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categorias.map((cat) => (
            <div key={cat.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between ${!cat.ativo ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-600">{cat.icone}</span>
                <div>
                  <p className="font-black text-slate-900">{cat.nome}</p>
                  <p className="text-xs text-slate-500">{cat.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onEditCategory(cat)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700">
                  Editar
                </button>
                <button onClick={() => onToggleCategoria(cat)} className="h-9 px-3 rounded-lg bg-slate-900 text-white text-sm font-bold">
                  {cat.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {docsTab === 'indicadores-legados' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {indicadores.map((indicador) => (
            <div key={indicador.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 ${!indicador.ativo ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-slate-600">{indicador.icone || 'analytics'}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${indicador.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{indicador.ativo ? 'Ativo' : 'Oculto'}</span>
              </div>
              <h3 className="font-black text-slate-900">{indicador.titulo}</h3>
              <p className="text-sm text-slate-500">Valor: {indicador.valor}</p>
              <div className="flex items-center gap-2.5 mt-auto pt-2">
                <Link to={`/admin/transparencia/indicador/${indicador.id}`} className="h-9 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 inline-flex items-center">
                  Editar
                </Link>
                <button onClick={() => onToggleIndicador(indicador)} className="h-9 px-3 rounded-lg bg-slate-900 text-white text-sm font-bold">
                  {indicador.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => onDeleteIndicador(indicador.id)} className="h-9 px-3 rounded-lg border border-red-200 text-red-600 text-sm font-bold">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
    >
      {label}
    </button>
  )
}
