import { AlertCircle, CircleCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export type MatriculasImportFeedbackTone = 'success' | 'error'

interface SummaryLine {
  label: string
  value: string
}

interface MatriculasImportFeedbackCardProps {
  tone: MatriculasImportFeedbackTone
  title: string
  description: string
  complement?: string
  summaryLines?: SummaryLine[]
}

export function MatriculasImportFeedbackCard({
  tone,
  title,
  description,
  complement,
  summaryLines,
}: MatriculasImportFeedbackCardProps) {
  const isSuccess = tone === 'success'
  const ringClass = isSuccess
    ? 'border-emerald-200/90 bg-emerald-50/80 ring-emerald-500/15'
    : 'border-rose-200/90 bg-rose-50/80 ring-rose-500/15'

  return (
    <Card className={cn('overflow-hidden ring-1', ringClass)}>
      <CardHeader className="gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border ${
              isSuccess ? 'border-emerald-200 bg-white text-emerald-700' : 'border-rose-200 bg-white text-rose-700'
            }`}
            aria-hidden
          >
            {isSuccess ? <CircleCheck className="size-5" strokeWidth={2} /> : <AlertCircle className="size-5" strokeWidth={2} />}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className={isSuccess ? 'text-emerald-950' : 'text-rose-950'}>{title}</CardTitle>
              <Badge variant={isSuccess ? 'secondary' : 'destructive'}>{isSuccess ? 'Sucesso' : 'Erro'}</Badge>
            </div>
            <CardDescription className={isSuccess ? 'text-emerald-900/85' : 'text-rose-900/85'}>{description}</CardDescription>
            {complement ? (
              <p className={`text-sm font-medium ${isSuccess ? 'text-emerald-900/90' : 'text-rose-900/90'}`}>{complement}</p>
            ) : null}
          </div>
        </div>
      </CardHeader>
      {summaryLines && summaryLines.length > 0 ? (
        <>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {summaryLines.map((line) => (
                <Badge key={line.label} variant="outline" className="font-normal text-foreground">
                  <span className="text-muted-foreground">{line.label}:</span>{' '}
                  <span className="font-semibold">{line.value}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </>
      ) : null}
    </Card>
  )
}
