import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type TransparenciaKpiCardProps = {
  label: string
  value: string
  hint?: string
  borderTopClass?: string
}

export function TransparenciaKpiCard({
  label,
  value,
  hint,
  borderTopClass = 'border-t-blue-700',
}: TransparenciaKpiCardProps) {
  return (
    <Card className={cn('border border-slate-200 bg-white py-0 shadow-md border-t-4', borderTopClass)}>
      <CardContent className="space-y-1 p-4">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
