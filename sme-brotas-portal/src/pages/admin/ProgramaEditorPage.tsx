import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ProgramaForm } from '../../components/admin/ProgramaForm'
import type { Programa } from '../../types'
import { toast } from 'sonner'

export default function ProgramaEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = Boolean(id && id !== 'novo')

  const [initialData, setInitialData] = useState<Partial<Programa> | undefined>()
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditing && id) {
      supabase
        .from('programas')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            toast.error('Erro ao carregar programa.')
            navigate('/admin/programas')
            return
          }
          if (data) {
            setInitialData(data)
          }
          setLoading(false)
        })
    }
  }, [id, isEditing, navigate])

  async function handleSave(formData: Partial<Programa>) {
    setSaving(true)
    
    // Lógica para desativado_em
    let desativadoEm = initialData?.desativado_em || null
    if (formData.ativo === false && initialData?.ativo !== false) {
      desativadoEm = new Date().toISOString()
    } else if (formData.ativo === true) {
      desativadoEm = null
    }

    const payload = {
      ...formData,
      desativado_em: desativadoEm,
      updated_at: new Date().toISOString(),
      created_by: isEditing ? initialData?.created_by : user?.id,
    }

    try {
      // Verificar se o slug já existe (apenas se mudou ou é novo)
      if (!isEditing || formData.slug !== initialData?.slug) {
        const { data: existing } = await supabase
          .from('programas')
          .select('id')
          .eq('slug', formData.slug as string)
          .maybeSingle()
        
        if (existing && existing.id !== id) {
          toast.error('Este link permanente (slug) já está sendo usado por outro programa.')
          setSaving(false)
          return
        }
      }

      if (isEditing && id) {
        const { error } = await supabase
          .from('programas')
          .update(payload)
          .eq('id', id)
        if (error) throw error
        toast.success('Programa atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('programas')
          .insert([payload])
        if (error) throw error
        toast.success('Programa criado com sucesso!')
      }
      navigate('/admin/programas')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao salvar programa.')
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
            to="/admin/programas"
            className="flex items-center justify-center size-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? 'Editar Programa' : 'Novo Programa'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isEditing ? 'Atualize as informações do programa pedagógico' : 'Cadastre um novo programa para o portal'}
            </p>
          </div>
        </div>
      </div>

      <ProgramaForm 
        initialData={initialData} 
        onSubmit={handleSave} 
        isSaving={saving} 
      />
    </div>
  )
}
