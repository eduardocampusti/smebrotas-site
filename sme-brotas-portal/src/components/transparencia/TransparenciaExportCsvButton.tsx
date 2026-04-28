import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TransparenciaExportCsvButtonProps<T extends Record<string, unknown>> = {
  fileName: string
  rows: T[]
}

function toCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function TransparenciaExportCsvButton<T extends Record<string, unknown>>({
  fileName,
  rows,
}: TransparenciaExportCsvButtonProps<T>) {
  const handleExport = () => {
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((key) => `"${toCell(row[key]).replace(/"/g, '""')}"`).join(','),
      ),
    ]
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download />
      Exportar CSV
    </Button>
  )
}
