import { Database } from 'lucide-react'

import { Button } from '@/components/ui/button'

type TransparenciaEmptyStateProps = {
  title?: string
  description?: string
  showCta?: boolean
}

export function TransparenciaEmptyState({
  title = 'Nenhum dado cadastrado ainda',
  description = 'Assim que os registros forem publicados, os indicadores aparecerao aqui.',
  showCta = false,
}: TransparenciaEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <Database className="mx-auto mb-3 size-9 text-slate-400" />
      <p className="text-base font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {showCta ? (
        <div className="mt-4">
          <Button variant="outline">Cadastrar primeiro registro</Button>
        </div>
      ) : null}
    </div>
  )
}
