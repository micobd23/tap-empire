// Speichern und Laden des Spielstands im Browser (localStorage).
import type { GameState } from './types'
import { BUSINESSES, START_GELD } from './config'
import { naechstesIntervall } from './events'

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
    erfolgeAbgeholt: [],
    freigeschalteteWelten: ['welt1'],
    gekaufteUpgrades: [],
    wartendesEvent: null,
    wartendesEventBisMs: 0,
    aktivesEvent: null,
    naechstesEventMs: Date.now() + naechstesIntervall(),
    gesamtVerdientBeimLetztenPrestige: 0,
    zuletztGesehen: Date.now(),
    gesamtKlicks: 0,
    gesamtEventsAktiviert: 0,
  }
}

/**
 * Führt geladene oder importierte Daten mit einem frischen Stand zusammen — so sind neue
 * Businesses, Talente oder Felder aus späteren Updates immer vorhanden (sonst könnte man
 * z. B. neu hinzugekommene Businesses nicht kaufen).
 */
function normalisieren(daten: Partial<GameState>): GameState {
  const basis = neuerSpielstand()
  const merged: GameState = {
    ...basis,
    ...daten,
    businesses: { ...basis.businesses, ...(daten.businesses ?? {}) },
    talents: { ...basis.talents, ...(daten.talents ?? {}) },
  }
  // Abgelaufene Events beim Laden bereinigen, damit kein Phantom-Event aus einem alten Stand übrig bleibt.
  const jetzt = Date.now()
  if (merged.aktivesEvent && merged.aktivesEvent.laeuftBisMs < jetzt) {
    merged.aktivesEvent = null
    merged.naechstesEventMs = jetzt + naechstesIntervall()
  }
  if (merged.wartendesEvent && merged.wartendesEventBisMs < jetzt) {
    merged.wartendesEvent = null
  }
  return merged
}

/** Lädt den Spielstand oder gibt null zurück, wenn keiner existiert. */
export function laden(): GameState | null {
  try {
    const text = localStorage.getItem(KEY)
    if (!text) return null
    return normalisieren(JSON.parse(text) as Partial<GameState>)
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

// --- Spielstand-Backup: als kopierbaren Code sichern und wieder einspielen ---
// (Der Fortschritt liegt nur lokal auf dem Gerät — dieser Code ist die einzige Sicherung.)

function textZuBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binaer = ''
  for (const b of bytes) binaer += String.fromCharCode(b)
  return btoa(binaer)
}

function base64ZuText(b64: string): string {
  const binaer = atob(b64)
  const bytes = Uint8Array.from(binaer, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Erzeugt einen kopierbaren Sicherungs-Code aus dem aktuellen Spielstand. */
export function exportieren(state: GameState): string {
  return textZuBase64(JSON.stringify(state))
}

/**
 * Liest einen Sicherungs-Code wieder ein. Gibt null zurück, wenn der Text kein gültiger
 * Spielstand ist — so macht ein Vertipper oder falscher Text nichts kaputt.
 */
export function importieren(text: string): GameState | null {
  try {
    const daten = JSON.parse(base64ZuText(text.trim())) as Partial<GameState>
    if (typeof daten.geld !== 'number' || typeof daten.businesses !== 'object' || !daten.businesses) {
      return null // sieht nicht nach einem Spielstand aus
    }
    return { ...normalisieren(daten), zuletztGesehen: Date.now() }
  } catch {
    return null
  }
}
