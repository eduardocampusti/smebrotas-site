import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { IndicadorForm } from '../../components/admin/IndicadorForm'
import type { IndicadorTransparencia } from '../../types'
import { toast } from 'sonner'

export default function IndicadorEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id && id !== 'novo')

  const [initialData, setInitialData] = useState<Partial<IndicadorTransparencia> | undefined>()
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditing && id) {
      supabase
        .from('transparencia_indicadores')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            toast.error('Erro ao carregar indicador.')
            navigate('/admin/transparencia')
            return
          }
          if (data) {
            setInitialData(data)
          }
          setLoading(false)
        })
    }
  }, [id, isEditing, navigate])

  async function handleSave(formData: Partial<IndicadorTransparencia>) {
    setSaving(true)
    
    const payload = {
      ...formData,
      updated_at: new Date().toISOString(),
    }

    try {
      if (isEditing && id) {
        const { error } = await supabase
          .from('transparencia_indicadores')
          .update(payload)
          .eq('id', id)
        if (error) throw error
        toast.success('Indicador atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('transparencia_indicadores')
          .insert([payload])
        if (error) throw error
        toast.success('Indicador criado com sucesso!')
      }
      navigate('/admin/transparencia')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao salvar indicador.')
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
            to="/admin/transparencia"
            className="flex items-center justify-center size-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? 'Editar Indicador' : 'Novo Indicador'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isEditing ? 'Atualize as informações do indicador educacional' : 'Cadastre um novo indicador para o portal'}
            </p>
          </div>
        </div>
      </div>

      <IndicadorForm 
        initialData={initialData} 
        onSubmit={handleSave} 
        isSaving={saving} 
      />
    </div>
  )
}
