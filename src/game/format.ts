// Große Zahlen lesbar machen: 1500 -> "1,5 Tsd.", 3_200_000 -> "3,2 Mio." usw.

const EINHEITEN = ['', ' Tsd.', ' Mio.', ' Mrd.', ' Bio.', ' Brd.', ' Trill.', ' Trd.', ' Quad.', ' Quard.']

/** Formatiert einen Geldbetrag im deutschen Stil mit Tausender-Einheiten. */
export function formatGeld(wert: number): string {
  if (!isFinite(wert)) return '∞'
  if (wert < 1000) {
    return Math.floor(wert).toLocaleString('de-DE')
  }

  let stufe = 0
  let n = wert
  while (n >= 1000 && stufe < EINHEITEN.length - 1) {
    n /= 1000
    stufe++
  }

  // Sehr große Zahlen jenseits unserer Einheiten: wissenschaftliche Schreibweise.
  if (stufe === EINHEITEN.length - 1 && n >= 1000) {
    return wert.toExponential(2).replace('.', ',')
  }

  const nachkomma = n < 10 ? 2 : n < 100 ? 1 : 0
  const zahl = n.toLocaleString('de-DE', {
    minimumFractionDigits: nachkomma,
    maximumFractionDigits: nachkomma,
  })
  return zahl + EINHEITEN[stufe]
}

/** Formatiert eine Dauer in Millisekunden kurz, z. B. "3,0 s" oder "1:30 min". */
export function formatDauer(ms: number): string {
  const sekunden = ms / 1000
  if (sekunden < 60) return `${sekunden.toLocaleString('de-DE', { maximumFractionDigits: 1 })} s`
  const min = Math.floor(sekunden / 60)
  const rest = Math.floor(sekunden % 60)
  return `${min}:${rest.toString().padStart(2, '0')} min`
}
