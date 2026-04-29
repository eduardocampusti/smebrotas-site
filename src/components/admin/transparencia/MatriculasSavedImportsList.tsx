import { useCallback, useEffect, useState } from 'react'

import type { MatriculasImportacaoListItem } from '@/services/transparencia/matriculasImportacaoService'
import { listMatriculasImportacoes, publishMatriculasImportacao } from '@/services/transparencia/matriculasImportacaoService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MatriculasSavedImportsListProps {
  activeImportacaoId: string | null
  onLoadImportacao: (importacaoId: string) => Promise<void>
  onAfterPublish?: () => void
  disabled?: boolean
}

function formatDatePt(iso: string) {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(t))
}

export function MatriculasSavedImportsList({
  activeImportacaoId,
  onLoadImportacao,
  disabled,
  onAfterPublish,
}: MatriculasSavedImportsListProps) {
  const [items, setItems] = useState<MatriculasImportacaoListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await listMatriculasImportacoes()
      setItems(list)
    } catch {
      setError('Não foi possível listar as importações salvas.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handlePublish(id: string) {
    setBusyId(id)
    try {
      await publishMatriculasImportacao(id)
      await refresh()
      onAfterPublish?.()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Importações salvas</CardTitle>
        <CardDescription>Últimas gravações no banco. Use Carregar para revisar outra versão ou Publicar um rascunho.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <p className="text-sm text-slate-600">Carregando lista...</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {!loading && !error && items.length === 0 ? (
          <p className="text-sm text-slate-600">Nenhuma importação gravada ainda.</p>
        ) : null}
        <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-100 divide-y divide-slate-100">
          {items.map((row) => {
            const isActive = row.id === activeImportacaoId
            const busy = busyId === row.id
            return (
              <div
                key={row.id}
                className={cn('flex flex-wrap items-center gap-2 px-3 py-2 text-sm', isActive && 'bg-slate-50')}
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{formatDatePt(row.updated_at)}</span>
                    <Badge variant="outline" className="text-xs">
                      {row.status_publicacao === 'publicado' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Ano {row.ano_referencia} · Total {row.total_geral_importado.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={disabled || busy}
                    onClick={() => onLoadImportacao(row.id)}
                  >
                    Carregar
                  </Button>
                  {row.status_publicacao === 'rascunho' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={disabled || busy}
                      onClick={() => void handlePublish(row.id)}
                    >
                      {busy ? 'Publicando...' : 'Publicar'}
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => void refresh()} disabled={loading}>
          Atualizar lista
        </Button>
      </CardContent>
    </Card>
  )
}
