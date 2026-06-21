// Die Spiel-Schleife: schreitet die Produktionszyklen voran und zahlt Erträge aus.
// `tick` verändert den übergebenen Zustand direkt (der Store kümmert sich ums Neu-Rendern).
import type { GameState } from './types'
import { AUTO_KAUFER_AB_PRESTIGE, BUSINESSES } from './config'
import { bestesLeistbares, ertragProZyklus, kostenFuer, tempoMeilensteinFaktor, upgradeEffekte } from './economy'
import { globalerEinkommensMultiplikator } from './prestige'
import { talentEffekte } from './talents'
import { erfolgePruefen } from './erfolge'
import { eventEffekte, naechstesIntervall, WARTE_DAUER_MS, zufaelligEventId } from './events'

/** Ein Spielschritt. `deltaMs` = vergangene Zeit seit dem letzten Tick. */
export function tick(state: GameState, deltaMs: number): void {
  const mult = globalerEinkommensMultiplikator(state)
  const zyklusFaktor = talentEffekte(state.talents).zyklusFaktor
  const jetzt = Date.now()

  // --- Event-Lifecycle ---
  // Neues Event erscheinen lassen (nur wenn kein Event läuft/wartet)
  if (!state.wartendesEvent && !state.aktivesEvent && jetzt >= (state.naechstesEventMs ?? 0)) {
    state.wartendesEvent = zufaelligEventId()
    state.wartendesEventBisMs = jetzt + WARTE_DAUER_MS
  }
  // Wartendes Event verfallen lassen (Spieler hat 30s verpasst)
  if (state.wartendesEvent && jetzt >= state.wartendesEventBisMs) {
    state.wartendesEvent = null
    state.naechstesEventMs = jetzt + naechstesIntervall()
  }
  // Aktives Event beenden
  if (state.aktivesEvent && jetzt >= state.aktivesEvent.laeuftBisMs) {
    state.aktivesEvent = null
    state.naechstesEventMs = jetzt + naechstesIntervall()
  }

  const evEff = eventEffekte(state)

  for (const b of BUSINESSES) {
    const rt = state.businesses[b.id]
    if (!rt || rt.anzahl === 0) continue
    // Manager-Streik: automatische Produktion ist blockiert, nur manuelles Tippen geht noch.
    if (!rt.laeuft && (!rt.hatManager || evEff.managerGestreikt)) continue

    const { ertragFaktor, tempoDivisor } = upgradeEffekte(b.id, state.gekaufteUpgrades ?? [])
    const dauer = (b.dauerMs / tempoDivisor / evEff.tempoBoost) * zyklusFaktor * tempoMeilensteinFaktor(rt.anzahl)
    rt.fortschrittMs += deltaMs
    if (rt.fortschrittMs < dauer) continue

    if (rt.hatManager) {
      const zyklen = Math.floor(rt.fortschrittMs / dauer)
      const ertrag = ertragProZyklus(b, rt.anzahl, ertragFaktor) * mult * zyklen
      state.geld += ertrag
      state.gesamtVerdient += ertrag
      rt.fortschrittMs -= zyklen * dauer
    } else {
      const ertrag = ertragProZyklus(b, rt.anzahl, ertragFaktor) * mult
      state.geld += ertrag
      state.gesamtVerdient += ertrag
      rt.fortschrittMs = 0
      rt.laeuft = false
    }
  }

  // Auto-Käufer (ab freigeschaltetem Prestige-Level): kauft pro Tick das höchstwertige leistbare
  // Stück → schaltet neue Sorten frei und pumpt nicht endlos die billigste hoch.
  if (state.autoKauf && state.prestigeCount >= AUTO_KAUFER_AB_PRESTIGE) {
    const b = bestesLeistbares(state)
    if (b) {
      const rt = state.businesses[b.id]
      state.geld -= kostenFuer(b, rt.anzahl, 1)
      rt.anzahl += 1
    }
  }

  // Neu erreichte Erfolge dauerhaft eintragen.
  erfolgePruefen(state)
}

/**
 * Rechnet das Einkommen aus, das während der Abwesenheit angefallen ist.
 * Nur Businesses mit Manager produzieren offline. Deckel, Bonus und Tempo kommen aus den Talenten.
 */
export function applyOffline(state: GameState, vergangenMs: number): number {
  const eff = talentEffekte(state.talents)
  const ms = Math.max(0, Math.min(vergangenMs, eff.offlineDeckelMs))
  if (ms === 0) return 0

  const mult = globalerEinkommensMultiplikator(state) * eff.offlineMultiplikator
  let verdient = 0
  for (const b of BUSINESSES) {
    const rt = state.businesses[b.id]
    if (!rt || rt.anzahl === 0 || !rt.hatManager) continue

    const { ertragFaktor, tempoDivisor } = upgradeEffekte(b.id, state.gekaufteUpgrades ?? [])
    const dauer = (b.dauerMs / tempoDivisor) * eff.zyklusFaktor * tempoMeilensteinFaktor(rt.anzahl)
    const gesamt = rt.fortschrittMs + ms
    const zyklen = Math.floor(gesamt / dauer)
    if (zyklen > 0) {
      verdient += ertragProZyklus(b, rt.anzahl, ertragFaktor) * mult * zyklen
      rt.fortschrittMs = gesamt - zyklen * dauer
    } else {
      rt.fortschrittMs = gesamt
    }
  }

  state.geld += verdient
  state.gesamtVerdient += verdient
  return verdient
}
