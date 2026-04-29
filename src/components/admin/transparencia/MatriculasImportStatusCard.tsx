import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export type MatriculasImportStatusSource = 'loaded-from-database' | 'session-save'

interface MatriculasImportStatusCardProps {
  importacaoId: string
  status: 'rascunho' | 'publicado'
  anoReferencia: string
  totalGeralImportado: string
  fonteResumo: string
  /** Origem do card: carregamento inicial do banco ou feedback após salvar na sessão. */
  source?: MatriculasImportStatusSource
  /** Texto já formatado (ex.: data de atualização da importação). */
  dataAtualizacaoLabel?: string | null
}

export function MatriculasImportStatusCard({
  importacaoId,
  status,
  anoReferencia,
  totalGeralImportado,
  fonteResumo,
  source = 'session-save',
  dataAtualizacaoLabel,
}: MatriculasImportStatusCardProps) {
  const isDraft = status === 'rascunho'
  const statusLabel = isDraft ? 'Rascunho' : 'Publicado'

  const isDb = source === 'loaded-from-database'

  const title = isDb ? 'Importação carregada do banco' : isDraft ? 'Importação salva como rascunho' : 'Importação publicada'

  const description = isDb
    ? 'Esta é a importação atualmente salva para Matrículas.'
    : isDraft
      ? 'A importação foi salva no banco, mas ainda não está visível no site público.'
      : 'Esta importação está marcada como publicada no banco e substitui a publicação anterior deste indicador.'

  const statusMessage = isDraft
    ? 'Esta importação está salva no banco, mas ainda não está visível na página pública.'
    : 'Estes dados estão publicados no banco e já podem ser usados pela página pública de Transparência.'

  const cardTone = isDraft
    ? 'border-amber-200/90 bg-gradient-to-br from-amber-50/90 to-white ring-amber-500/10'
    : 'border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 to-white ring-emerald-500/10'

  return (
    <Card className={cn('overflow-hidden ring-1', cardTone)}>
      <CardHeader className="gap-1">
        <CardTitle className={isDraft ? 'text-amber-950' : 'text-emerald-950'}>{title}</CardTitle>
        <CardDescription className={isDraft ? 'text-amber-900/85' : 'text-emerald-900/85'}>{description}</CardDescription>
        {isDb ? (
          <p className={cn('text-sm pt-1', isDraft ? 'text-amber-950/90' : 'text-emerald-950/90')}>{statusMessage}</p>
        ) : null}
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3 pt-4">
        <DetailRow label="ID" value={importacaoId} />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
          <Badge
            variant="outline"
            className={
              isDraft
                ? 'border-amber-300/80 bg-amber-100 text-amber-950 hover:bg-amber-100'
                : 'border-emerald-600/25 bg-emerald-600 text-white hover:bg-emerald-600'
            }
          >
            {statusLabel}
          </Badge>
        </div>
        <DetailRow label="Ano" value={anoReferencia} />
        <DetailRow label="Total geral importado" value={totalGeralImportado} />
        <DetailRow label="Fonte" value={fonteResumo} />
        {dataAtualizacaoLabel ? <DetailRow label="Data de atualização" value={dataAtualizacaoLabel} /> : null}
      </CardContent>
    </Card>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm text-right font-medium text-foreground">{value || '-'}</span>
    </div>
  )
}
