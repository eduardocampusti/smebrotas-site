/**
 * Utilitários para conversão de coordenadas geográficas
 * Formato suportado: DMS (Graus, Minutos, Segundos) do Google Earth Pro
 * Exemplo: 12°12'34.40"S, 42°16'44.57"O
 */

/**
 * Converte de Decimal para DMS (formato Google Earth Pro)
 */
export const decimalToDMS = (decimal: number | null, type: 'lat' | 'lng'): string => {
  if (decimal === null || decimal === undefined || isNaN(decimal)) return '';

  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  let hemisphere = '';
  if (type === 'lat') {
    hemisphere = decimal >= 0 ? 'N' : 'S';
  } else {
    // Para longitude, o usuário quer 'O' ou 'W'. Vamos usar 'O' por padrão no BR.
    hemisphere = decimal >= 0 ? 'L' : 'O';
  }

  return `${degrees}°${minutes}'${seconds}"${hemisphere}`;
};

/**
 * Converte de DMS para Decimal
 * Aceita formatos flexíveis de colagem, incluindo espaços extras, vírgulas e aspas variadas
 */
export const dmsToDecimal = (dms: string): number | null => {
  if (!dms) return null;

  // Limpeza inicial: remove espaços nas extremidades e normaliza aspas/vírgulas
  const cleaned = dms.trim()
    .replace(/[“”″]/g, '"')
    .replace(/[‘’′]/g, "'")
    .replace(',', '.');

  // Regex flexível:
  // 1. Graus (números)
  // 2. Símbolo de graus ou espaço
  // 3. Minutos (números)
  // 4. Símbolo de minutos ou espaço
  // 5. Segundos (números decimais)
  // 6. Símbolo de segundos ou opcional
  // 7. Hemisfério (N, S, L, E, O, W)
  const regex = /(\d+)[°\s]+(\d+)['\s]+(\d+(?:\.\d+)?)"?\s*([NSLEOW])/i;
  const match = cleaned.match(regex);

  if (!match) {
    // Se não for DMS, tenta ver se é um número decimal puro
    // Só tenta parsear se não houver símbolos de graus/minutos para evitar parsing parcial errado
    if (/[°'"]/.test(dms)) return null;
    
    const numeric = parseFloat(cleaned);
    return isNaN(numeric) ? null : numeric;
  }

  const degrees = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = parseFloat(match[3]);
  const hemisphere = match[4].toUpperCase();

  let decimal = degrees + minutes / 60 + seconds / 3600;

  // Hemisférios Sul (S), Oeste (O/W) são negativos
  if (hemisphere === 'S' || hemisphere === 'O' || hemisphere === 'W') {
    decimal = -decimal;
  }

  return Number(decimal.toFixed(8));
};

/**
 * Valida se uma string está no formato DMS esperado
 */
export const isValidDMS = (dms: string): boolean => {
  if (!dms) return true;
  const cleaned = dms.trim().replace(/[“”″]/g, '"').replace(/[‘’′]/g, "'").replace(',', '.');
  // Versão simplificada da regex para validação visual
  const regex = /(\d+)[°\s]+(\d+)['\s]+(\d+(?:\.\d+)?)"?\s*([NSLEOW])/i;
  return regex.test(cleaned);
};
