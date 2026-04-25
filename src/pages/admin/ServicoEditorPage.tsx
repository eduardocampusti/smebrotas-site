import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ServicoForm } from '../../components/admin/ServicoForm'
import type { Servico } from '../../types'
import { toast } from 'sonner'

export default function ServicoEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = Boolean(id && id !== 'novo')

  const [initialData, setInitialData] = useState<Partial<Servico> | undefined>()
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditing && id) {
      supabase
        .from('servicos')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            toast.error('Erro ao carregar serviço.')
            navigate('/admin/servicos')
            return
          }
          if (data) {
            setInitialData(data)
          }
          setLoading(false)
        })
    }
  }, [id, isEditing, navigate])

  async function handleSave(formData: Partial<Servico>) {
    setSaving(true)
    
    const payload = {
      ...formData,
      updated_at: new Date().toISOString(),
      created_by: isEditing ? initialData?.created_by : user?.id,
    }

    try {
      // Verificar se o slug já existe (apenas se mudou ou é novo)
      if (!isEditing || formData.slug !== initialData?.slug) {
        const { data: existing } = await supabase
          .from('servicos')
          .select('id')
          .eq('slug', formData.slug as string)
          .maybeSingle()
        
        if (existing && existing.id !== id) {
          toast.error('Este link permanente (slug) já está sendo usado por outro serviço.')
          setSaving(false)
          return
        }
      }

      if (isEditing && id) {
        const { error } = await supabase
          .from('servicos')
          .update(payload)
          .eq('id', id)
        if (error) throw error
        toast.success('Serviço atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert([payload])
        if (error) throw error
        toast.success('Serviço criado com sucesso!')
      }
      navigate('/admin/servicos')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao salvar serviço.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/servicos"
            className="flex items-center justify-center size-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isEditing ? 'Atualize as informações do serviço' : 'Cadastre um novo serviço para os cidadãos'}
            </p>
          </div>
        </div>
      </div>

      <ServicoForm 
        initialData={initialData} 
        onSubmit={handleSave} 
        isSaving={saving} 
      />
    </div>
  )
}
