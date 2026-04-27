import type { Noticia } from '../../types'

interface NewsCardPreviewProps {
  noticia: Partial<Noticia>
  mode?: 'grid' | 'highlight'
}

export function NewsCardPreview({ noticia, mode = 'grid' }: NewsCardPreviewProps) {
  const date = noticia.data_publicacao 
    ? new Date(noticia.data_publicacao).toLocaleDateString('pt-BR') 
    : new Date().toLocaleDateString('pt-BR')

  const placeholderImg = 'https://images.unsplash.com/photo-1585829365234-78d9b8129f21?q=80&w=1000&auto=format&fit=crop'
  const image = noticia.imagem_url || placeholderImg

  if (mode === 'highlight') {
    return (
      <div className="relative group rounded-2xl overflow-hidden bg-white shadow-md border border-slate-200 block w-full max-w-4xl mx-auto">
        <div 
          className="aspect-[21/9] w-full bg-cover bg-center relative" 
          style={{ backgroundImage: `url("${image}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                Destaque
              </span>
              <span className="text-slate-200 text-sm font-medium">{date}</span>
            </div>
            <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight max-w-3xl line-clamp-2">
              {noticia.titulo || 'Título da Notícia'}
            </h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-shadow max-w-sm mx-auto">
      <div 
        className="w-full aspect-video bg-cover bg-center overflow-hidden" 
        style={{ backgroundImage: `url("${image}")` }}
      >
        <div className="w-full h-full bg-slate-900/5 transition-colors"></div>
      </div>
      <div className="flex flex-col gap-2 p-5 pt-1">
        <div className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-semibold">
          <span className="material-symbols-outlined text-base">
            {getCategoryIcon(noticia.categoria || 'geral')}
          </span>
          <span className="capitalize">{noticia.categoria || 'Geral'}</span>
          <span className="text-slate-400 font-normal ml-auto text-xs">{date}</span>
        </div>
        <h3 className="text-lg font-bold leading-tight line-clamp-2 min-h-[3rem]">
          {noticia.titulo || 'Título da Notícia'}
        </h3>
        <p className="text-slate-600 text-sm line-clamp-2">
          {noticia.resumo || 'O resumo da notícia aparecerá aqui quando você começar a escrever...'}
        </p>
      </div>
    </div>
  )
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'eventos': return 'event'
    case 'acoes': return 'inventory_2'
    case 'comunicados': return 'campaign'
    case 'infraestrutura': return 'architecture'
    case 'capacitacao': return 'school'
    case 'premiacao': return 'emoji_events'
    case 'programas': return 'auto_awesome'
    default: return 'newspaper'
  }
}
