// Der Store ist die Brücke zwischen Gehirn (Logik) und Hülle (Anzeige).
import { create } from 'zustand'
import type { GameState } from './game/types'
import { laden, neuerSpielstand, speichern } from './game/save'
import { applyOffline, tick } from './game/engine'
import { BUSINESS_MAP, WELT_MAP } from './game/config'
import { kostenFuer } from './game/economy'
import { kannPrestige, prestigeDurchfuehren } from './game/prestige'
import { talentEffekte, talentKaufbar } from './game/talents'

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
  prestige: () => void
  talentKaufen: (id: string) => void
  setKaufModus: (m: KaufModus) => void
  autoKaufUmschalten: () => void
  setAktiveWelt: (id: string) => void
  weltFreischalten: (id: string) => void
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
      if (menge < 1) return {}
      if (!s.state.freigeschalteteWelten.includes(b.welt)) return {} // gesperrte Welt
      const kosten = kostenFuer(b, rt.anzahl, menge)
      if (s.state.geld < kosten) return {}
      rt.anzahl += menge
      s.state.geld -= kosten
      return { state: { ...s.state } }
    }),

  managerKaufen: (id) =>
    set((s) => {
      const b = BUSINESS_MAP[id]
      const rt = s.state.businesses[id]
      const kosten = b.managerKosten * (1 - talentEffekte(s.state.talents).managerRabatt)
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
      return { state: { ...s.state } }
    }),

  prestige: () =>
    set((s) => {
      if (!kannPrestige(s.state)) return {}
      return { state: prestigeDurchfuehren(s.state), offlineVerdienst: 0 }
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
      if (s.state.geld < welt.freischaltKosten) return {} // noch nicht genug Geld
      s.state.geld -= welt.freischaltKosten
      s.state.freigeschalteteWelten = [...s.state.freigeschalteteWelten, id]
      // Direkt in die neue Welt wechseln, damit man gleich loslegen kann.
      return { state: { ...s.state }, aktiveWelt: id }
    }),

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
