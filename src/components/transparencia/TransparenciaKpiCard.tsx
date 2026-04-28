import { Card, CardContent } from '@/components/ui/card'

type TransparenciaKpiCardProps = {
  label: string
  value: string
  hint?: string
}

export function TransparenciaKpiCard({
  label,
  value,
  hint,
}: TransparenciaKpiCardProps) {
  return (
    <Card className="border border-slate-200 bg-white py-0">
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
