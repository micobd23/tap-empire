// Erfolge (Achievements): feste Ziele, die dauerhaft einen kleinen Einkommens-Bonus geben.
// Einmal erreicht, bleiben sie erreicht (in state.erfolge gespeichert) — auch über Prestige hinweg.
import type { GameState } from './types'
import { ASTE, BUSINESSES, ERFOLG_BONUS, TALENTE } from './config'

export interface ErfolgConfig {
  id: string
  name: string
  beschreibung: string
  /** Ist der Erfolg mit diesem Spielstand erfüllt? */
  erfuellt: (state: GameState) => boolean
}

// --- kleine Helfer für die Bedingungen ---
const stueckGesamt = (s: GameState) => Object.values(s.businesses).reduce((sum, rt) => sum + rt.anzahl, 0)
const sorten = (s: GameState) => Object.values(s.businesses).filter((rt) => rt.anzahl >= 1).length
const managerAnzahl = (s: GameState) => Object.values(s.businesses).filter((rt) => rt.hatManager).length
const groessteAnzahl = (s: GameState) => Object.values(s.businesses).reduce((m, rt) => Math.max(m, rt.anzahl), 0)
const talenteAnzahl = (s: GameState) => Object.values(s.talents).filter((stufe) => stufe >= 1).length

/** Ist mindestens ein Talent-Ast mit allen festen Knoten komplett ausgebaut? */
function einAstKomplett(s: GameState): boolean {
  return ASTE.some((ast) => {
    const feste = TALENTE.filter((t) => t.ast === ast && !t.endlos)
    return feste.length > 0 && feste.every((t) => (s.talents[t.id] ?? 0) >= 1)
  })
}

export const ERFOLGE: ErfolgConfig[] = [
  { id: 'limo25',     name: '🥤 Durststrecke',      beschreibung: '25 Limonadenstände',           erfuellt: (s) => (s.businesses.limonade?.anzahl ?? 0) >= 25 },
  { id: 'zeitung25',  name: '📰 Schlagzeilen',      beschreibung: '25 Zeitungskioske',            erfuellt: (s) => (s.businesses.zeitung?.anzahl ?? 0) >= 25 },
  { id: 'pizza25',    name: '🍕 Franchise',         beschreibung: '25 Pizzerien',                 erfuellt: (s) => (s.businesses.pizza?.anzahl ?? 0) >= 25 },
  { id: 'stueck100',  name: '🏭 Fließband',         beschreibung: '100 Stück bei einem Business', erfuellt: (s) => groessteAnzahl(s) >= 100 },
  { id: 'stueck500',  name: '👑 Vollausbau',        beschreibung: '500 Stück bei einem Business', erfuellt: (s) => groessteAnzahl(s) >= 500 },
  { id: 'stueck1k',   name: '📦 Großhändler',       beschreibung: '1.000 Stück insgesamt',        erfuellt: (s) => stueckGesamt(s) >= 1000 },
  { id: 'geld1e6',    name: '💰 Erste Million',     beschreibung: '1 Mio. € insgesamt verdient',  erfuellt: (s) => s.gesamtVerdient >= 1_000_000 },
  { id: 'geld1e9',    name: '💎 Milliardär',        beschreibung: '1 Mrd. € insgesamt verdient',  erfuellt: (s) => s.gesamtVerdient >= 1_000_000_000 },
  { id: 'geld1e12',   name: '🌌 Billionär',         beschreibung: '1 Bio. € insgesamt verdient',  erfuellt: (s) => s.gesamtVerdient >= 1_000_000_000_000 },
  { id: 'prestige1',  name: '♻️ Neuanfang',         beschreibung: 'Zum ersten Mal Prestige',      erfuellt: (s) => s.prestigeCount >= 1 },
  { id: 'prestige10', name: '🔄 Routinier',         beschreibung: '10× Prestige',                 erfuellt: (s) => s.prestigeCount >= 10 },
  { id: 'inv1k',      name: '🤝 Investoren-Magnet',  beschreibung: '1.000 Investoren',            erfuellt: (s) => s.investoren >= 1000 },
  { id: 'mgrAlle',    name: '🧑‍💼 Delegierer',       beschreibung: 'Alle 8 Manager anstellen',     erfuellt: (s) => managerAnzahl(s) >= BUSINESSES.length },
  { id: 'sortenAlle', name: '🏙️ Imperium',          beschreibung: 'Alle 8 Sorten besitzen',       erfuellt: (s) => sorten(s) >= BUSINESSES.length },
  { id: 'astKomplett',name: '🌟 Ast-Meister',       beschreibung: 'Einen Talent-Ast komplett',    erfuellt: einAstKomplett },
  { id: 'talente10',  name: '🏆 Talentiert',        beschreibung: '10 Talente gekauft',           erfuellt: (s) => talenteAnzahl(s) >= 10 },
]

/** Prüft alle Erfolge und trägt neu erreichte dauerhaft in state.erfolge ein. */
export function erfolgePruefen(state: GameState): void {
  let neu: string[] | null = null
  for (const e of ERFOLGE) {
    if (!state.erfolge.includes(e.id) && e.erfuellt(state)) {
      if (!neu) neu = [...state.erfolge]
      neu.push(e.id)
    }
  }
  if (neu) state.erfolge = neu
}

/** Einkommens-Faktor aus den erreichten Erfolgen (1 = keiner; je Erfolg +ERFOLG_BONUS). */
export function erfolgsFaktor(state: GameState): number {
  return 1 + state.erfolge.length * ERFOLG_BONUS
}
