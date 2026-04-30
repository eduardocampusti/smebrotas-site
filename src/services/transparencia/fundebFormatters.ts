export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercentBR(value: number) {
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`
}

export function formatMillionBRL(value: number) {
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 1_000_000)} mi`
}

export function parseCurrencyInput(value: string) {
  return parseLocaleNumber(value)
}

export function parsePercentInput(value: string) {
  return parseLocaleNumber(value.replace('%', ''))
}

export function parseLocaleNumber(raw: string) {
  const cleaned = raw.trim().replace(/[R$\s]/g, '').replace(/[^\d,.-]/g, '')
  if (!cleaned) return 0

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  const decimalSeparator = lastComma > lastDot ? ',' : '.'

  const withoutThousands =
    decimalSeparator === ','
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '')

  const parsed = Number.parseFloat(withoutThousands)
  return Number.isFinite(parsed) ? parsed : 0
}
