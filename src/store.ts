// Der Store ist die Brücke zwischen Gehirn (Logik) und Hülle (Anzeige).
import { create } from 'zustand'
import type { GameState } from './game/types'
import { exportieren, importieren, laden, neuerSpielstand, speichern } from './game/save'
import { applyOffline, tick } from './game/engine'
import { BUSINESS_MAP, UPGRADE_MAP, WELT_MAP } from './game/config'
import { kostenFuer } from './game/economy'
import { kannPrestige, prestigeDurchfuehren, einkommenProSekundeGesamt, weltTapErtrag } from './game/prestige'
import { ascensionDurchfuehren, kannAscension } from './game/ascension'
import { talentEffekte, talentKaufbar } from './game/talents'
import { EVENT_MAP, eventEffekte, naechstesIntervall } from './game/events'

/** Wie viele Stück ein Kauf-Klick kauft. 'max' = so viele wie leistbar. */
export type KaufModus = 1 | 10 | 100 | 'max'

interface GameStore {
  state: GameState
  offlineVerdienst: number
  kaufModus: KaufModus
  /** Welche Welt im Business-Tab gerade angezeigt wird (reine Anzeige, nicht gespeichert). */
  aktiveWelt: string
  tickStore: (deltaMs: number) => void
  kaufen: (id: string, menge: number) => void
  managerKaufen: (id: string) => void
  antippen: (id: string) => void
  /** Imperium-Tap: gibt freies Bonus-Geld basierend auf dem Gesamteinkommen. Gibt den Ertrag zurück (0 = abgelehnt/gedeckelt). */
  weltTippen: () => number
  prestige: () => void
  ascension: () => void
  talentKaufen: (id: string) => void
  setKaufModus: (m: KaufModus) => void
  autoKaufUmschalten: () => void
  erfolgAbholen: (id: string) => void
  alleErfolgeAbholen: () => void
  setAktiveWelt: (id: string) => void
  weltFreischalten: (id: string) => void
  upgradeKaufen: (id: string) => void
  eventAktivieren: () => void
  streikAbwenden: () => void
  spielstandExportieren: () => string
  spielstandImportieren: (text: string) => boolean
  spielstandZuruecksetzen: () => void
  speichernJetzt: () => void
  offlineQuittieren: () => void
}

function start(): { state: GameState; offlineVerdienst: number } {
  const geladen = laden()
  if (!geladen) return { state: neuerSpielstand(), offlineVerdienst: 0 }
  const offlineVerdienst = applyOffline(geladen, Date.now() - geladen.zuletztGesehen)
  return { state: geladen, offlineVerdienst }
}

// Autoclicker-Schutz: höchstens so viele gewertete Imperium-Taps pro Sekunde.
// Verhindert, dass ein Makro das Spiel kaputt-tappt — Tappen bleibt „nie nötig".
const MAX_TAPS_PRO_SEK = 10
let tapZeiten: number[] = []

export const useGame = create<GameStore>((set, get) => ({
  ...start(),
  kaufModus: 1,
  aktiveWelt: 'welt1',

  tickStore: (deltaMs) =>
    set((s) => {
      tick(s.state, deltaMs)
      return { state: { ...s.state } }
    }),

  kaufen: (id, menge) =>
    set((s) => {
      const b = BUSINESS_MAP[id]
      const rt = s.state.businesses[id]
      if (!b || !rt || menge < 1) return {} // unbekanntes/fehlendes Business → nichts tun
      if (!s.state.freigeschalteteWelten.includes(b.welt)) return {} // gesperrte Welt
      const { kaufRabatt } = eventEffekte(s.state)
      const kosten = kostenFuer(b, rt.anzahl, menge) * (1 - kaufRabatt)
      if (s.state.geld < kosten) return {}
      rt.anzahl += menge
      s.state.geld -= kosten
      return { state: { ...s.state } }
    }),

  managerKaufen: (id) =>
    set((s) => {
      const b = BUSINESS_MAP[id]
      const rt = s.state.businesses[id]
      const { kaufRabatt } = eventEffekte(s.state)
      const kosten = b.managerKosten * (1 - talentEffekte(s.state.talents).managerRabatt) * (1 - kaufRabatt)
      if (rt.hatManager || s.state.geld < kosten) return {}
      s.state.geld -= kosten
      rt.hatManager = true
      return { state: { ...s.state } }
    }),

  antippen: (id) =>
    set((s) => {
      const rt = s.state.businesses[id]
      if (rt.anzahl === 0 || rt.hatManager || rt.laeuft) return {}
      rt.laeuft = true
      s.state.gesamtKlicks = (s.state.gesamtKlicks ?? 0) + 1
      return { state: { ...s.state } }
    }),

  weltTippen: () => {
    const jetzt = Date.now()
    // Taps der letzten Sekunde zählen; über dem Deckel wird ignoriert (kein Ertrag, kein Klick).
    tapZeiten = tapZeiten.filter((t) => jetzt - t < 1000)
    if (tapZeiten.length >= MAX_TAPS_PRO_SEK) return 0
    const ertrag = weltTapErtrag(get().state)
    if (ertrag <= 0) return 0
    tapZeiten.push(jetzt)
    set((s) => {
      s.state.geld += ertrag
      s.state.gesamtVerdient += ertrag
      s.state.gesamtKlicks = (s.state.gesamtKlicks ?? 0) + 1
      return { state: { ...s.state } }
    })
    return ertrag
  },

  prestige: () =>
    set((s) => {
      if (!kannPrestige(s.state)) return {}
      const jetzt = Date.now()
      const rundeDauerMs = jetzt - (s.state.letzterPrestigeBeginnMs ?? jetzt)
      const neuerState = prestigeDurchfuehren(s.state)
      // Schnellste Runde tracken (nur wenn schon mind. 1 Prestige davor)
      if (s.state.prestigeCount >= 1) {
        const bisherBeste = s.state.schnellstePrestigeRundeMs ?? 0
        neuerState.schnellstePrestigeRundeMs = bisherBeste === 0 ? rundeDauerMs : Math.min(bisherBeste, rundeDauerMs)
      }
      neuerState.letzterPrestigeBeginnMs = jetzt
      return { state: neuerState, offlineVerdienst: 0, aktiveWelt: 'welt1' }
    }),

  ascension: () =>
    set((s) => {
      if (!kannAscension(s.state)) return {}
      const neuerState = ascensionDurchfuehren(s.state)
      return { state: neuerState, offlineVerdienst: 0, aktiveWelt: 'welt1' }
    }),

  talentKaufen: (id) =>
    set((s) => {
      if (!talentKaufbar(s.state, id)) return {}
      // Eine Stufe dazukaufen (feste Talente bleiben bei 1, Endlos-Talente steigen).
      const stufe = (s.state.talents[id] ?? 0) + 1
      s.state.talents = { ...s.state.talents, [id]: stufe }
      return { state: { ...s.state } }
    }),

  setKaufModus: (m) => set({ kaufModus: m }),

  erfolgAbholen: (id) =>
    set((s) => {
      const abgeholt = s.state.erfolgeAbgeholt ?? []
      // Nur abholen, wenn erreicht und noch nicht abgeholt.
      if (!s.state.erfolge.includes(id) || abgeholt.includes(id)) return {}
      s.state.erfolgeAbgeholt = [...abgeholt, id]
      return { state: { ...s.state } }
    }),

  alleErfolgeAbholen: () =>
    set((s) => {
      // Alle erreichten Erfolge auf einmal abholen (Belohnungen aktivieren).
      s.state.erfolgeAbgeholt = [...s.state.erfolge]
      return { state: { ...s.state } }
    }),

  autoKaufUmschalten: () =>
    set((s) => {
      s.state.autoKauf = !s.state.autoKauf
      return { state: { ...s.state } }
    }),

  setAktiveWelt: (id) => set({ aktiveWelt: id }),

  weltFreischalten: (id) =>
    set((s) => {
      const welt = WELT_MAP[id]
      if (!welt) return {}
      if (s.state.freigeschalteteWelten.includes(id)) return {} // schon frei
      const eff = talentEffekte(s.state.talents)
      const effektiveKosten = Math.round(welt.freischaltKosten * (1 - eff.weltRabatt))
      if (s.state.geld < effektiveKosten) return {} // noch nicht genug Geld
      s.state.geld -= effektiveKosten
      s.state.freigeschalteteWelten = [...s.state.freigeschalteteWelten, id]
      // Direkt in die neue Welt wechseln, damit man gleich loslegen kann.
      return { state: { ...s.state }, aktiveWelt: id }
    }),

  eventAktivieren: () =>
    set((s) => {
      const evId = s.state.wartendesEvent
      if (!evId) return {}
      const typ = EVENT_MAP[evId]
      if (!typ) return {}
      const jetzt = Date.now()
      s.state.wartendesEvent = null

      s.state.gesamtEventsAktiviert = (s.state.gesamtEventsAktiviert ?? 0) + 1

      if (typ.effekt === 'geldkoffer') {
        // Sofortige Einmalzahlung: 5 Minuten aktuelles Einkommen
        const bonus = einkommenProSekundeGesamt(s.state) * typ.faktor
        s.state.geld += bonus
        s.state.gesamtVerdient += bonus
        s.state.naechstesEventMs = jetzt + naechstesIntervall()
      } else {
        s.state.aktivesEvent = { typId: evId, laeuftBisMs: jetzt + typ.dauerMs }
      }
      return { state: { ...s.state } }
    }),

  streikAbwenden: () =>
    set((s) => {
      if (s.state.wartendesEvent !== 'managerStreik') return {}
      const kosten = Math.ceil(einkommenProSekundeGesamt(s.state) * 30)
      if (s.state.geld < kosten) return {}
      s.state.geld -= kosten
      s.state.wartendesEvent = null
      s.state.naechstesEventMs = Date.now() + naechstesIntervall()
      return { state: { ...s.state } }
    }),

  upgradeKaufen: (id) =>
    set((s) => {
      const u = UPGRADE_MAP[id]
      if (!u) return {}
      const bereits = s.state.gekaufteUpgrades ?? []
      if (bereits.includes(id)) return {} // schon gekauft
      if (s.state.geld < u.kosten) return {}
      s.state.geld -= u.kosten
      s.state.gekaufteUpgrades = [...bereits, id]
      return { state: { ...s.state } }
    }),

  spielstandExportieren: () => exportieren(get().state),

  spielstandImportieren: (text) => {
    const importiert = importieren(text)
    if (!importiert) return false // ungültiger Code — Spielstand bleibt unangetastet
    speichern(importiert)
    set({ state: importiert, offlineVerdienst: 0, kaufModus: 1, aktiveWelt: 'welt1' })
    return true
  },

  spielstandZuruecksetzen: () => {
    const frisch = neuerSpielstand()
    speichern(frisch)
    set({ state: frisch, offlineVerdienst: 0, kaufModus: 1, aktiveWelt: 'welt1' })
  },

  speichernJetzt: () => speichern(get().state),
  offlineQuittieren: () => set({ offlineVerdienst: 0 }),
}))

// Dev-Hilfe zum Debuggen im Browser (nur in der Entwicklung).
if (import.meta.env.DEV) {
  const w = window as unknown as Record<string, unknown>
  w.useGame = useGame
  w.neuerSpielstand = neuerSpielstand
}
