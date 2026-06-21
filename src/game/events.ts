// Glücks-Events: erscheinen alle paar Minuten zufällig, bringen kurze Boni (oder Strafen).
import type { GameState } from './types'

export interface EventTyp {
  id: string
  name: string
  emoji: string
  beschreibung: string
  /** Wirkungsdauer in ms. 0 = sofortige Einmalzahlung (kein aktivesEvent). */
  dauerMs: number
  effekt: 'einkommenBoost' | 'kaufRabatt' | 'tempoBoost' | 'geldkoffer' | 'managerStreik'
  /** Faktor: bei einkommenBoost/tempoBoost der Multiplikator; bei kaufRabatt der Rabatt-Anteil (0,5 = −50 %). */
  faktor: number
}

export const EVENT_TYPEN: EventTyp[] = [
  { id: 'goldeneStunde',    name: 'Goldene Stunde',    emoji: '🌟', beschreibung: '×2 Einkommen für 60 Sekunden',             dauerMs: 60_000, effekt: 'einkommenBoost', faktor: 2   },
  { id: 'sonderangebot',    name: 'Sonderangebot',     emoji: '💼', beschreibung: 'Alle Käufe 50 % günstiger für 30 Sekunden', dauerMs: 30_000, effekt: 'kaufRabatt',     faktor: 0.5 },
  { id: 'produktionsBoost', name: 'Produktions-Boost', emoji: '⚡', beschreibung: '×2 schnellere Zyklen für 30 Sekunden',      dauerMs: 30_000, effekt: 'tempoBoost',     faktor: 2   },
  { id: 'geldkoffer',       name: 'Geldkoffer',        emoji: '💰', beschreibung: '5 Minuten Einkommen auf einmal',            dauerMs: 0,      effekt: 'geldkoffer',    faktor: 300 },
  { id: 'managerStreik',    name: 'Manager-Streik',    emoji: '😤', beschreibung: 'Alle Manager streiken für 20 Sekunden',     dauerMs: 20_000, effekt: 'managerStreik',  faktor: 1   },
]

export const EVENT_MAP: Record<string, EventTyp> = Object.fromEntries(EVENT_TYPEN.map((e) => [e.id, e]))

/** Wie lange ein erschienenes Event auf den Spieler wartet, bevor es verfällt. */
export const WARTE_DAUER_MS = 30_000

const EVENT_MIN_MS = 3 * 60 * 1000
const EVENT_MAX_MS = 7 * 60 * 1000

export function naechstesIntervall(): number {
  return EVENT_MIN_MS + Math.random() * (EVENT_MAX_MS - EVENT_MIN_MS)
}

export function zufaelligEventId(): string {
  return EVENT_TYPEN[Math.floor(Math.random() * EVENT_TYPEN.length)].id
}

/** Aktuelle Effekte des laufenden Events (einkommenBoost ist 1 = neutral wenn kein Event aktiv). */
export function eventEffekte(state: GameState): {
  einkommenBoost: number
  tempoBoost: number
  kaufRabatt: number
  managerGestreikt: boolean
} {
  const defaults = { einkommenBoost: 1, tempoBoost: 1, kaufRabatt: 0, managerGestreikt: false }
  const ev = state.aktivesEvent
  if (!ev || Date.now() > ev.laeuftBisMs) return defaults
  const typ = EVENT_MAP[ev.typId]
  if (!typ) return defaults
  switch (typ.effekt) {
    case 'einkommenBoost': return { ...defaults, einkommenBoost: typ.faktor }
    case 'tempoBoost':     return { ...defaults, tempoBoost: typ.faktor }
    case 'kaufRabatt':     return { ...defaults, kaufRabatt: typ.faktor }
    case 'managerStreik':  return { ...defaults, managerGestreikt: true }
    default:               return defaults
  }
}
