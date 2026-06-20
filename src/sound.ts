// Sound-Effekte fürs Spielgefühl. Alle Töne werden live mit der Web Audio API erzeugt
// (Oszillatoren) — es gibt KEINE Audio-Dateien, daher nichts zu laden und keine Lizenzfragen.
// Gehört zur "Hülle" (Browser-API), nicht ins reine Spiel-Gehirn in src/game/.

const SPEICHER_SCHLUESSEL = 'te-sound'

let ctx: AudioContext | null = null
let an = ladeEinstellung()

/** Standard: an. Nur wenn ausdrücklich 'aus' gespeichert wurde, ist der Ton aus. */
function ladeEinstellung(): boolean {
  try {
    return localStorage.getItem(SPEICHER_SCHLUESSEL) !== 'aus'
  } catch {
    return true
  }
}

/** Ist der Ton gerade eingeschaltet? */
export function soundAktiv(): boolean {
  return an
}

/** Schaltet den Ton an/aus, merkt sich die Wahl und gibt den neuen Zustand zurück. */
export function soundUmschalten(): boolean {
  an = !an
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, an ? 'an' : 'aus')
  } catch {
    // localStorage nicht verfügbar — egal, gilt dann nur für diese Sitzung.
  }
  return an
}

/** Erzeugt den AudioContext (einmalig) und weckt ihn auf — iOS startet ihn schlafend. */
function hol(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  // Nach jeder Nutzer-Geste sicherstellen, dass der Context wach ist (iOS-Pflicht).
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/**
 * Spielt einen kurzen Ton mit weicher Hüllkurve (schnell laut → sanft aus).
 * @param frequenz Tonhöhe in Hz
 * @param dauer Länge in Sekunden
 * @param typ Wellenform
 * @param lautstaerke Spitzenlautstärke (0–1)
 * @param verzoegerung Startverzögerung in Sekunden (für Akkorde/Abfolgen)
 */
function ton(
  frequenz: number,
  dauer: number,
  typ: OscillatorType = 'sine',
  lautstaerke = 0.2,
  verzoegerung = 0,
) {
  const c = hol()
  if (!c) return
  const start = c.currentTime + verzoegerung
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = typ
  osc.frequency.setValueAtTime(frequenz, start)
  // exponentialRamp darf nie auf exakt 0 gehen → Mini-Startwert 0.0001.
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(lautstaerke, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dauer)
  osc.connect(gain).connect(c.destination)
  osc.start(start)
  osc.stop(start + dauer)
}

/** Leichtes "Plopp" beim Antippen — mit etwas Zufall, damit schnelles Tippen lebendig klingt. */
export function soundTap() {
  if (!an) return
  ton(380 + Math.random() * 60, 0.12, 'triangle', 0.18)
}

/** Heller Doppelton ("Ka-ching") beim Kauf. */
export function soundKauf() {
  if (!an) return
  ton(660, 0.1, 'square', 0.1)
  ton(990, 0.16, 'square', 0.1, 0.06)
}

/** Aufsteigender Dreiklang (C–E–G) beim Meilenstein. */
export function soundMeilenstein() {
  if (!an) return
  ton(523, 0.14, 'triangle', 0.18, 0)
  ton(659, 0.14, 'triangle', 0.18, 0.1)
  ton(784, 0.22, 'triangle', 0.18, 0.2)
}

/** Triumphaler Akkord beim Prestige. */
export function soundPrestige() {
  if (!an) return
  ton(523, 0.5, 'sawtooth', 0.1, 0)
  ton(659, 0.5, 'sawtooth', 0.1, 0)
  ton(784, 0.6, 'sawtooth', 0.1, 0)
  ton(1047, 0.7, 'sawtooth', 0.1, 0.08)
}
