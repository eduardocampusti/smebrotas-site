import { useState, useEffect } from 'react'
import { MODALIDADES_ENSINO } from '../../types'
import type { Escola } from '../../types'
import { ImageUpload } from './ImageUpload'
import MapSelectorModal from './MapSelectorModal'
import { decimalToDMS, dmsToDecimal, isValidDMS } from '../../utils/geo'

const ESTADOS_BR = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' }
]

const maskCEP = (value: string) => {
  return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9)
}

const maskPhone = (value: string) => {
  const clean = value.replace(/\D/g, '')
  if (clean.length <= 10) {
    return clean.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  return clean.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').substring(0, 15)
}

interface SchoolFormProps {
  school?: Partial<Escola>
  onSubmit: (data: Partial<Escola>) => void
  onCancel: () => void
  onChange?: (data: Partial<Escola>) => void
  isLoading: boolean
}


type TabType = 'basico' | 'institucional' | 'gestao' | 'midia'

export default function SchoolForm({ school, onSubmit, onCancel, onChange, isLoading }: SchoolFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basico')
  const [cepStatus, setCepStatus] = useState<'idle' | 'searching' | 'success' | 'error' | 'not_found'>('idle')
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  
  // Estados locais para campos DMS (Google Earth Pro)
  const [latDMS, setLatDMS] = useState('')
  const [lngDMS, setLngDMS] = useState('')
  const [formData, setFormData] = useState<Partial<Escola>>({
    nome: '',
    modalidade: '', // Legado
    tipos_ensino: [], // Novo campo array
    endereco: '', // Legado
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Brotas',
    estado: 'SP',
    telefone: '',
    email: '',
    descricao_curta: '',
    descricao_completa: '',
    status: true,
    ordem: 0,
    destaque: false,
    nota_ideb: undefined,
    imagem_url: null,
    gestor_responsavel: '',
    horarios: { 
      manha: { inicio: '', fim: '' }, 
      tarde: { inicio: '', fim: '' }, 
      noite: { inicio: '', fim: '' } 
    },
    coordenadas: { lat: null, lng: null },
    galeria: [],
    links_uteis: [],
    infos_institucionais: '',
    observacoes: '',
    contato_complementar: '',
    tipo: 'real',
    instagram_url: '',
    facebook_url: '',
    ...school
  })

  useEffect(() => {
    if (school) {
      setFormData(prev => ({ ...prev, ...school }))
      
      // Inicializar DMS a partir do decimal (compatibilidade com dados antigos)
      if (school.coordenadas) {
        setLatDMS(decimalToDMS(school.coordenadas.lat, 'lat'))
        setLngDMS(decimalToDMS(school.coordenadas.lng, 'lng'))
      }
    }
  }, [school])

  // Notificar pai sobre mudanças para o preview
  useEffect(() => {
    onChange?.(formData)
  }, [formData, onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const isCheckbox = type === 'checkbox'
    const val = isCheckbox ? (e.target as HTMLInputElement).checked : value
    
    let processedValue = val

    if (name === 'cep') {
      processedValue = maskCEP(val as string)
      const cleanCEP = (processedValue as string).replace(/\D/g, '')
      if (cleanCEP.length === 8) {
        handleFetchCEP(processedValue as string)
      } else if (cleanCEP.length > 0 && cleanCEP.length < 8) {
        setCepStatus('idle')
      }
    }

    if (name === 'telefone') {
      processedValue = maskPhone(val as string)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  const handleFetchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length !== 8) return

    try {
      setCepStatus('searching')
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        setCepStatus('not_found')
        return
      }

      setFormData(prev => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado
      }))
      setCepStatus('success')
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      setCepStatus('error')
    }
  }

  const toggleTipoEnsino = (tipo: string) => {
    setFormData(prev => {
      const tipos = prev.tipos_ensino || []
      const newTipos = tipos.includes(tipo)
        ? tipos.filter(t => t !== tipo)
        : [...tipos, tipo]
      return { ...prev, tipos_ensino: newTipos }
    })
  }

  const handleHorarioChange = (periodo: 'manha' | 'tarde' | 'noite', field: 'inicio' | 'fim', value: string) => {
    setFormData(prev => {
      const current = prev.horarios?.[periodo] || { inicio: '', fim: '' }
      // Se for string (legado), tentamos converter ou resetamos
      const updatedPeriodo = typeof current === 'string' 
        ? { inicio: value, fim: '' } 
        : { ...current, [field]: value }
        
      return {
        ...prev,
        horarios: { ...prev.horarios, [periodo]: updatedPeriodo }
      }
    })
  }

  const handleCoordenadaChange = (coord: 'lat' | 'lng', value: string) => {
    // Atualiza o estado visual (DMS)
    if (coord === 'lat') setLatDMS(value)
    else setLngDMS(value)

    // Tenta converter para decimal
    const decimalVal = dmsToDecimal(value)
    
    setFormData(prev => ({
      ...prev,
      coordenadas: { 
        lat: coord === 'lat' ? decimalVal : (prev.coordenadas?.lat ?? null),
        lng: coord === 'lng' ? decimalVal : (prev.coordenadas?.lng ?? null)
      }
    }))
  }

  const handleMapConfirm = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      coordenadas: { lat, lng }
    }))
    
    // Sincroniza campos DMS quando selecionado no mapa
    setLatDMS(decimalToDMS(lat, 'lat'))
    setLngDMS(decimalToDMS(lng, 'lng'))
    
    setIsMapModalOpen(false)
  }

  const handleAddGalleryImage = (url: string) => {
    if (!url) return
    setFormData(prev => ({
      ...prev,
      galeria: [...(prev.galeria || []), url]
    }))
  }

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galeria: prev.galeria?.filter((_, i) => i !== index)
    }))
  }

  const handleAddLink = () => {
    setFormData(prev => ({
      ...prev,
      links_uteis: [...(prev.links_uteis || []), { titulo: '', url: '' }]
    }))
  }

  const handleLinkChange = (index: number, field: 'titulo' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      links_uteis: prev.links_uteis?.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  const handleRemoveLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links_uteis: prev.links_uteis?.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Preparar dados para salvar: sincronizar campos legados
    const finalData = {
      ...formData,
      // O campo legado 'modalidade' recebe a primeira opção do array
      modalidade: formData.tipos_ensino && formData.tipos_ensino.length > 0 
        ? formData.tipos_ensino[0] 
        : '',
      // O campo legado 'endereco' recebe a versão formatada
      endereco: `${formData.logradouro || ''}, ${formData.numero || 'S/N'}${formData.complemento ? ` - ${formData.complemento}` : ''} - ${formData.bairro || ''}, ${formData.cidade || 'Brotas'} - ${formData.estado || 'SP'}`
    }

    onSubmit(finalData)
  }

  const tabs = [
    { id: 'basico', label: 'Básico', icon: 'info' },
    { id: 'institucional', label: 'Institucional', icon: 'account_balance' },
    { id: 'gestao', label: 'Gestão', icon: 'manage_accounts' },
    { id: 'midia', label: 'Mídia & Links', icon: 'photo_library' }
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Navegação de Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-bold text-sm ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {/* ABA: BÁSICO */}
        {activeTab === 'basico' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Instituição</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                placeholder="Ex: EMEF Prof. José de Alencar"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Tipos de Ensino Atendidos</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MODALIDADES_ENSINO.map(m => (
                  <label 
                    key={m} 
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.tipos_ensino?.includes(m)
                        ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/10'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.tipos_ensino?.includes(m)}
                      onChange={() => toggleTipoEnsino(m)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-bold">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Tipo de Registro</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="real">Real (Oficial)</option>
                <option value="demo">Demo (Demonstração)</option>
                <option value="exemplo">Exemplo (Layout)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Nota IDEB (opcional)</label>
              <input
                type="number"
                step="0.1"
                name="nota_ideb"
                value={formData.nota_ideb || ''}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Ex: 6.5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Capa da Escola</label>
              <ImageUpload
                value={formData.imagem_url || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, imagem_url: url }))}
                folder="schools/covers"
              />
            </div>

            <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Escola Ativa</span>
                <span className="text-xs text-slate-500">Visível no site público</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Em Destaque</span>
                <span className="text-xs text-slate-500">Exibir em primeiro na lista</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  name="destaque"
                  checked={formData.destaque}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>
        )}

        {/* ABA: INSTITUCIONAL */}
        {activeTab === 'institucional' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Descrição Curta (Card)</label>
              <textarea
                name="descricao_curta"
                value={formData.descricao_curta}
                onChange={handleChange}
                rows={2}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                placeholder="Breve resumo que aparecerá no card da listagem..."
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Informações Institucionais</label>
              <textarea
                name="infos_institucionais"
                value={formData.infos_institucionais}
                onChange={handleChange}
                rows={4}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Dados como histórico, missão, valores ou infraestrutura..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Descrição Completa / Projetos</label>
              <textarea
                name="descricao_completa"
                value={formData.descricao_completa}
                onChange={handleChange}
                rows={6}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Texto detalhado sobre a escola, história, projetos pedagógicos, etc..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Observações (Interno/Admin)</label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={2}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Notas administrativas sobre esta escola..."
              />
            </div>
          </div>
        )}

        {/* ABA: GESTÃO */}
        {activeTab === 'gestao' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Gestor Responsável (Diretor/Coordenador)</label>
              <input
                type="text"
                name="gestor_responsavel"
                value={formData.gestor_responsavel}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Nome completo do responsável"
              />
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">schedule</span>
                Horários de Funcionamento
              </h4>
              <div className="flex flex-col gap-5">
                {[
                  { id: 'manha' as const, label: 'Período Manhã', icon: 'light_mode', color: 'text-amber-500' },
                  { id: 'tarde' as const, label: 'Período Tarde', icon: 'wb_sunny', color: 'text-orange-500' },
                  { id: 'noite' as const, label: 'Período Noite (Opcional)', icon: 'dark_mode', color: 'text-indigo-500' }
                ].map((periodo) => {
                  const val = formData.horarios?.[periodo.id]
                  const inicio = typeof val === 'object' ? val.inicio : ''
                  const fim = typeof val === 'object' ? val.fim : ''

                  return (
                    <div key={periodo.id} className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`material-symbols-outlined text-lg ${periodo.color}`}>{periodo.icon}</span>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{periodo.label}</label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Início</span>
                          <input
                            type="time"
                            value={inicio || ''}
                            onChange={(e) => handleHorarioChange(periodo.id, 'inicio', e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Término</span>
                          <input
                            type="time"
                            value={fim || ''}
                            onChange={(e) => handleHorarioChange(periodo.id, 'fim', e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">pin_drop</span>
                Localização e Contato
              </h4>
              
              <div className="flex flex-col gap-5">
                {/* Linha 1: CEP, Rua, Nº e Complemento - Ajustado Proporção 20/50/10/20 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">CEP</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder="00000-000"
                        className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold ${
                          cepStatus === 'success' ? 'border-emerald-500 ring-2 ring-emerald-500/10' :
                          cepStatus === 'error' || cepStatus === 'not_found' ? 'border-red-300 dark:border-red-900' : 
                          'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      {cepStatus === 'searching' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {cepStatus === 'success' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                        </div>
                      )}
                    </div>
                    {cepStatus === 'not_found' && <span className="text-[10px] text-red-500 font-bold mt-0.5">CEP não encontrado</span>}
                    {cepStatus === 'error' && <span className="text-[10px] text-red-500 font-bold mt-0.5">Erro ao buscar CEP</span>}
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Logradouro / Rua</label>
                    <input
                      type="text"
                      name="logradouro"
                      value={formData.logradouro}
                      onChange={handleChange}
                      placeholder="Ex: Avenida Paulista ou Rua das Flores"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nº</label>
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      placeholder="S/N"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-center"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Complemento</label>
                    <input
                      type="text"
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                      placeholder="Ex: Bloco A, Sala 1..."
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                {/* Linha 2: Bairro, Cidade e Estado - Ajustado Proporção 30/50/20 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="flex flex-col gap-1.5 md:col-span-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bairro</label>
                    <input
                      type="text"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      placeholder="Nome do bairro"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cidade</label>
                    <input
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      placeholder="Ex: Brotas"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estado (UF)</label>
                    <div className="relative">
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer font-bold text-center pr-8"
                      >
                        <option value="">UF</option>
                        {ESTADOS_BR.map(uf => (
                          <option key={uf.uf} value={uf.uf}>{uf.uf}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Linha 4: Telefone e E-mail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Telefone</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">call</span>
                      <input
                        type="text"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">E-mail Institucional</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="escola@smebrotas.sp.gov.br"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Linha 5: Contato Complementar */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contato Complementar</label>
                  <input
                    type="text"
                    name="contato_complementar"
                    value={formData.contato_complementar}
                    onChange={handleChange}
                    placeholder="Ex: Instagram @escola, WhatsApp (14) 9999-9999, etc."
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                  />
                </div>

                {/* Linha 6: Coordenadas Geográficas */}
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">explore</span> Coordenadas Geográficas
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-sm">map</span>
                      Selecionar no mapa
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 pl-1">
                        Latitude {latDMS && !isValidDMS(latDMS) && <span className="text-red-500 normal-case font-bold">(Formato inválido)</span>}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={latDMS}
                          onChange={(e) => handleCoordenadaChange('lat', e.target.value)}
                          placeholder="Ex: 12°12'34.40&quot;S"
                          className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold ${
                            latDMS && !isValidDMS(latDMS) ? 'border-red-300 dark:border-red-900' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        {latDMS && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValidDMS(latDMS) ? (
                              <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                            ) : (
                              <span className="material-symbols-outlined text-red-500">error</span>
                            )}
                          </div>
                        )}
                      </div>
                      {latDMS && isValidDMS(latDMS) && (
                        <span className="text-[10px] text-emerald-600 font-bold ml-1">
                          Valor decimal: {formData.coordenadas?.lat?.toFixed(8)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 pl-1">
                        Longitude {lngDMS && !isValidDMS(lngDMS) && <span className="text-red-500 normal-case font-bold">(Formato inválido)</span>}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={lngDMS}
                          onChange={(e) => handleCoordenadaChange('lng', e.target.value)}
                          placeholder="Ex: 42°16'44.57&quot;O"
                          className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold ${
                            lngDMS && !isValidDMS(lngDMS) ? 'border-red-300 dark:border-red-900' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        {lngDMS && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValidDMS(lngDMS) ? (
                              <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                            ) : (
                              <span className="material-symbols-outlined text-red-500">error</span>
                            )}
                          </div>
                        )}
                      </div>
                      {lngDMS && isValidDMS(lngDMS) && (
                        <span className="text-[10px] text-emerald-600 font-bold ml-1">
                          Valor decimal: {formData.coordenadas?.lng?.toFixed(8)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: MÍDIA & LINKS */}
        {activeTab === 'midia' && (
          <div className="flex flex-col gap-10 animate-fade-in">
            {/* Seção: Galeria de Fotos */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">collections</span>
                  Galeria de Fotos
                </h4>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  {formData.galeria?.length || 0} Fotos
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {formData.galeria?.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={img} alt="Galeria" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
                
                <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary transition-all overflow-hidden">
                  <ImageUpload
                    value=""
                    onChange={handleAddGalleryImage}
                    folder="schools/gallery"
                    hidePreview={true}
                    maxSizeMB={2}
                  />
                </div>
              </div>
            </div>

            {/* Seção: Redes Sociais */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-pink-500">share</span>
                  Redes Sociais
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">camera_alt</span> Instagram da Escola
                  </label>
                  <input
                    type="url"
                    name="instagram_url"
                    value={formData.instagram_url || ''}
                    onChange={handleChange}
                    placeholder="https://instagram.com/nome.da.escola"
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 dark:text-white p-0"
                  />
                </div>

                <div className="flex flex-col gap-1 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">facebook</span> Facebook da Escola
                  </label>
                  <input
                    type="url"
                    name="facebook_url"
                    value={formData.facebook_url || ''}
                    onChange={handleChange}
                    placeholder="https://facebook.com/nome.da.escola"
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 dark:text-white p-0"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Links Úteis */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">link</span>
                  Links Úteis
                </h4>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded font-black uppercase tracking-wider transition-colors"
                >
                  + Adicionar Link
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {formData.links_uteis?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Nenhum link adicionado ainda.</p>
                ) : (
                  formData.links_uteis?.map((link, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Título do Link</label>
                        <input
                          type="text"
                          value={link.titulo}
                          onChange={(e) => handleLinkChange(idx, 'titulo', e.target.value)}
                          placeholder="Ex: Portal do Aluno"
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 dark:text-white p-0"
                        />
                      </div>
                      <div className="flex-[2] flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">URL de Destino</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-500 p-0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        className="self-end md:self-center p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-2 rounded-lg font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Escola'}
        </button>
      </div>

      {isMapModalOpen && (
        <MapSelectorModal
          initialCoords={formData.coordenadas}
          address={formData.endereco}
          onConfirm={handleMapConfirm}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}
    </form>
  )
}
