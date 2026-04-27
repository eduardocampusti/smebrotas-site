export const CATEGORIAS_NOTICIAS = [
  { id: 'geral', label: 'Geral', icon: 'newspaper' },
  { id: 'eventos', label: 'Eventos', icon: 'event' },
  { id: 'acoes', label: 'Ações Pedagógicas', icon: 'school' },
  { id: 'comunicados', label: 'Comunicados Oficiais', icon: 'campaign' },
  { id: 'infraestrutura', label: 'Infraestrutura', icon: 'architecture' },
  { id: 'capacitacao', label: 'Capacitação', icon: 'groups' },
  { id: 'premiacao', label: 'Premiação', icon: 'emoji_events' },
  { id: 'programas', label: 'Programas', icon: 'auto_awesome' },
] as const;

export type CategoriaNoticia = (typeof CATEGORIAS_NOTICIAS)[number]['id'];
export type StatusNoticia = 'rascunho' | 'publicado' | 'arquivado';

export const STATUS_NOTICIAS: { id: StatusNoticia; label: string; color: string; bg: string }[] = [
  { id: 'rascunho', label: 'Rascunho', color: 'text-slate-500', bg: 'bg-slate-100' },
  { id: 'publicado', label: 'Publicado', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'arquivado', label: 'Arquivado', color: 'text-amber-600', bg: 'bg-amber-50' },
];

export function getStatusLabel(id: StatusNoticia): string {
  return STATUS_NOTICIAS.find(s => s.id === id)?.label || id;
}

export function getStatusStyle(id: StatusNoticia) {
  const status = STATUS_NOTICIAS.find(s => s.id === id);
  return {
    color: status?.color || 'text-slate-500',
    bg: status?.bg || 'bg-slate-100'
  };
}

export function getCategoriaLabel(id: string): string {
  const categoria = CATEGORIAS_NOTICIAS.find(c => c.id === id);
  return categoria ? categoria.label : id;
}

export function getCategoriaIcon(id: string): string {
  const categoria = CATEGORIAS_NOTICIAS.find(c => c.id === id);
  return categoria ? categoria.icon : 'newspaper';
}
