// Speichern und Laden des Spielstands im Browser (localStorage).
import type { GameState } from './types'
import { BUSINESSES, START_GELD } from './config'

const KEY = 'tap-empire-save-v1'

/** Ein frischer Spielstand zu Spielbeginn. */
export function neuerSpielstand(): GameState {
  const businesses: GameState['businesses'] = {}
  for (const b of BUSINESSES) {
    businesses[b.id] = { anzahl: 0, hatManager: false, fortschrittMs: 0, laeuft: false }
  }
  return {
    geld: START_GELD,
    gesamtVerdient: 0,
    businesses,
    investoren: 0,
    talents: {},
    talentpunkteVerdient: 0,
    prestigeCount: 0,
    autoKauf: false,
    erfolge: [],
    freigeschalteteWelten: ['welt1'],
    zuletztGesehen: Date.now(),
  }
}

/** Lädt den Spielstand oder gibt null zurück, wenn keiner existiert. */
export function laden(): GameState | null {
  try {
    const text = localStorage.getItem(KEY)
    if (!text) return null
    const daten = JSON.parse(text) as Partial<GameState>
    // Mit einem frischen Stand zusammenführen, falls neue Businesses dazugekommen sind.
    const basis = neuerSpielstand()
    return {
      ...basis,
      ...daten,
      businesses: { ...basis.businesses, ...(daten.businesses ?? {}) },
      talents: { ...basis.talents, ...(daten.talents ?? {}) },
    }
  } catch {
    return null
  }
}

/** Speichert den Spielstand und merkt sich den Zeitpunkt (für Offline-Einkommen). */
export function speichern(state: GameState): void {
  try {
    const zuSpeichern: GameState = { ...state, zuletztGesehen: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(zuSpeichern))
  } catch {
    // Speicher nicht verfügbar (z. B. privater Modus) — still ignorieren.
  }
}
