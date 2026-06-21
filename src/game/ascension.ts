// Ascension = Meta-Prestige (zweite Reset-Ebene). Setzt ALLES aus der Prestige-Schicht
// zurück (Geld, Businesses, Welten, Investoren, Talente, Prestige-Level) und gibt dafür
// dauerhafte Diamanten 💎 — ein permanenter Einkommens-Bonus, der nie wieder verloren geht.
// Erfolge & gekaufte Business-Upgrades bleiben erhalten (Sammlung + weniger Tedium beim Neuaufbau).
import type { GameState } from './types'
import {
  ASCENSION_BASIS,
  ASCENSION_EXP,
  ASCENSION_K,
  BUSINESSES,
  DIAMANT_BONUS,
  START_GELD,
} from './config'
import { naechstesIntervall } from './events'

/** Wie viele Diamanten ein Lebensverdienst insgesamt wert ist (Wurzel = abnehmender Ertrag). */
export function diamantenFuer(gesamtVerdient: number): number {
  if (gesamtVerdient < ASCENSION_BASIS) return 0
  return Math.floor(ASCENSION_K * Math.pow(gesamtVerdient / ASCENSION_BASIS, ASCENSION_EXP))
}

/** Wie viele NEUE Diamanten eine Ascension gerade einbringen würde (für die Vorschau). */
export function neueDiamantenVorschau(state: GameState): number {
  return Math.max(0, diamantenFuer(state.gesamtVerdient) - state.diamanten)
}

/** Ist eine Ascension freigeschaltet (Schwelle erreicht) — egal ob sie sich gerade lohnt? */
export function ascensionFreigeschaltet(state: GameState): boolean {
  return state.ascensionCount > 0 || state.gesamtVerdient >= ASCENSION_BASIS
}

/** Lohnt sich eine Ascension JETZT (Schwelle erreicht UND es gibt neue Diamanten)? */
export function kannAscension(state: GameState): boolean {
  return state.gesamtVerdient >= ASCENSION_BASIS && neueDiamantenVorschau(state) > 0
}

/** Dauerhafter Einkommens-Faktor aus den Diamanten (1 = keine; je Diamant +DIAMANT_BONUS). */
export function diamantBonusFaktor(state: GameState): number {
  return 1 + state.diamanten * DIAMANT_BONUS
}

/**
 * Führt die Ascension durch: harter Reset der gesamten Prestige-Schicht, Diamanten gutschreiben.
 * Behalten werden: Diamanten, ascensionCount, Erfolge (+ deren Bonus), gekaufte Business-Upgrades
 * und die reinen Lebensstatistiken (Klicks, Events, Rekorde).
 */
export function ascensionDurchfuehren(state: GameState): GameState {
  const neueDiamanten = Math.max(state.diamanten, diamantenFuer(state.gesamtVerdient))
  const jetzt = Date.now()

  const businesses: GameState['businesses'] = {}
  for (const b of BUSINESSES) {
    businesses[b.id] = { anzahl: 0, hatManager: false, fortschrittMs: 0, laeuft: false }
  }

  return {
    ...state,
    geld: START_GELD,
    gesamtVerdient: 0,
    businesses,
    // Prestige-Schicht komplett zurücksetzen:
    investoren: 0,
    talents: {},
    talentpunkteVerdient: 0,
    prestigeCount: 0,
    autoKauf: false,
    freigeschalteteWelten: ['welt1'],
    gesamtVerdientBeimLetztenPrestige: 0,
    // Events bereinigen:
    wartendesEvent: null,
    wartendesEventBisMs: 0,
    aktivesEvent: null,
    naechstesEventMs: jetzt + naechstesIntervall(),
    // Meta-Schicht (bleibt/wächst):
    diamanten: neueDiamanten,
    ascensionCount: state.ascensionCount + 1,
    // Zeit-Tracker neu setzen:
    zuletztGesehen: jetzt,
    letzterPrestigeBeginnMs: jetzt,
    // Erhalten bleiben automatisch über ...state: erfolge, erfolgeAbgeholt, gekaufteUpgrades,
    // gesamtKlicks, gesamtEventsAktiviert, rekordEps, schnellstePrestigeRundeMs.
  }
}
