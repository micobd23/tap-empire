// Prestige-Logik: Investoren berechnen, Talentpunkte vergeben, Neustart durchführen.
import type { GameState } from './types'
import {
  AUTO_MANAGER_SCHWELLEN,
  BUSINESSES,
  INVESTOR_BASIS,
  INVESTOR_BONUS,
  INVESTOR_K,
  PRESTIGE_EMPFEHLUNG_FAKTOR,
  PRESTIGE_RUNDEN_BASIS,
  PRESTIGE_RUNDEN_FAKTOR,
  START_GELD,
} from './config'
import { talentEffekte } from './talents'
import {
  ertragProZyklus,
  gesamtEinkommenProSekunde,
  meisterschaftsFaktor,
  tempoMeilensteinFaktor,
  upgradeEffekte,
  weltBonusFaktor,
} from './economy'
import { erfolgsFaktor } from './erfolge'
import { eventEffekte } from './events'
import { diamantBonusFaktor } from './ascension'

/** Verdienst in der aktuellen Runde (seit letztem Prestige). */
export function rundenVerdienst(state: GameState): number {
  return state.gesamtVerdient - (state.gesamtVerdientBeimLetztenPrestige ?? 0)
}

/** Mindestverdienst in dieser Runde, bevor Prestige freigeschaltet wird. Wächst mit dem Prestige-Level. */
export function rundenSchwelle(prestigeCount: number): number {
  return PRESTIGE_RUNDEN_BASIS * Math.pow(PRESTIGE_RUNDEN_FAKTOR, prestigeCount)
}

/** Wie viele Investoren der gesamte Lebensverdienst wert ist (Wurzel = abnehmender Ertrag). */
export function investorenFuer(gesamtVerdient: number): number {
  if (gesamtVerdient < INVESTOR_BASIS) return 0
  return Math.floor(INVESTOR_K * Math.pow(gesamtVerdient / INVESTOR_BASIS, 0.25))
}

/**
 * Talentpunkte für EINEN Prestige: Grund-1, plus Bonus, der mit der Run-Größe wächst
 * (+1 TP je 10×-Schritt neu gewonnener Investoren). So ziehen Investoren UND Talente in
 * dieselbe Richtung — länger pushen lohnt für beides, statt sich zu widersprechen.
 */
export function tpGewinn(neueInvestoren: number): number {
  return 1 + Math.floor(Math.log10(Math.max(0, neueInvestoren) + 1))
}

/** Wie viele NEUE Investoren ein Reset gerade einbringen würde (für die Vorschau).
 *  Solange die Runden-Schwelle nicht erreicht ist, bleibt der Wert 0 — Investoren
 *  sind erst "verdient", wenn man die Runde abgeschlossen hat. */
export function neueInvestorenVorschau(state: GameState): number {
  if (rundenVerdienst(state) < rundenSchwelle(state.prestigeCount)) return 0
  return Math.max(0, investorenFuer(state.gesamtVerdient) - state.investoren)
}

/** Vorschau: wie viele Talentpunkte ein Prestige JETZT einbringen würde. */
export function tpGewinnVorschau(state: GameState): number {
  return tpGewinn(neueInvestorenVorschau(state))
}

/** Zerlegt den globalen Einkommens-Multiplikator in seine drei Quellen (für die Anzeige). */
export function multiplikatorAufschluesselung(state: GameState): {
  investoren: number
  talente: number
  meisterschaft: number
  erfolge: number
  welten: number
  diamanten: number
  event: number
  gesamt: number
} {
  const eff = talentEffekte(state.talents)
  const investoren = 1 + state.investoren * INVESTOR_BONUS * eff.investorVerstaerkung
  const talente = eff.einkommensMultiplikator
  const meisterschaft = meisterschaftsFaktor(state)
  const erfolge = erfolgsFaktor(state)
  const welten = weltBonusFaktor(state)
  const diamanten = diamantBonusFaktor(state)
  const event = eventEffekte(state).einkommenBoost
  return {
    investoren,
    talente,
    meisterschaft,
    erfolge,
    welten,
    diamanten,
    event,
    gesamt: investoren * talente * meisterschaft * erfolge * welten * diamanten * event,
  }
}

/** Der gesamte Einkommens-Multiplikator aus Investoren, Talenten UND Meisterschaft. */
export function globalerEinkommensMultiplikator(state: GameState): number {
  return multiplikatorAufschluesselung(state).gesamt
}

/** Einkommens-Multiplikator nach einem Prestige (mit den neuen Investoren). */
export function multNachPrestige(state: GameState): number {
  const m = multiplikatorAufschluesselung(state)
  const eff = talentEffekte(state.talents)
  const neueInv = state.investoren + neueInvestorenVorschau(state)
  const neuInvestorenFaktor = 1 + neueInv * INVESTOR_BONUS * eff.investorVerstaerkung
  return m.gesamt / m.investoren * neuInvestorenFaktor
}

/** Lohnt sich ein Prestige schon (gibt es neue Investoren UND Runden-Schwelle erreicht)? */
export function kannPrestige(state: GameState): boolean {
  return (
    neueInvestorenVorschau(state) > 0 &&
    rundenVerdienst(state) >= rundenSchwelle(state.prestigeCount)
  )
}

/**
 * Empfohlener Mindest-Zuwachs an Investoren, damit sich ein Prestige spürbar lohnt.
 * Beim allerersten Prestige (noch 0 Investoren) ist die Empfehlung 0 — er lohnt sich immer.
 */
export function empfohleneNeueInvestoren(state: GameState): number {
  return Math.ceil(state.investoren * PRESTIGE_EMPFEHLUNG_FAKTOR)
}

/** Lohnt sich der Prestige JETZT spürbar (genug neue Investoren laut Empfehlung)? */
export function prestigeLohntSich(state: GameState): boolean {
  const neue = neueInvestorenVorschau(state)
  return neue > 0 && neue >= empfohleneNeueInvestoren(state)
}

/** Wie viele der ersten Businesses bei diesem Prestige-Stand automatisch einen Manager haben. */
export function autoManagerAnzahl(prestigeCount: number): number {
  let anzahl = 0
  for (const schwelle of AUTO_MANAGER_SCHWELLEN) {
    if (prestigeCount >= schwelle) anzahl++
  }
  return anzahl
}

/** Nächste Prestige-Schwelle, ab der ein weiterer Auto-Manager freigeschaltet wird. */
export function naechsteAutoManagerSchwelle(prestigeCount: number): number | null {
  for (const schwelle of AUTO_MANAGER_SCHWELLEN) {
    if (prestigeCount < schwelle) return schwelle
  }
  return null
}

/** Gesamteinkommen pro Sekunde inkl. Multiplikator und Tempo — bequem für die UI. */
export function einkommenProSekundeGesamt(state: GameState): number {
  const mult = globalerEinkommensMultiplikator(state)
  const zyklusFaktor = talentEffekte(state.talents).zyklusFaktor
  return gesamtEinkommenProSekunde(state, mult, zyklusFaktor)
}

/**
 * Wie viele Sekunden Einkommen ein einzelner Imperium-Tap einbringt.
 * Klein genug, dass Idle immer der Hauptmotor bleibt — Tappen ist ein freier Bonus,
 * nie nötig (man kann gar nicht schnell genug tippen, um das Idle-Einkommen zu schlagen).
 */
export const TAP_SEKUNDEN = 2

/**
 * Ertrag eines einzelnen Imperium-Taps: bezieht sich auf die GESAMTE Welt
 * (= dein laufendes Gesamteinkommen). Skaliert dadurch automatisch mit dem
 * Fortschritt → lohnt sich in jeder Welt, wird aber nie wertlos und nie nötig.
 *
 * Floor fürs ganz frühe Spiel (noch keine Manager, Einkommen/Sek = 0): ein
 * Produktionszyklus des stärksten besessenen Business, damit Tappen ab dem
 * allerersten Stück etwas bringt.
 */
export function weltTapErtrag(state: GameState): number {
  const mult = globalerEinkommensMultiplikator(state)
  const { zyklusFaktor } = talentEffekte(state.talents)

  // Potenzielles Einkommen/Sek = so, als hätte JEDES besessene Business einen Manager.
  // Dadurch zählen langsame Businesses nur mit ihrem Pro-Sekunde-Wert (kein Tap-Exploit),
  // und schon im Frühspiel (noch kein Manager) bringt ein Tap etwas.
  let potenzialProSek = 0
  for (const b of BUSINESSES) {
    const rt = state.businesses[b.id]
    if (!rt || rt.anzahl === 0) continue
    const { ertragFaktor, tempoDivisor } = upgradeEffekte(b.id, state.gekaufteUpgrades ?? [])
    const dauer = (b.dauerMs / tempoDivisor) * zyklusFaktor * tempoMeilensteinFaktor(rt.anzahl)
    potenzialProSek += ertragProZyklus(b, rt.anzahl, ertragFaktor) / (dauer / 1000)
  }

  return potenzialProSek * mult * TAP_SEKUNDEN
}

/** Führt den Prestige durch: Businesses zurücksetzen, Investoren, Talentpunkte & Auto-Manager. */
export function prestigeDurchfuehren(state: GameState): GameState {
  const neuerCount = state.prestigeCount + 1
  const neueInvestoren = Math.max(state.investoren, investorenFuer(state.gesamtVerdient))
  // Talentpunkte: Grund-1 plus Run-Größen-Bonus (siehe tpGewinn), additiv aufaddiert.
  // Vorher war der Wert genau gleich der Prestige-Anzahl (jedes Mal +1) — die Aufaddierung
  // setzt das also nahtlos fort, gibt bei großen Runs aber spürbar mehr Punkte.
  const gewonneneInvestoren = neueInvestoren - state.investoren
  const tpVerdient = state.talentpunkteVerdient + tpGewinn(gewonneneInvestoren)
  const eff = talentEffekte(state.talents)

  const businesses: GameState['businesses'] = {}
  BUSINESSES.forEach((b, i) => {
    businesses[b.id] = {
      anzahl: 0,
      // Auto-Manager: ab den Prestige-Schwellen behält das Business seinen Manager dauerhaft.
      hatManager: neuerCount >= AUTO_MANAGER_SCHWELLEN[i],
      fortschrittMs: 0,
      laeuft: false,
    }
  })

  return {
    ...state,
    geld: START_GELD + eff.startkapital,
    businesses,
    investoren: neueInvestoren,
    talentpunkteVerdient: tpVerdient,
    prestigeCount: neuerCount,
    // Welten müssen nach jedem Prestige neu freigeschaltet werden.
    freigeschalteteWelten: ['welt1'],
    // gesamtVerdient bleibt erhalten (Basis für die Investoren über alle Runs)
    gesamtVerdientBeimLetztenPrestige: state.gesamtVerdient,
    zuletztGesehen: Date.now(),
  }
}
