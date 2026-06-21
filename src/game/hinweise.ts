// Ein einziger, kontextbezogener "Was tun als Nächstes?"-Hinweis.
// Zeigt bewusst nur DAS, was auf dem Business-Screen nicht ohnehin schon offensichtlich ist
// (Welt freischaltbar, freie Talentpunkte, das nächste Spar-Ziel) — kein Doppeln der Karten.
import type { GameState } from './types'
import { WELTEN } from './config'
import { talentEffekte, verfuegbareTalentpunkte } from './talents'
import { formatGeld } from './format'

export interface Hinweis {
  emoji: string
  text: string
}

export function naechsterTipp(state: GameState): Hinweis | null {
  const naechsteWelt = WELTEN.find((w) => !state.freigeschalteteWelten.includes(w.id))
  const weltRabatt = talentEffekte(state.talents).weltRabatt
  const weltKosten = naechsteWelt
    ? Math.round(naechsteWelt.freischaltKosten * (1 - weltRabatt))
    : 0

  // 1) Nächste Welt ist JETZT leistbar — das größte Fortschritts-Event.
  if (naechsteWelt && state.geld >= weltKosten) {
    return { emoji: '🔓', text: `${naechsteWelt.emoji} ${naechsteWelt.name} jetzt freischaltbar!` }
  }

  // 2) Freie Talentpunkte — auf dem Business-Screen sonst unsichtbar.
  const tp = verfuegbareTalentpunkte(state)
  if (tp > 0) {
    return { emoji: '🌳', text: `${tp} Talentpunkt${tp === 1 ? '' : 'e'} frei — im ⭐-Tab ausgeben` }
  }

  // 3) Klares Spar-Ziel auf die nächste Welt.
  if (naechsteWelt) {
    const rest = weltKosten - state.geld
    return { emoji: '🎯', text: `Nächstes Ziel: ${naechsteWelt.emoji} ${naechsteWelt.name} — noch ${formatGeld(rest)} €` }
  }

  // Alle Welten frei: kein aufdringlicher Hinweis (Prestige & Erfolge zeigen ihren Punkt am Tab).
  return null
}
