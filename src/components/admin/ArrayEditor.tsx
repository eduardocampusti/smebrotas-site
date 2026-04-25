import type { DraggableItem, NumericIndicatorItem } from '../../types'

type ItemType = DraggableItem | NumericIndicatorItem

interface ArrayEditorProps<T extends ItemType> {
  items: T[]
  onChange: (items: T[]) => void
  itemType?: 'default' | 'numeric'
}

export function ArrayEditor<T extends ItemType>({ items, onChange, itemType = 'default' }: ArrayEditorProps<T>) {
  const handleAdd = () => {
    const newItem = {
      id: crypto.randomUUID(),
      nome: 'Novo Item',
      icone: 'star',
      link: '',
      ordem: items.length,
      ativo: true,
      ...(itemType === 'numeric' ? { valor: 0 } : {})
    } as unknown as T
    
    onChange([...items, newItem])
  }

  const handleUpdate = (id: string, updates: Partial<T>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const handleRemove = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...items]
    const temp = newItems[index - 1]
    newItems[index - 1] = newItems[index]
    newItems[index] = temp
    
    // Update order values
    newItems.forEach((item, i) => { item.ordem = i })
    onChange(newItems)
  }

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return
    const newItems = [...items]
    const temp = newItems[index + 1]
    newItems[index + 1] = newItems[index]
    newItems[index] = temp
    
    // Update order values
    newItems.forEach((item, i) => { item.ordem = i })
    onChange(newItems)
  }

  // Ensure items are sorted by order before rendering
  const sortedItems = [...items].sort((a, b) => (a.ordem || 0) - (b.ordem || 0))

  return (
    <div className="flex flex-col gap-4">
      {sortedItems.map((item, index) => (
        <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg group">
          
          <div className="flex flex-col gap-1 justify-center sm:w-10">
            <button 
              onClick={() => handleMoveUp(index)} 
              disabled={index === 0}
              className="text-slate-400 hover:text-[var(--color-primary)] disabled:opacity-30 disabled:hover:text-slate-400"
              title="Mover para cima"
            >
              <span className="material-symbols-outlined">expand_less</span>
            </button>
            <button 
              onClick={() => handleMoveDown(index)} 
              disabled={index === sortedItems.length - 1}
              className="text-slate-400 hover:text-[var(--color-primary)] disabled:opacity-30 disabled:hover:text-slate-400"
              title="Mover para baixo"
            >
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Nome / Título</span>
              <input
                type="text"
                value={item.nome}
                onChange={(e) => handleUpdate(item.id, { nome: e.target.value } as Partial<T>)}
                className="w-full h-10 px-3 rounded text-sm border border-slate-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
              />
            </label>
            
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Ícone (Google Material)</span>
              <input
                type="text"
                value={item.icone || ''}
                placeholder="Ex: star, home, face"
                onChange={(e) => handleUpdate(item.id, { icone: e.target.value } as Partial<T>)}
                className="w-full h-10 px-3 rounded text-sm border border-slate-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
              />
            </label>

            {itemType === 'numeric' ? (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Valor Máximo/Numérico</span>
                <input
                  type="number"
                  value={(item as NumericIndicatorItem).valor || 0}
                  onChange={(e) => handleUpdate(item.id, { valor: Number(e.target.value) } as unknown as Partial<T>)}
                  className="w-full h-10 px-3 rounded text-sm border border-slate-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                />
              </label>
            ) : (
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Link URL</span>
                <input
                  type="text"
                  value={item.link || ''}
                  onChange={(e) => handleUpdate(item.id, { link: e.target.value } as Partial<T>)}
                  placeholder="Ex: /portal ou https://exemplo.com"
                  className="w-full h-10 px-3 rounded text-sm border border-slate-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                />
              </label>
            )}
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:w-24 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.ativo}
                onChange={(e) => handleUpdate(item.id, { ativo: e.target.checked } as Partial<T>)}
                className="w-4 h-4 text-[var(--color-primary)] border-slate-300 rounded focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm font-medium text-slate-700">{item.ativo ? 'Ativo' : 'Oculto'}</span>
            </label>

            <button
              onClick={() => handleRemove(item.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium p-2 rounded hover:bg-red-50 transition-colors"
            >
              Excluir
            </button>
          </div>

        </div>
      ))}

      <button
        onClick={handleAdd}
        className="flex items-center justify-center gap-2 h-10 border-2 border-dashed border-slate-300 text-slate-600 font-medium rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors w-full sm:w-auto self-start px-6"
      >
        <span className="material-symbols-outlined">add</span>
        Adicionar Item
      </button>
    </div>
  )
}
