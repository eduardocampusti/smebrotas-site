import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../config/supabase'

interface FileUploadProps {
  value: string
  onChange: (url: string) => void
  bucket?: string
  folder?: string
  maxSizeMB?: number
  accept?: string
}

export function FileUpload({
  value,
  onChange,
  bucket = 'public-assets',
  folder = 'transparencia',
  maxSizeMB = 10,
  accept = '.pdf,.doc,.docx,.xls,.xlsx'
}: FileUploadProps) {
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
      const searchStr = `/storage/v1/object/public/${bucket}/`
      const index = url.indexOf(searchStr)
      
      if (index === -1) return

      const filePath = url.substring(index + searchStr.length)
      const cleanPath = filePath.replace(/\/+/g, '/').replace(/^\//, '')
      
      await supabase.storage.from(bucket).remove([cleanPath])
    } catch (error) {
      console.error('Erro ao processar deleção de arquivo:', error)
    }
  }

  const processFile = async (file: File) => {
    // Validação de tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`O arquivo excede o tamanho máximo de ${maxSizeMB}MB.`)
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Fazendo upload do arquivo...')

    try {
      if (value) {
        await deleteFileFromStorage(value)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`
      const cleanPath = `${folder}/${fileName}`.replace(/\/+/g, '/').replace(/^\//, '')

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(cleanPath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath)

      onChange(data.publicUrl)
      toast.success('Arquivo enviado com sucesso!', { id: toastId })
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload: ' + (error.message || 'Verifique as permissões.'), { id: toastId })
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    if (value) {
      const toastId = toast.loading('Removendo arquivo...')
      await deleteFileFromStorage(value)
      onChange('')
      toast.success('Arquivo removido com sucesso.', { id: toastId })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed rounded-2xl transition-all duration-300 ${
          dragActive 
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
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
          accept={accept}
          onChange={handleChange}
          disabled={isUploading}
          className="hidden"
        />

        {value ? (
          <div className="flex items-center gap-4 p-4 w-full">
            <div className="size-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Arquivo Carregado</p>
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-primary)] hover:underline truncate block"
              >
                Clique para visualizar
              </a>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="size-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-[var(--color-primary)] transition-all"
              >
                <span className="material-symbols-outlined text-lg">sync</span>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                className="size-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-red-500 transition-all"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="size-10 rounded-xl bg-white text-[var(--color-primary)] flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-2xl">
                {isUploading ? 'sync' : 'upload_file'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              {isUploading ? 'Enviando...' : 'Clique ou arraste o arquivo aqui'}
            </p>
            <p className="text-[10px] text-slate-500">
              PDF, DOC, XLS. Máximo {maxSizeMB}MB.
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
