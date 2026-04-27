import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { toast } from 'sonner'
import type { HeaderActionButton, TopBarItem } from '../../types'

// ─── Valores padrão dos botões ───────────────────────────────────────────────
const DEFAULT_BUTTONS: HeaderActionButton[] = [
  {
    id: '1',
    texto: 'Portal Educacional',
    link: '/portal',
    ativo: true,
    target_blank: false,
    cor: 'primary',
    ordem: 1,
  },
  {
    id: '2',
    texto: 'Portal do Servidor',
    link: 'https://www.keepinformatica.com.br/contracheque/web/user-management/auth/login',
    ativo: true,
    target_blank: true,
    cor: 'slate',
    ordem: 2,
  },
]

// ─── Componente de edição de um único botão ───────────────────────────────────
interface ButtonEditorProps {
  button: HeaderActionButton
  index: number
  total: number
  onChange: (updated: HeaderActionButton) => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function ButtonEditor({ button, index, total, onChange, onMoveUp, onMoveDown }: ButtonEditorProps) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-4 transition-all ${
        button.ativo
          ? 'border-slate-200 bg-white'
          : 'border-slate-200 bg-slate-50 opacity-75'
      }`}
    >
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
              button.cor === 'slate' ? 'bg-slate-700' : 'bg-[var(--color-primary)]'
            }`}
          >
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{button.texto || 'Botão sem título'}</p>
            <p className="text-xs text-slate-400">{button.ativo ? 'Visível no site' : 'Oculto no site'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ordenação */}
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Mover para cima"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_upward</span>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Mover para baixo"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_downward</span>
          </button>

          {/* Toggle ativo/inativo */}
          <button
            type="button"
            onClick={() => onChange({ ...button, ativo: !button.ativo })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              button.ativo ? 'bg-[var(--color-primary)]' : 'bg-slate-300'
            }`}
            title={button.ativo ? 'Clique para ocultar' : 'Clique para exibir'}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                button.ativo ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Campos de edição */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Título do botão</span>
          <input
            type="text"
            value={button.texto}
            onChange={(e) => onChange({ ...button, texto: e.target.value })}
            placeholder="Ex: Portal Educacional"
            className="rounded-lg border border-slate-300 h-10 px-3 text-sm text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cor</span>
          <select
            value={button.cor ?? 'primary'}
            onChange={(e) => onChange({ ...button, cor: e.target.value as 'primary' | 'slate' })}
            className="rounded-lg border border-slate-300 h-10 px-3 text-sm text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all bg-white"
          >
            <option value="primary">Azul (Primary)</option>
            <option value="slate">Escuro (Slate)</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Link / URL</span>
        <input
          type="text"
          value={button.link}
          onChange={(e) => onChange({ ...button, link: e.target.value })}
          placeholder="https://... ou /rota-interna"
          className="rounded-lg border border-slate-300 h-10 px-3 text-sm text-slate-900 font-mono focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
        />
        <p className="text-xs text-slate-400">
          Use URL completa (https://) para links externos, ou /caminho para páginas internas.
        </p>
      </label>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={button.target_blank}
          onChange={(e) => onChange({ ...button, target_blank: e.target.checked })}
          className="w-4 h-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
        />
        <div>
          <p className="text-sm font-medium text-slate-700">Abrir em nova aba</p>
          <p className="text-xs text-slate-400">Recomendado para links externos (fora do site)</p>
        </div>
      </label>

      {/* Preview visual do botão */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pré-visualização</p>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center px-5 h-10 rounded-lg text-white text-sm font-bold shadow-sm ${
              button.ativo
                ? button.cor === 'slate'
                  ? 'bg-slate-800'
                  : 'bg-[var(--color-primary)]'
                : 'bg-slate-300'
            }`}
          >
            {button.texto || 'Botão'}
          </span>
          {!button.ativo && (
            <span className="text-xs text-slate-400 italic">— oculto no site público</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente de edição de item da barra superior ─────────────────────────
interface TopBarItemEditorProps {
  item: TopBarItem
  index: number
  total: number
  onChange: (updated: TopBarItem) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

function TopBarItemEditor({ item, index, total, onChange, onMoveUp, onMoveDown, onDelete }: TopBarItemEditorProps) {
  return (
    <div
      className={`group relative rounded-xl border p-3.5 flex flex-col gap-2.5 transition-all duration-300 ease-out ${
        item.ativo
          ? 'border-blue-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-px hover:border-blue-200'
          : 'border-slate-150 bg-slate-50/60 shadow-none hover:shadow-sm hover:border-slate-200'
      }`}
    >
      {/* Indicador lateral de status */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-colors duration-300 ${
        item.ativo ? 'bg-gradient-to-b from-[#1e3a8a] to-[#2563eb]' : 'bg-slate-200'
      }`} />

      {/* Cabeçalho compacto */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 transition-all duration-300 ${
            item.ativo
              ? 'bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] shadow-sm shadow-blue-500/20'
              : 'bg-slate-300 shadow-none'
          }`}>
            {item.icone ? (
              <span className="material-symbols-outlined text-[15px]">{item.icone}</span>
            ) : (
              <span className="material-symbols-outlined text-[15px]">link</span>
            )}
          </div>
          <div className="min-w-0">
            <p className={`text-[13px] font-semibold truncate leading-tight transition-colors duration-200 ${
              item.ativo ? 'text-slate-900' : 'text-slate-400'
            }`} title={item.texto || 'Item sem título'}>{item.texto || 'Item sem título'}</p>
            <span className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-px rounded-full text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
              item.ativo
                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200/60'
                : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200/50'
            }`}>
              <span className={`w-1 h-1 rounded-full transition-colors duration-300 ${item.ativo ? 'bg-blue-500' : 'bg-slate-300'}`} />
              {item.ativo ? 'Ativo' : 'Oculto'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Mover para cima"
            className="w-7 h-7 rounded-md border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-[#1e3a8a] hover:bg-blue-50 hover:border-blue-300 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Mover para baixo"
            className="w-7 h-7 rounded-md border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-[#1e3a8a] hover:bg-blue-50 hover:border-blue-300 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
          </button>

          <div className="w-px h-4 bg-slate-200/80 mx-0.5" />

          <button
            type="button"
            onClick={() => onChange({ ...item, ativo: !item.ativo })}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 ${
              item.ativo ? 'bg-[#1e3a8a]' : 'bg-slate-300'
            }`}
            title={item.ativo ? 'Clique para ocultar' : 'Clique para exibir'}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-all duration-300 ease-out ${
                item.ativo ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>

          {/* Excluir */}
          <button
            type="button"
            onClick={onDelete}
            title="Remover item"
            className="w-7 h-7 rounded-md border border-red-100 flex items-center justify-center text-red-300 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[16px]">delete_outline</span>
          </button>
        </div>
      </div>

      {/* Campos de edição */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Texto</span>
          <input
            type="text"
            value={item.texto}
            onChange={(e) => onChange({ ...item, texto: e.target.value })}
            placeholder="Ex: Ouvidoria"
            className="rounded-md border border-slate-200 h-8 px-2.5 text-[13px] text-slate-900 placeholder:text-slate-300 bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 outline-none transition-all duration-200"
          />
        </label>

        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ícone</span>
          <input
            type="text"
            value={item.icone}
            onChange={(e) => onChange({ ...item, icone: e.target.value })}
            placeholder="Ex: hearing, info"
            className="rounded-md border border-slate-200 h-8 px-2.5 text-[13px] text-slate-900 placeholder:text-slate-300 bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 outline-none transition-all duration-200"
          />
        </label>
      </div>

      <label className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Link / URL</span>
        <input
          type="text"
          value={item.link}
          onChange={(e) => onChange({ ...item, link: e.target.value })}
          placeholder="https://... ou /rota-interna"
          className="rounded-md border border-slate-200 h-8 px-2.5 text-[13px] text-slate-900 font-mono placeholder:text-slate-300 bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 outline-none transition-all duration-200"
        />
      </label>

      {/* Rodapé compacto: checkbox + preview */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100/60">
        <label className="flex items-center gap-1.5 cursor-pointer select-none group/check">
          <input
            type="checkbox"
            checked={item.target_blank}
            onChange={(e) => onChange({ ...item, target_blank: e.target.checked })}
            className="w-3 h-3 rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a] cursor-pointer"
          />
          <span className="text-[11px] text-slate-400 group-hover/check:text-slate-600 transition-colors duration-200">Nova aba</span>
        </label>

        <div className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 min-h-[26px] transition-all duration-300 ${
          item.ativo
            ? 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-sm shadow-blue-500/15'
            : 'bg-slate-100 text-slate-300 shadow-none'
        }`} title={item.ativo ? 'Visível no site público' : 'Item oculto'}>
          {item.icone && (
            <span className="material-symbols-outlined text-xs">{item.icone}</span>
          )}
          <span className="text-[11px] font-semibold truncate max-w-[100px]" title={item.texto || 'Item'}>{item.texto || 'Item'}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal de Configurações ───────────────────────────────────────
export default function ConfigPage() {
  // ── Estado: Cabeçalho ──
  const [buttons, setButtons] = useState<HeaderActionButton[]>(DEFAULT_BUTTONS)
  const [configId, setConfigId] = useState<string | null>(null)
  const [savingHeader, setSavingHeader] = useState(false)
  const [loadingHeader, setLoadingHeader] = useState(true)

  // ── Estado: Barra Superior (Top Bar) ──
  const [topBarItems, setTopBarItems] = useState<TopBarItem[]>([])
  const [savingTopBar, setSavingTopBar] = useState(false)
  const [loadingTopBar, setLoadingTopBar] = useState(true)

  // ── Estado: Criar Admin ──
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminNome, setAdminNome] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ── Carrega botões do banco ──
  useEffect(() => {
    async function loadHeaderButtons() {
      setLoadingHeader(true)
      const { data, error } = await supabase
        .from('site_config')
        .select('id, header_action_buttons')
        .single()

      if (!error && data) {
        setConfigId(data.id)
        if (data.header_action_buttons && Array.isArray(data.header_action_buttons)) {
          const loaded = data.header_action_buttons as HeaderActionButton[]
          // Garante campo ordem para botões legados
          const normalized = loaded.map((b, i) => ({ ...b, ordem: i + 1 }))
          setButtons(normalized)
        }
      }
      setLoadingHeader(false)
    }
    loadHeaderButtons()

    // ── Carrega itens da barra superior ──
    async function loadTopBarItems() {
      setLoadingTopBar(true)
      const { data, error } = await supabase
        .from('top_bar_items')
        .select('*')
        .order('ordem', { ascending: true })

      if (!error && data) {
        const loaded = data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          texto: String(row.texto),
          icone: String(row.icone ?? 'link'),
          link: String(row.link ?? '#'),
          target_blank: Boolean(row.target_blank),
          ativo: Boolean(row.ativo),
          ordem: Number(row.ordem),
        })) as TopBarItem[]
        setTopBarItems(loaded)
      } else if (error) {
        toast.error('Erro ao carregar itens da barra superior.')
      }
      setLoadingTopBar(false)
    }
    loadTopBarItems()
  }, [])

  // ── Salva itens da barra superior ──
  async function handleSaveTopBar() {
    setSavingTopBar(true)

    // Buscar IDs atuais no banco para comparar com a lista local
    const { data: existingRows, error: fetchError } = await supabase
      .from('top_bar_items')
      .select('id')

    if (fetchError) {
      setSavingTopBar(false)
      toast.error('Erro ao verificar itens existentes.')
      return
    }

    const existingIds = new Set((existingRows ?? []).map((r: { id: string }) => String(r.id)))
    const localIds = new Set(topBarItems.map((item) => item.id))

    // IDs que estão no banco mas não na lista local → deletar
    const idsToDelete = [...existingIds].filter((id) => !localIds.has(id))

    // Atualiza ordem de todos os itens locais
    const toSave = topBarItems.map((item, index) => ({ ...item, ordem: index + 1 }))

    try {
      // 1. Deletar itens removidos
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('top_bar_items')
          .delete()
          .in('id', idsToDelete)

        if (deleteError) throw deleteError
      }

      // 2. Upsert: inserir novos e atualizar existentes
      for (const item of toSave) {
        const row = {
          texto: item.texto,
          icone: item.icone,
          link: item.link,
          target_blank: item.target_blank,
          ativo: item.ativo,
          ordem: item.ordem,
        }

        if (existingIds.has(item.id)) {
          // UPDATE item existente
          const { error: updateError } = await supabase
            .from('top_bar_items')
            .update(row)
            .eq('id', item.id)
          if (updateError) throw updateError
        } else {
          // INSERT novo item
          const { error: insertError } = await supabase
            .from('top_bar_items')
            .insert({ id: item.id, ...row })
          if (insertError) throw insertError
        }
      }

      toast.success('Configurações da barra superior salvas com sucesso!')
      // Recarregar do banco para sincronizar
      const { data: freshData } = await supabase
        .from('top_bar_items')
        .select('*')
        .order('ordem', { ascending: true })

      if (freshData) {
        setTopBarItems(freshData.map((r: Record<string, unknown>) => ({
          id: String(r.id),
          texto: String(r.texto),
          icone: String(r.icone ?? 'link'),
          link: String(r.link ?? '#'),
          target_blank: Boolean(r.target_blank),
          ativo: Boolean(r.ativo),
          ordem: Number(r.ordem),
        })) as TopBarItem[])
      }
    } catch {
      toast.error('Erro ao salvar configurações da barra superior.')
    }

    setSavingTopBar(false)
  }

  // ── Salva botões no banco ──
  async function handleSaveHeader() {
    if (!configId) {
      toast.error('Configuração não carregada. Recarregue a página.')
      return
    }
    setSavingHeader(true)
    const toSave = buttons.map((b, i) => ({ ...b, ordem: i + 1 }))

    const { error } = await supabase
      .from('site_config')
      .update({ header_action_buttons: toSave })
      .eq('id', configId)

    setSavingHeader(false)
    if (error) {
      toast.error('Erro ao salvar configurações do cabeçalho.')
    } else {
      toast.success('Configurações do cabeçalho salvas com sucesso!')
    }
  }

  // ── Handlers da barra superior ──
  function handleTopBarItemChange(index: number, updated: TopBarItem) {
    setTopBarItems((prev) => prev.map((item, i) => (i === index ? updated : item)))
  }

  function handleTopBarMoveUp(index: number) {
    if (index === 0) return
    setTopBarItems((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function handleTopBarMoveDown(index: number) {
    if (index === topBarItems.length - 1) return
    setTopBarItems((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  function handleAddTopBarItem() {
    const newItem: TopBarItem = {
      id: crypto.randomUUID(),
      texto: 'Novo Atalho',
      icone: 'link',
      link: '#',
      target_blank: false,
      ativo: true,
      ordem: topBarItems.length + 1
    }
    setTopBarItems((prev) => [...prev, newItem])
  }

async function handleDeleteTopBarItem(id: string) {
  setTopBarItems((prev) => prev.filter((item) => item.id !== id))
  toast.success('Item removido. Clique em Salvar para aplicar as alterações.')
}

  // ── Handlers dos botões do cabeçalho ──
  function handleButtonChange(index: number, updated: HeaderActionButton) {
    setButtons((prev) => prev.map((b, i) => (i === index ? updated : b)))
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    setButtons((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function handleMoveDown(index: number) {
    if (index === buttons.length - 1) return
    setButtons((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  // ── Criar Admin ──
  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!adminEmail.trim() || !adminPassword.trim()) return
    setCreating(true)
    setMessage(null)

    const { error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: { nome: adminNome || adminEmail, role: 'admin' },
      },
    })

    setCreating(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Administrador criado com sucesso!' })
      setAdminEmail('')
      setAdminPassword('')
      setAdminNome('')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Título da página */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie configurações gerais do sistema</p>
      </div>

      {/* ── Seção: Cabeçalho do Site ───────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header da seção */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">web</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cabeçalho do Site</h2>
              <p className="text-xs text-slate-500">Configure os botões de ação exibidos no topo do site público</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveHeader}
            disabled={savingHeader || loadingHeader}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-colors disabled:opacity-60 shadow-sm"
          >
            {savingHeader ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                Salvando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                Salvar
              </>
            )}
          </button>
        </div>

        {/* Corpo da seção */}
        <div className="p-6 flex flex-col gap-4">
          {loadingHeader ? (
            <div className="flex items-center gap-3 text-slate-400 py-4">
              <span className="material-symbols-outlined animate-spin">sync</span>
              <span className="text-sm">Carregando configurações...</span>
            </div>
          ) : (
            <>
              {/* Info banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <span className="material-symbols-outlined text-blue-500 text-xl shrink-0 mt-0.5">info</span>
                <p className="text-sm text-blue-700">
                  Os botões abaixo aparecem no canto superior direito do site público.
                  Use o <strong>toggle</strong> para ocultar ou exibir cada botão, e as <strong>setas</strong> para reordenar.
                  Clique em <strong>Salvar</strong> para aplicar as alterações.
                </p>
              </div>

              {/* Editor de cada botão */}
              {buttons.map((btn, index) => (
                <ButtonEditor
                  key={btn.id}
                  button={btn}
                  index={index}
                  total={buttons.length}
                  onChange={(updated) => handleButtonChange(index, updated)}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                />
              ))}
            </>
          )}
        </div>
      </section>

      {/* ── Seção: Barra Superior (Top Bar) ────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header da seção */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1e3a8a]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#1e3a8a] text-xl">toolbar</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Barra Superior</h2>
              <p className="text-xs text-slate-500">Configure os atalhos rápidos da barra azul no topo do site</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddTopBarItem}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Adicionar
            </button>
            <button
              type="button"
              onClick={handleSaveTopBar}
              disabled={savingTopBar || loadingTopBar}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white text-sm font-bold transition-colors disabled:opacity-60 shadow-sm"
            >
              {savingTopBar ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                  Salvando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Corpo da seção */}
        <div className="p-6 flex flex-col gap-4">
          {loadingTopBar ? (
            <div className="flex items-center gap-3 text-slate-400 py-4">
              <span className="material-symbols-outlined animate-spin">sync</span>
              <span className="text-sm">Carregando configurações...</span>
            </div>
          ) : (
            <>
              {/* Info banner */}
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-blue-50/80 border border-blue-100 rounded-lg">
                <span className="material-symbols-outlined text-blue-500 text-base shrink-0 mt-px">info</span>
                <p className="text-[12px] leading-relaxed text-blue-600">
                  A barra superior aparece acima do menu. Adicione, edite, reordene ou remova atalhos. Itens <strong>ativos</strong> serão exibidos no site.
                </p>
              </div>

              {/* Editor de cada item */}
              {topBarItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
                  <span className="material-symbols-outlined text-4xl">link_off</span>
                  <p className="text-sm">Nenhum item configurado</p>
                  <button
                    type="button"
                    onClick={handleAddTopBarItem}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white text-sm font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Adicionar primeiro item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {topBarItems.map((item, index) => (
                    <TopBarItemEditor
                      key={item.id}
                      item={item}
                      index={index}
                      total={topBarItems.length}
                      onChange={(updated) => handleTopBarItemChange(index, updated)}
                      onMoveUp={() => handleTopBarMoveUp(index)}
                      onMoveDown={() => handleTopBarMoveDown(index)}
                      onDelete={() => handleDeleteTopBarItem(item.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Seção: Criar Administrador ─────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-600 text-xl">person_add</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Criar Novo Administrador</h2>
            <p className="text-xs text-slate-500">Adicione um novo usuário com acesso ao painel administrativo</p>
          </div>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {message.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nome</span>
              <input
                type="text"
                value={adminNome}
                onChange={(e) => setAdminNome(e.target.value)}
                placeholder="Nome do administrador"
                className="rounded-lg border border-slate-300 h-10 px-3 text-sm text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">E-mail *</span>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@educacao.gov.br"
                required
                className="rounded-lg border border-slate-300 h-10 px-3 text-sm text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Senha *</span>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="rounded-lg border border-slate-300 h-10 px-3 text-sm text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
              />
            </label>
            <button
              type="submit"
              disabled={creating}
              className="h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors disabled:opacity-60 shadow-sm"
            >
              {creating ? 'Criando...' : 'Criar Administrador'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
