import type { Escola } from '../../types'

interface SchoolCardPreviewProps {
  school: Partial<Escola>
}

export default function SchoolCardPreview({ school }: SchoolCardPreviewProps) {
  // Cores baseadas na modalidade (estilo do público)
  const getBadgeColor = (modalidade: string) => {
    switch (modalidade?.toLowerCase()) {
      case 'infantil': return 'bg-primary'
      case 'fundamental i': return 'bg-emerald-600'
      case 'fundamental ii': return 'bg-amber-600'
      case 'eja': return 'bg-purple-600'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 group h-full">
      <div 
        className="w-full bg-slate-200 dark:bg-slate-800 aspect-video bg-cover bg-center relative overflow-hidden" 
        style={{ backgroundImage: school.imagem_url ? `url("${school.imagem_url}")` : 'none' }}
      >
        {!school.imagem_url && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-4xl">image</span>
          </div>
        )}
        <div className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm ${getBadgeColor(school.modalidade || '')}`}>
          {school.modalidade || 'Modalidade'}
        </div>
        {school.nota_ideb && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-amber-500">star</span> {school.nota_ideb} IDEB
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-slate-900 dark:text-white text-base font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {school.nome || 'Nome da Escola'}
        </h3>
        <div className="flex flex-col gap-1.5 mt-auto text-slate-500 dark:text-slate-400 text-xs">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">location_on</span>
            <span className="line-clamp-1">{school.endereco || 'Endereço não informado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">call</span>
            <span>{school.telefone || 'Telefone não informado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">mail</span>
            <span className="truncate">{school.email || 'Email não informado'}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary text-xs font-bold py-2 rounded-lg">
            <span>Ver Detalhes</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  )
}
