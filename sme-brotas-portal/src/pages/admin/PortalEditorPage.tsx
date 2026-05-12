import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ExternalLink, Globe, Layers, Save, Settings2, UserCircle } from 'lucide-react'
import { supabase } from '../../config/supabase'

type PortalSistema = {
  id: string
  nome: string
  descricao: string
  link: string
  ativo: boolean
  ordem: number
}

type PortalPerfil = {
  id: string
  sistema_id: string
  nome: string
  descricao: string | null
  link: string
  icone: string
  ordem: number
  ativo: boolean
}

const inputClass =
  'rounded-lg border border-slate-300 min-h-10 px-3 text-sm text-slate-900 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all bg-white'
const labelClass = 'text-xs font-semibold text-slate-600 uppercase tracking-wide'

function ToggleAtivo({ ativo, onToggle }: { ativo: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        ativo ? 'bg-[var(--color-primary)]' : 'bg-slate-300'
      }`}
      title={ativo ? 'Ativo — clique para desativar' : 'Inativo — clique para ativar'}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          ativo ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function PortalEditorPage() {
  const [loading, setLoading] = useState(true)
  const [heroTitulo, setHeroTitulo] = useState('')
  const [heroSubtitulo, setHeroSubtitulo] = useState('')
  const [suporteTelefone, setSuporteTelefone] = useState('')
  const [savingConfig, setSavingConfig] = useState(false)

  const [sistemas, setSistemas] = useState<PortalSistema[]>([])
  const [savingSistemaId, setSavingSistemaId] = useState<string | null>(null)

  const sistemasComPerfis = useMemo(
    () =>
      sistemas.filter((s) => {
        const n = s.nome.toLowerCase()
        return n.includes('brotar') || n.includes('boletim')
      }),
    [sistemas]
  )

  const [selectedSistemaId, setSelectedSistemaId] = useState<string | null>(null)
  const [perfis, setPerfis] = useState<PortalPerfil[]>([])
  const [loadingPerfis, setLoadingPerfis] = useState(false)
  const [savingPerfilId, setSavingPerfilId] = useState<string | null>(null)
  const [deletingPerfilId, setDeletingPerfilId] = useState<string | null>(null)
  const [showNovoPerfil, setShowNovoPerfil] = useState(false)
  const [novoPerfil, setNovoPerfil] = useState({
    nome: '',
    descricao: '',
    link: '',
    icone: 'User',
    ativo: true,
  })
  const [salvandoNovoPerfil, setSalvandoNovoPerfil] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [cfgRes, sisRes] = await Promise.all([
        supabase.from('portal_config').select('chave, valor'),
        supabase.from('portal_sistemas').select('id, nome, descricao, link, ativo, ordem').order('ordem', { ascending: true }),
      ])

      if (cfgRes.error) throw cfgRes.error
      if (sisRes.error) throw sisRes.error

      const map = new Map((cfgRes.data ?? []).map((r) => [r.chave, r.valor]))
      setHeroTitulo(map.get('hero_titulo') ?? '')
      setHeroSubtitulo(map.get('hero_subtitulo') ?? '')
      setSuporteTelefone(map.get('suporte_telefone') ?? '')

      setSistemas((sisRes.data ?? []) as PortalSistema[])
    } catch (e: unknown) {
      console.error(e)
      toast.error('Erro ao carregar dados do portal.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (sistemasComPerfis.length === 0) {
      setSelectedSistemaId(null)
      return
    }
    setSelectedSistemaId((prev) => {
      if (prev && sistemasComPerfis.some((s) => s.id === prev)) return prev
      return sistemasComPerfis[0].id
    })
  }, [sistemasComPerfis])

  const loadPerfis = useCallback(async (sistemaId: string) => {
    setLoadingPerfis(true)
    try {
      const { data, error } = await supabase
        .from('portal_perfis')
        .select('id, sistema_id, nome, descricao, link, icone, ordem, ativo')
        .eq('sistema_id', sistemaId)
        .order('ordem', { ascending: true })
      if (error) throw error
      setPerfis((data ?? []) as PortalPerfil[])
    } catch (e: unknown) {
      console.error(e)
      toast.error('Erro ao carregar perfis.')
      setPerfis([])
    } finally {
      setLoadingPerfis(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedSistemaId) {
      setPerfis([])
      return
    }
    loadPerfis(selectedSistemaId)
  }, [selectedSistemaId, loadPerfis])

  async function handleSaveConfig() {
    setSavingConfig(true)
    try {
      const rows = [
        { chave: 'hero_titulo', valor: heroTitulo },
        { chave: 'hero_subtitulo', valor: heroSubtitulo },
        { chave: 'suporte_telefone', valor: suporteTelefone },
      ]
      const { error } = await supabase.from('portal_config').upsert(rows, { onConflict: 'chave' })
      if (error) throw error
      toast.success('Configurações gerais salvas.')
    } catch (e: unknown) {
      console.error(e)
      toast.error('Erro ao salvar configurações.')
    } finally {
      setSavingConfig(false)
    }
  }

  async function handleSaveSistema(s: PortalSistema) {
    setSavingSistemaId(s.id)
    try {
      const { error } = await supabase
        .from('portal_sistemas')
        .update({
          nome: s.nome,
          descricao: s.descricao,
          link: s.link,
          ativo: s.ativo,
        })
        .eq('id', s.id)
      if (error) throw error
      toast.success(`Sistema "${s.nome}" atualizado.`)
    } catch (e: unknown) {
      console.error(e)
      toast.error('Erro ao salvar sistema.')
    } finally {
      setSavingSistemaId(null)
    }
  }

  function updateSistema(id: string, patch: Partial<PortalSistema>) {
    setSistemas((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  function updatePerfil(id: string, patch: Partial<PortalPerfil>) {
    setPerfis((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  async function handleSavePerfil(p: PortalPerfil) {
    setSavingPerfilId(p.id)
    try {
      const { error } = await supabase
        .from('portal_perfis')
        .update({
          nome: p.nome,
          descricao: p.descricao || null,
          link: p.link,
          icone: p.icone,
          ativo: p.ativo,
          ordem: p.ordem,
        })
        .eq('id', p.id)
      if (error) throw error
      toast.success(`Perfil "${p.nome}" salvo.`)
    } catch (e: unknown) {
      console.error(e)
      toast.error('Erro ao salvar perfil.')
    } finally {
      setSavingPerfilId(null)
    }
  }

  async function handleDeletePerfil(p: PortalPerfil) {
    if (!confirm(`Excluir o perfil "${p.nome}"?`)) return
    setDeletingPerfilId(p.id)
    try {
      const { error } = await supabase.from('portal_perfis').delete().eq('id', p.id)
      if (error) throw error
      setPerfis((prev) => prev.filter((x) => x.id !== p.id))
      toast.success('Perfil excluído.')
    } catch (e: unknown) {
      console.error(e)
      toast.error('Erro ao excluir perfil.')
    } finally {
      setDeletingPerfilId(null)
    }
  }

  async function handleAddPerfil() {
    if (!selectedSistemaId) return
    if (!novoPerfil.nome.trim() || !novoPerfil.link.trim() || !novoPerfil.icone.trim()) {
      toast.error('Preencha nome, link e ícone.')
      return
    }
    setSalvandoNovoPerfil(true)
    try {
      const nextOrdem = perfis.length > 0 ? Math.max(...perfis.map((x) => x.ordem)) + 1 : 0
      const { data, error } = await supabase
        .from('portal_perfis')
        .insert({
          sistema_id: selectedSistemaId,
          nome: novoPerfil.nome.trim(),
          descricao: novoPerfil.descricao.trim() || null,
          link: novoPerfil.link.trim(),
          icone: novoPerfil.icone.trim(),
          ativo: novoPerfil.ativo,
          ordem: nextOrdem,
        })
        .select('id, sistema_id, nome, descricao, link, icone, ordem, ativo')
        .single()
      if (error) throw error
      if (data) setPerfis((prev) => [...prev, data as PortalPerfil])
      setNovoPerfil({ nome: '', descricao: '', link: '', icone: 'User', ativo: true })
      setShowNovoPerfil(false)
      toast.success('Perfil adicionado.')
    } catch (e: unknown) {
      console.error(e)
      toast.error('Erro ao adicionar perfil.')
    } finally {
      setSalvandoNovoPerfil(false)
    }
  }

  const sistemaBoletim = useMemo(
    () => sistemas.find((s) => s.nome.toLowerCase().includes('boletim')) ?? null,
    [sistemas]
  )

  if (loading) {
    return (
      <div className="flex max-w-3xl flex-col gap-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      </div>
    )
  }

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Portal Educacional</h1>
        <p className="mt-1 text-sm text-slate-500">Edite textos, sistemas e perfis exibidos em /portal</p>
      </div>

      {/* Seção 1 */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <Settings2 className="size-5 text-[var(--color-primary)]" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configurações gerais</h2>
              <p className="text-xs text-slate-500">Título e subtítulo do hero e telefone de suporte</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            <Save className="size-4" />
            {savingConfig ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Título do hero</span>
            <input type="text" value={heroTitulo} onChange={(e) => setHeroTitulo(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Subtítulo do hero</span>
            <textarea
              value={heroSubtitulo}
              onChange={(e) => setHeroSubtitulo(e.target.value)}
              rows={3}
              className={`${inputClass} py-2 min-h-[5rem] resize-y`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Telefone de suporte</span>
            <input
              type="text"
              value={suporteTelefone}
              onChange={(e) => setSuporteTelefone(e.target.value)}
              placeholder="(75) 3643-0000"
              className={inputClass}
            />
          </label>
        </div>
      </section>

      {/* Seção 2 */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Layers className="size-5 text-blue-700" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sistemas</h2>
              <p className="text-xs text-slate-500">Cards principais do portal — salve cada sistema após editar</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-6">
          {sistemas.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum sistema cadastrado. Execute o SQL de setup no Supabase.</p>
          ) : (
            sistemas.map((s) => (
              <div
                key={s.id}
                className={`rounded-xl border p-5 transition-all ${s.ativo ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-80'}`}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-800">{s.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Ativo</span>
                    <ToggleAtivo ativo={s.ativo} onToggle={() => updateSistema(s.id, { ativo: !s.ativo })} />
                    <button
                      type="button"
                      onClick={() => handleSaveSistema(s)}
                      disabled={savingSistemaId === s.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 text-xs font-bold text-white disabled:opacity-60"
                    >
                      <Save className="size-3.5" />
                      {savingSistemaId === s.id ? '...' : 'Salvar'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className={labelClass}>Nome</span>
                    <input
                      type="text"
                      value={s.nome}
                      onChange={(e) => updateSistema(s.id, { nome: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className={labelClass}>Descrição</span>
                    <textarea
                      value={s.descricao}
                      onChange={(e) => updateSistema(s.id, { descricao: e.target.value })}
                      rows={3}
                      className={`${inputClass} py-2 min-h-[4.5rem] resize-y`}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className={labelClass}>Link</span>
                    <input
                      type="text"
                      value={s.link}
                      onChange={(e) => updateSistema(s.id, { link: e.target.value })}
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Seção 3 */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <UserCircle className="size-5 text-emerald-700" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Perfis de acesso</h2>
              <p className="text-xs text-slate-500">Perfis por sistema (Brotar ou Boletim)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowNovoPerfil((v) => !v)
              if (showNovoPerfil) setNovoPerfil({ nome: '', descricao: '', link: '', icone: 'User', ativo: true })
            }}
            disabled={!selectedSistemaId}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {showNovoPerfil ? 'Cancelar' : 'Adicionar perfil'}
          </button>
        </div>
        <div className="flex flex-col gap-4 p-6">
          {sistemasComPerfis.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum sistema &quot;Brotar&quot; ou &quot;Boletim&quot; encontrado.</p>
          ) : (
            <>
              <label className="flex max-w-md flex-col gap-1.5">
                <span className={labelClass}>Sistema</span>
                <select
                  value={selectedSistemaId ?? ''}
                  onChange={(e) => setSelectedSistemaId(e.target.value || null)}
                  className={inputClass}
                >
                  {sistemasComPerfis.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </label>

              {showNovoPerfil && selectedSistemaId && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Novo perfil</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className={labelClass}>Nome</span>
                      <input
                        type="text"
                        value={novoPerfil.nome}
                        onChange={(e) => setNovoPerfil((p) => ({ ...p, nome: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className={labelClass}>Ícone (Lucide)</span>
                      <input
                        type="text"
                        value={novoPerfil.icone}
                        onChange={(e) => setNovoPerfil((p) => ({ ...p, icone: e.target.value }))}
                        placeholder="Building2"
                        className={inputClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className={labelClass}>Descrição</span>
                      <input
                        type="text"
                        value={novoPerfil.descricao}
                        onChange={(e) => setNovoPerfil((p) => ({ ...p, descricao: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className={labelClass}>Link</span>
                      <input
                        type="text"
                        value={novoPerfil.link}
                        onChange={(e) => setNovoPerfil((p) => ({ ...p, link: e.target.value }))}
                        className={`${inputClass} font-mono text-xs`}
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Ativo</span>
                        <ToggleAtivo
                          ativo={novoPerfil.ativo}
                          onToggle={() => setNovoPerfil((p) => ({ ...p, ativo: !p.ativo }))}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddPerfil}
                        disabled={salvandoNovoPerfil}
                        className="inline-flex h-9 items-center rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white disabled:opacity-60"
                      >
                        {salvandoNovoPerfil ? 'Salvando...' : 'Confirmar perfil'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loadingPerfis ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                  Carregando perfis...
                </div>
              ) : perfis.length === 0 && !showNovoPerfil ? (
                <p className="text-sm text-slate-500">Nenhum perfil para este sistema. Use &quot;Adicionar perfil&quot;.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {perfis.map((p) => (
                    <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-500">Ordem {p.ordem}</span>
                        <div className="flex items-center gap-2">
                          <ToggleAtivo
                            ativo={p.ativo}
                            onToggle={() => updatePerfil(p.id, { ativo: !p.ativo })}
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePerfil(p)}
                            disabled={savingPerfilId === p.id}
                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 text-xs font-bold text-white disabled:opacity-60"
                          >
                            <Save className="size-3" />
                            {savingPerfilId === p.id ? '...' : 'Salvar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePerfil(p)}
                            disabled={deletingPerfilId === p.id}
                            className="inline-flex h-8 items-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            {deletingPerfilId === p.id ? '...' : 'Excluir'}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1">
                          <span className={labelClass}>Nome</span>
                          <input
                            type="text"
                            value={p.nome}
                            onChange={(e) => updatePerfil(p.id, { nome: e.target.value })}
                            className={inputClass}
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className={labelClass}>Ícone (Lucide)</span>
                          <input
                            type="text"
                            value={p.icone}
                            onChange={(e) => updatePerfil(p.id, { icone: e.target.value })}
                            className={inputClass}
                          />
                        </label>
                        <label className="flex flex-col gap-1 sm:col-span-2">
                          <span className={labelClass}>Descrição</span>
                          <input
                            type="text"
                            value={p.descricao ?? ''}
                            onChange={(e) => updatePerfil(p.id, { descricao: e.target.value })}
                            className={inputClass}
                          />
                        </label>
                        <label className="flex flex-col gap-1 sm:col-span-2">
                          <span className={labelClass}>Link</span>
                          <input
                            type="text"
                            value={p.link}
                            onChange={(e) => updatePerfil(p.id, { link: e.target.value })}
                            className={`${inputClass} font-mono text-xs`}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Seção 4 */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Globe className="size-5 text-slate-700" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Visualizar</h2>
              <p className="text-xs text-slate-500">Abra o portal público em nova aba</p>
            </div>
          </div>
          <a
            href="/portal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            <ExternalLink className="size-4" />
            Ver portal
          </a>
        </div>
        {sistemaBoletim && (
          <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
            URL principal do Boletim no cadastro:{' '}
            <span className="font-mono text-slate-700">{sistemaBoletim.link}</span>
          </p>
        )}
      </section>
    </div>
  )
}
