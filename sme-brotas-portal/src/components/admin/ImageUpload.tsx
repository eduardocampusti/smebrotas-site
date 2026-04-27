import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../config/supabase'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  bucket?: string
  folder?: string
  maxSizeMB?: number
  recommendedSize?: string
  hidePreview?: boolean
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'public-assets',
  folder = 'images',
  maxSizeMB = 3,
  hidePreview = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0])
    }
  }

  const deleteFileFromStorage = async (url: string) => {
    try {
      // Se a URL não contiver o domínio do Supabase ou o bucket, ignoramos (ex: links externos do Google)
      const searchStr = `/storage/v1/object/public/${bucket}/`
      const index = url.indexOf(searchStr)
      
      if (index === -1) {
        console.log('Ignorando deleção: URL externa ou de outro bucket.')
        return
      }

      const filePath = url.substring(index + searchStr.length)
      
      // Sanitização básica: remove barras iniciais ou duplicadas que podem ter sido salvas por erro
      const cleanPath = filePath.replace(/\/+/g, '/').replace(/^\//, '')
      
      const { error } = await supabase.storage.from(bucket).remove([cleanPath])
      
      if (error) {
        console.error('Erro ao deletar arquivo físico:', error)
      }
    } catch (error) {
      console.error('Erro ao processar deleção de arquivo:', error)
    }
  }

  const processFile = async (file: File) => {
    // Validação de tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG ou WEBP.')
      return
    }

    // Validação de tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`A imagem excede o tamanho máximo de ${maxSizeMB}MB.`)
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Fazendo upload da imagem...')

    try {
      // Se já houver uma imagem e não for galeria, tenta deletar a antiga
      if (value && !hidePreview) {
        await deleteFileFromStorage(value)
      }

      // Cria um nome de arquivo único para evitar colisões
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`
      
      // Construção robusta do path: evita barras duplas
      const rawPath = `${folder}/${fileName}`
      const cleanPath = rawPath.replace(/\/+/g, '/').replace(/^\//, '')

      console.log('Tentando upload para:', cleanPath)

      // Faz o upload usando a API do Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(cleanPath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // Obtém a URL pública
      const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath)

      onChange(data.publicUrl)
      toast.success('Imagem enviada com sucesso!', { id: toastId })
    } catch (error: any) {
      console.error('Erro no upload:', error)
      const errorMsg = error.message || 'Verifique as permissões do bucket.'
      toast.error('Erro ao fazer upload: ' + errorMsg, { id: toastId })
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleRemove = async () => {
    if (value) {
      const toastId = toast.loading('Removendo imagem...')
      await deleteFileFromStorage(value)
      onChange('')
      toast.success('Imagem removida com sucesso.', { id: toastId })
    }
  }

  // Renderização quando hidePreview é true (estilo minimalista para galeria)
  if (hidePreview) {
    return (
      <div className="w-full h-full">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg, image/png, image/webp"
          onChange={handleChange}
          disabled={isUploading}
          className="hidden"
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="w-full h-full flex flex-col items-center justify-center gap-1"
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-2xl text-slate-400">add_a_photo</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Adicionar</span>
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[240px] border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300 ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-[1.01] shadow-xl shadow-primary/10' 
            : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
        } ${isUploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && !value && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg, image/png, image/webp"
          onChange={handleChange}
          disabled={isUploading}
          className="hidden"
        />

        {value ? (
          <div className="relative w-full h-full group animate-fade-in">
            <img
              src={value}
              alt="Preview"
              className="w-full h-[240px] object-cover"
            />
            {!isUploading && (
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    inputRef.current?.click()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined text-lg">sync</span>
                  Trocar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Remover
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 text-center animate-fade-in">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              dragActive ? 'bg-primary text-white rotate-12' : 'bg-white text-primary shadow-sm'
            }`}>
              <span className="material-symbols-outlined text-3xl">
                {isUploading ? 'sync' : 'add_photo_alternate'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {isUploading ? 'Enviando imagem...' : 'Clique ou arraste a imagem aqui'}
              </p>
              <p className="text-xs text-slate-500 max-w-[200px]">
                JPG, PNG ou WEBP. Máximo {maxSizeMB}MB.
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-black text-primary uppercase tracking-widest">Enviando...</span>
          </div>
        )}
      </div>
    </div>
  )
}
