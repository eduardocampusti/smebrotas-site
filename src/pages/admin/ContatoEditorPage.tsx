import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../config/supabase'
import type { ContatoInfo, Setor, Faq } from '../../types'
import { ImageUpload } from '../../components/admin/ImageUpload'

function normalizeContato(data: ContatoInfo): ContatoInfo {
  return {
    ...data,
    setores: Array.isArray(data.setores) ? data.setores : [],
    formulario_assuntos: Array.isArray(data.formulario_assuntos) ? data.formulario_assuntos : [],
    links_uteis: Array.isArray(data.links_uteis) ? data.links_uteis : [],
    redes_sociais: data.redes_sociais && typeof data.redes_sociais === 'object' ? data.redes_sociais : {},
    sede_titulo: data.sede_titulo || 'Sede da Secretaria',
    endereco_label: data.endereco_label || 'Endereço Principal',
    telefone_label: data.telefone_label || 'Telefone Geral',
    whatsapp_label: data.whatsapp_label || 'WhatsApp',
    email_label: data.email_label || 'E-mail Institucional',
    mapa_botao_texto: data.mapa_botao_texto || 'Abrir no Google Maps',
    formulario_titulo: data.formulario_titulo || 'Envie sua Mensagem',
    formulario_placeholder_mensagem: data.formulario_placeholder_mensagem || 'Descreva sua solicitação com detalhes...',
    formulario_botao_texto: data.formulario_botao_texto || 'Enviar Mensagem',
    formulario_mensagem_sucesso: data.formulario_mensagem_sucesso || 'Mensagem enviada com sucesso! Em breve retornaremos o contato.',
    faq_titulo: data.faq_titulo || 'Dúvidas Frequentes',
    faq_subtitulo: data.faq_subtitulo || 'Encontre respostas rápidas para as solicitações mais comuns.',
  }
}

const OMIT_CONTATO_INFO_UPDATE = new Set(['id', 'updated_at', 'updated_by', 'created_at'])

export default function ContatoEditorPage() {
  const [contato, setContato] = useState<ContatoInfo | null>(null)
  const contatoInfoColumnKeysRef = useRef<Set<string> | null>(null)
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'geral' | 'sede' | 'setores' | 'mapa' | 'formulario'>('geral')
  const [editingSetorIndex, setEditingSetorIndex] = useState<number | null>(null)


  useEffect(() => {
    async function fetchData() {
      try {
        const [contatoRes, faqRes] = await Promise.all([
          supabase.from('contato_info').select('*').single(),
          supabase.from('faq').select('*').order('ordem', { ascending: true })
        ])

        if (contatoRes.error) throw contatoRes.error
        if (contatoRes.data) {
          contatoInfoColumnKeysRef.current = new Set(Object.keys(contatoRes.data as Record<string, unknown>))
          setContato(normalizeContato(contatoRes.data as ContatoInfo))
        }
        if (faqRes.data) setFaqs(faqRes.data as Faq[])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar informações.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])


  async function handleSave() {
    if (!contato) return
    setSaving(true)

    try {
      // 1. Salvar Informações de Contato (só colunas existentes no banco)
      const allowedKeys = contatoInfoColumnKeysRef.current
      const updates: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(contato)) {
        if (OMIT_CONTATO_INFO_UPDATE.has(key)) continue
        if (allowedKeys && !allowedKeys.has(key)) continue
        updates[key] = value
      }
      const { error: contatoError } = await supabase
        .from('contato_info')
        .update(updates)
        .eq('id', contato.id)

      if (contatoError) throw contatoError

      // 2. Salvar FAQs (Upsert)
      // Primeiro removemos os deletados se tivéssemos um rastreador, 
      // mas para simplificar vamos apenas salvar os atuais.
      // Em uma implementação real, o ideal seria deletar IDs que não estão mais na lista.
      const { error: faqError } = await supabase
        .from('faq')
        .upsert(faqs.map((f, index) => ({
          ...f,
          ordem: index // Garante que a ordem seja a da lista atual
        })))

      if (faqError) throw faqError

      toast.success('Todas as informações foram atualizadas!')
    } catch (error: unknown) {
      console.error('Erro ao salvar:', error)
      const message =
        error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Erro ao salvar alterações.'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }


  // Setores Management
  const addSetor = () => {
    if (!contato) return
    const newSetor: Setor = {
      nome: 'Novo Setor',
      telefone: '',
      email: '',
      icone: 'contact_support',
      ativo: true
    }
    setContato({ ...contato, setores: [...contato.setores, newSetor] })
  }

  const updateSetor = (index: number, updates: Partial<Setor>) => {
    if (!contato) return
    const newSetores = [...contato.setores]
    newSetores[index] = { ...newSetores[index], ...updates }
    setContato({ ...contato, setores: newSetores })
  }

  const removeSetor = (index: number) => {
    if (!contato || !confirm('Deseja remover este setor?')) return
    const newSetores = contato.setores.filter((_, i) => i !== index)
    setContato({ ...contato, setores: newSetores })
  }

  const moveSetor = (index: number, direction: 'up' | 'down') => {
    if (!contato) return
    const newSetores = [...contato.setores]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newSetores.length) return

    const temp = newSetores[index]
    newSetores[index] = newSetores[targetIndex]
    newSetores[targetIndex] = temp
    setContato({ ...contato, setores: newSetores })
  }

  // Assuntos Management
  const addAssunto = () => {
    if (!contato) return
    setContato({ ...contato, formulario_assuntos: [...contato.formulario_assuntos, 'Novo Assunto'] })
  }

  const updateAssunto = (index: number, value: string) => {
    if (!contato) return
    const newAssuntos = [...contato.formulario_assuntos]
    newAssuntos[index] = value
    setContato({ ...contato, formulario_assuntos: newAssuntos })
  }

  const removeAssunto = (index: number) => {
    if (!contato) return
    const newAssuntos = contato.formulario_assuntos.filter((_, i) => i !== index)
    setContato({ ...contato, formulario_assuntos: newAssuntos })
  }

  const addLinkUtil = () => {
    if (!contato) return
    setContato({
      ...contato,
      links_uteis: [...contato.links_uteis, { titulo: 'Novo Link', url: '', ativo: true }]
    })
  }

  const updateLinkUtil = (index: number, updates: Partial<{ titulo: string; url: string; ativo: boolean }>) => {
    if (!contato) return
    const newLinks = [...contato.links_uteis]
    newLinks[index] = { ...newLinks[index], ...updates }
    setContato({ ...contato, links_uteis: newLinks })
  }

  const removeLinkUtil = (index: number) => {
    if (!contato) return
    setContato({ ...contato, links_uteis: contato.links_uteis.filter((_, i) => i !== index) })
  }

  // FAQ Management
  const addFaq = () => {
    const newFaq: Faq = {
      id: crypto.randomUUID(),
      pergunta: 'Nova Pergunta',
      resposta: '',
      ordem: faqs.length,
      ativo: true,
      created_at: new Date().toISOString()
    }
    setFaqs([...faqs, newFaq])
  }

  const updateFaq = (id: string, updates: Partial<Faq>) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeFaq = async (id: string) => {
    if (!confirm('Deseja remover esta dúvida?')) return
    
    // Se já estiver no banco (não for um UUID temporário gerado agora)
    // Nota: simplificado para remover do estado, o upsert cuidará do resto 
    // ou precisaremos de um delete explícito se o ID for do banco.
    try {
      const { error } = await supabase.from('faq').delete().eq('id', id)
      if (error) throw error
      setFaqs(faqs.filter(f => f.id !== id))
      toast.success('Pergunta removida.')
    } catch (error) {
      console.error('Erro ao deletar:', error)
      toast.error('Erro ao remover do banco de dados.')
    }
  }


  if (loading || !contato) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: 'geral', label: 'Cabeçalho', icon: 'settings' },
    { id: 'sede', label: 'Sede Principal', icon: 'business' },
    { id: 'setores', label: 'Setores', icon: 'group_work' },
    { id: 'mapa', label: 'Mapa', icon: 'map' },
    { id: 'formulario', label: 'Formulário', icon: 'mail' },
  ] as const


  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Gerenciar Contato</h1>
          <p className="text-slate-500 text-sm mt-1">Configure todas as informações da página de atendimento</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold transition-colors disabled:opacity-60 shadow-sm"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
          ) : (
            <><span className="material-symbols-outlined text-lg">save</span> Salvar Alterações</>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar Tabs */}
        <div className="flex flex-col gap-1 w-full md:w-64 shrink-0 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-6 w-full">
          
          {/* Aba Geral (Cabeçalho) */}
          {activeTab === 'geral' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Cabeçalho da Página</h2>
              
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Título da Página</span>
                  <input
                    type="text"
                    value={contato.titulo_pagina}
                    onChange={(e) => setContato({ ...contato, titulo_pagina: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Subtítulo / Introdução</span>
                  <textarea
                    value={contato.subtitulo_pagina}
                    onChange={(e) => setContato({ ...contato, subtitulo_pagina: e.target.value })}
                    rows={3}
                    className="rounded-lg border border-slate-300 p-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none resize-none"
                  />
                </label>
              </div>
            </section>
          )}

          {/* Aba Sede (Principal) */}
          {activeTab === 'sede' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Dados da Sede Principal</h2>
              
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-500 uppercase">Título do Card da Sede</span>
                <input
                  type="text"
                  value={contato.sede_titulo}
                  onChange={(e) => setContato({ ...contato, sede_titulo: e.target.value })}
                  placeholder="Sede da Secretaria"
                  className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Telefone Geral (Principal)</span>
                  <input
                    type="text"
                    value={contato.telefone_geral}
                    onChange={(e) => setContato({ ...contato, telefone_geral: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Telefone Secundário</span>
                  <input
                    type="text"
                    value={contato.telefone_secundario || ''}
                    onChange={(e) => setContato({ ...contato, telefone_secundario: e.target.value })}
                    placeholder="(00) 0000-0000"
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">E-mail Institucional</span>
                  <input
                    type="email"
                    value={contato.email_institucional}
                    onChange={(e) => setContato({ ...contato, email_institucional: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">E-mail de Contato/Suporte</span>
                  <input
                    type="email"
                    value={contato.email_contato || ''}
                    onChange={(e) => setContato({ ...contato, email_contato: e.target.value })}
                    placeholder="contato@smebrotas.sp.gov.br"
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">WhatsApp (Opcional)</span>
                  <input
                    type="text"
                    value={contato.whatsapp || ''}
                    onChange={(e) => setContato({ ...contato, whatsapp: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Horário de Atendimento</span>
                  <input
                    type="text"
                    value={contato.horario_funcionamento}
                    onChange={(e) => setContato({ ...contato, horario_funcionamento: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Endereço Completo</span>
                  <input
                    type="text"
                    value={contato.endereco}
                    onChange={(e) => setContato({ ...contato, endereco: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">CEP</span>
                  <input
                    type="text"
                    value={contato.cep}
                    onChange={(e) => setContato({ ...contato, cep: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Nomes exibidos no site</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase">Nome do endereço</span>
                    <input
                      type="text"
                      value={contato.endereco_label}
                      onChange={(e) => setContato({ ...contato, endereco_label: e.target.value })}
                      className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase">Nome do telefone</span>
                    <input
                      type="text"
                      value={contato.telefone_label}
                      onChange={(e) => setContato({ ...contato, telefone_label: e.target.value })}
                      className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase">Nome do WhatsApp</span>
                    <input
                      type="text"
                      value={contato.whatsapp_label}
                      onChange={(e) => setContato({ ...contato, whatsapp_label: e.target.value })}
                      className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase">Nome do e-mail</span>
                    <input
                      type="text"
                      value={contato.email_label}
                      onChange={(e) => setContato({ ...contato, email_label: e.target.value })}
                      className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Redes Sociais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/usuario' },
                    { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/pagina' },
                    { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/canal' },
                    { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/empresa' },
                  ].map((rede) => (
                    <label key={rede.id} className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{rede.label}</span>
                      <input
                        type="url"
                        value={contato.redes_sociais?.[rede.id] || ''}
                        onChange={(e) => setContato({ 
                          ...contato, 
                          redes_sociais: { ...contato.redes_sociais, [rede.id]: e.target.value } 
                        })}
                        placeholder={rede.placeholder}
                        className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Links Úteis</h3>
                    <p className="text-xs text-slate-500 mt-1">Use para guardar links relacionados ao atendimento, quando houver.</p>
                  </div>
                  <button
                    onClick={addLinkUtil}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold transition-all shadow-sm hover:brightness-110"
                  >
                    <span className="material-symbols-outlined text-lg">add_link</span>
                    Adicionar Link
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {contato.links_uteis.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">Nenhum link útil cadastrado.</p>
                  ) : (
                    contato.links_uteis.map((link, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto_auto] gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          value={link.titulo}
                          onChange={(e) => updateLinkUtil(index, { titulo: e.target.value })}
                          placeholder="Título do link"
                          className="h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLinkUtil(index, { url: e.target.value })}
                          placeholder="https://..."
                          className="h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                        />
                        <button
                          onClick={() => updateLinkUtil(index, { ativo: !link.ativo })}
                          className={`h-10 px-3 rounded-lg text-xs font-bold ${link.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}
                        >
                          {link.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                        <button
                          onClick={() => removeLinkUtil(index)}
                          className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Aba Setores */}
          {activeTab === 'setores' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Departamentos e Setores</h2>
                  <p className="text-xs text-slate-500 mt-1">Gerencie os departamentos exibidos na página de contato</p>
                </div>
                <button
                  onClick={addSetor}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold transition-all shadow-sm hover:brightness-110"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Adicionar Setor
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {contato.setores.map((setor, index) => (
                  <div key={index} className={`relative bg-white border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-primary)] flex flex-col group animate-in fade-in slide-in-from-bottom-2 duration-300 ${!setor.ativo ? 'opacity-60 bg-slate-50 border-dashed border-slate-300' : 'border-slate-200'}`}>
                    
                    {/* Visual de Card Público Simulado */}
                    <div className="flex items-center gap-3 mb-3 pr-24">
                      <span className="material-symbols-outlined text-[var(--color-primary)] text-2xl">{setor.icone || 'group'}</span>
                      <h4 className="font-bold text-slate-900 text-base leading-tight">{setor.nome}</h4>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-4">
                      {setor.telefone ? (
                        <p className="text-slate-600 text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-slate-400">call</span>
                          {setor.telefone}
                        </p>
                      ) : (
                        <p className="text-slate-400 text-xs italic flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-slate-300">call_off</span>
                          Sem telefone
                        </p>
                      )}
                      {setor.email ? (
                        <p className="text-slate-500 text-sm truncate flex items-center gap-2" title={setor.email}>
                          <span className="material-symbols-outlined text-[18px] text-slate-400">mail</span>
                          {setor.email}
                        </p>
                      ) : (
                        <p className="text-slate-400 text-xs italic flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-slate-300">mail_lock</span>
                          Sem e-mail
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação Refinados */}
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setEditingSetorIndex(index)}
                        className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold transition-all hover:brightness-110 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Editar
                      </button>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => updateSetor(index, { ativo: !setor.ativo })}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${setor.ativo ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
                          title={setor.ativo ? 'Desativar Setor' : 'Ativar Setor'}
                        >
                          <span className="material-symbols-outlined text-xl">{setor.ativo ? 'visibility' : 'visibility_off'}</span>
                        </button>
                        
                        <div className="flex flex-col gap-0.5">
                          <button 
                            onClick={() => moveSetor(index, 'up')}
                            disabled={index === 0}
                            className="w-8 h-4 flex items-center justify-center text-slate-400 hover:text-[var(--color-primary)] disabled:opacity-20"
                            title="Mover para cima"
                          >
                            <span className="material-symbols-outlined text-base">expand_less</span>
                          </button>
                          <button 
                            onClick={() => moveSetor(index, 'down')}
                            disabled={index === contato.setores.length - 1}
                            className="w-8 h-4 flex items-center justify-center text-slate-400 hover:text-[var(--color-primary)] disabled:opacity-20"
                            title="Mover para baixo"
                          >
                            <span className="material-symbols-outlined text-base">expand_more</span>
                          </button>
                        </div>

                        <button 
                          onClick={() => removeSetor(index)}
                          className="w-9 h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Excluir Setor"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {contato.setores.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">group_off</span>
                    <p className="text-slate-500 text-sm">Nenhum setor cadastrado.</p>
                    <button 
                      onClick={addSetor}
                      className="mt-3 text-[var(--color-primary)] text-xs font-bold hover:underline"
                    >
                      Adicionar o primeiro setor
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Simples de Edição */}
              {editingSetorIndex !== null && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Editar Setor</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Atualize as informações do departamento</p>
                      </div>
                      <button 
                        onClick={() => setEditingSetorIndex(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <div className="p-6 flex flex-col gap-5">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-500 uppercase">Nome do Setor</span>
                        <input
                          type="text"
                          value={contato.setores[editingSetorIndex].nome}
                          onChange={(e) => updateSetor(editingSetorIndex, { nome: e.target.value })}
                          className="h-11 px-4 rounded-xl border border-slate-300 text-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all"
                          placeholder="Ex: Secretaria de Educação"
                        />
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-500 uppercase">Telefone</span>
                          <input
                            type="text"
                            value={contato.setores[editingSetorIndex].telefone}
                            onChange={(e) => updateSetor(editingSetorIndex, { telefone: e.target.value })}
                            className="h-11 px-4 rounded-xl border border-slate-300 text-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all"
                            placeholder="(00) 0000-0000"
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-slate-500 uppercase">E-mail</span>
                          <input
                            type="email"
                            value={contato.setores[editingSetorIndex].email}
                            onChange={(e) => updateSetor(editingSetorIndex, { email: e.target.value })}
                            className="h-11 px-4 rounded-xl border border-slate-300 text-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all"
                            placeholder="setor@smebrotas.sp.gov.br"
                          />
                        </label>
                      </div>

                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-500 uppercase">Ícone (Material Icon)</span>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={contato.setores[editingSetorIndex].icone}
                            onChange={(e) => updateSetor(editingSetorIndex, { icone: e.target.value })}
                            className="flex-1 h-11 px-4 rounded-xl border border-slate-300 text-sm focus:border-[var(--color-primary)] outline-none"
                            placeholder="Ex: group, business, school"
                          />
                          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[var(--color-primary)] border border-slate-200">
                            <span className="material-symbols-outlined">{contato.setores[editingSetorIndex].icone || 'group'}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 italic">Use nomes de ícones do Material Symbols (ex: business, school, psychology)</p>
                      </label>

                      <label className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={contato.setores[editingSetorIndex].ativo}
                          onChange={(e) => updateSetor(editingSetorIndex, { ativo: e.target.checked })}
                          className="w-5 h-5 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">Setor Ativo</span>
                          <span className="text-[10px] text-slate-500">Se desativado, não aparecerá na página pública.</span>
                        </div>
                      </label>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setEditingSetorIndex(null)}
                        className="h-11 px-8 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:brightness-110 shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95"
                      >
                        Concluir Edição
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Aba Mapa */}

          {activeTab === 'mapa' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Localização e Mapa</h2>
              
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Link do Google Maps</span>
                  <input
                    type="text"
                    value={contato.mapa_url}
                    onChange={(e) => setContato({ ...contato, mapa_url: e.target.value })}
                    placeholder="https://www.google.com/maps/..."
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Texto do Botão do Mapa</span>
                  <input
                    type="text"
                    value={contato.mapa_botao_texto}
                    onChange={(e) => setContato({ ...contato, mapa_botao_texto: e.target.value })}
                    placeholder="Abrir no Google Maps"
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                
                <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-900 uppercase">Imagem de Fundo do Mapa</span>
                  <span className="text-xs text-slate-500 mb-2">Esta imagem aparece atrás do botão do mapa.</span>
                  <ImageUpload 
                    value={contato.mapa_imagem_url} 
                    onChange={(url) => setContato({ ...contato, mapa_imagem_url: url })}
                    folder="contato"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Aba Formulário */}
          {activeTab === 'formulario' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Formulário de Contato</h2>
                <button
                  onClick={addAssunto}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold transition-all shadow-sm hover:brightness-110"
                >
                  <span className="material-symbols-outlined text-lg">add_task</span>
                  Adicionar Assunto
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Título do Formulário</span>
                  <input
                    type="text"
                    value={contato.formulario_titulo}
                    onChange={(e) => setContato({ ...contato, formulario_titulo: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Texto do Botão</span>
                  <input
                    type="text"
                    value={contato.formulario_botao_texto}
                    onChange={(e) => setContato({ ...contato, formulario_botao_texto: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Texto de Ajuda da Mensagem</span>
                  <input
                    type="text"
                    value={contato.formulario_placeholder_mensagem}
                    onChange={(e) => setContato({ ...contato, formulario_placeholder_mensagem: e.target.value })}
                    className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase">Mensagem Após Enviar</span>
                  <textarea
                    value={contato.formulario_mensagem_sucesso}
                    onChange={(e) => setContato({ ...contato, formulario_mensagem_sucesso: e.target.value })}
                    rows={2}
                    className="rounded-lg border border-slate-300 p-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none resize-none"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-3">Defina as opções que aparecerão no campo "Assunto" do formulário de contato.</p>
                <div className="flex flex-col gap-2">
                  {contato.formulario_assuntos.map((assunto, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={assunto}
                        onChange={(e) => updateAssunto(index, e.target.value)}
                        className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-[var(--color-primary)] outline-none"
                      />
                      <button
                        onClick={() => removeAssunto(index)}
                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Perguntas Frequentes (FAQ)</h2>
                  <button
                    onClick={addFaq}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold transition-all shadow-sm hover:brightness-110"
                  >
                    <span className="material-symbols-outlined text-lg">help</span>
                    Nova Pergunta
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase">Título da seção</span>
                    <input
                      type="text"
                      value={contato.faq_titulo}
                      onChange={(e) => setContato({ ...contato, faq_titulo: e.target.value })}
                      className="rounded-lg border border-slate-300 h-10 px-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase">Texto de apoio</span>
                    <textarea
                      value={contato.faq_subtitulo}
                      onChange={(e) => setContato({ ...contato, faq_subtitulo: e.target.value })}
                      rows={2}
                      className="rounded-lg border border-slate-300 p-3 text-slate-900 text-sm focus:border-[var(--color-primary)] outline-none resize-none"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400"># {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateFaq(faq.id, { ativo: !faq.ativo })}
                            className={`text-xs font-bold px-2 py-1 rounded ${faq.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}
                          >
                            {faq.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                          <button
                            onClick={() => removeFaq(faq.id)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pergunta</span>
                        <input
                          type="text"
                          value={faq.pergunta}
                          onChange={(e) => updateFaq(faq.id, { pergunta: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-[var(--color-primary)] outline-none bg-white"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Resposta</span>
                        <textarea
                          value={faq.resposta}
                          onChange={(e) => updateFaq(faq.id, { resposta: e.target.value })}
                          rows={3}
                          className="p-3 rounded-lg border border-slate-300 text-sm focus:border-[var(--color-primary)] outline-none bg-white resize-none"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
