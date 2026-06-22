// Erfolge (Achievements): feste Ziele, die dauerhaft einen kleinen Einkommens-Bonus geben.
// Einmal erreicht, bleiben sie erreicht (in state.erfolge gespeichert) — auch über Prestige hinweg.
import type { GameState } from './types'
import { ASTE, BUSINESSES, TALENTE } from './config'

export interface ErfolgConfig {
  id: string
  name: string
  beschreibung: string
  /** Dauerhafter Einkommens-Bonus, gestaffelt nach Schwierigkeit (0,01 / 0,03 / 0,05). */
  bonus: number
  /** Ist der Erfolg mit diesem Spielstand erfüllt? */
  erfuellt: (state: GameState) => boolean
}

// Staffelung nach Schwierigkeit — leichte Ziele geben wenig, schwere viel.
const KLEIN = 0.01
const MITTEL = 0.03
const GROSS = 0.05

// --- kleine Helfer für die Bedingungen ---
const stueckGesamt = (s: GameState) => Object.values(s.businesses).reduce((sum, rt) => sum + rt.anzahl, 0)
const sorten = (s: GameState) => Object.values(s.businesses).filter((rt) => rt.anzahl >= 1).length
const managerAnzahl = (s: GameState) => Object.values(s.businesses).filter((rt) => rt.hatManager).length
const groessteAnzahl = (s: GameState) => Object.values(s.businesses).reduce((m, rt) => Math.max(m, rt.anzahl), 0)
const talenteAnzahl = (s: GameState) => Object.values(s.talents).filter((stufe) => stufe >= 1).length
const welt1Businesses = BUSINESSES.filter((b) => b.welt === 'welt1').map((b) => b.id)
const welt2Businesses = BUSINESSES.filter((b) => b.welt === 'welt2').map((b) => b.id)
const welt3Businesses = BUSINESSES.filter((b) => b.welt === 'welt3').map((b) => b.id)
const welt4Businesses = BUSINESSES.filter((b) => b.welt === 'welt4').map((b) => b.id)

/** Ist mindestens ein Talent-Ast mit allen festen Knoten komplett ausgebaut? */
function einAstKomplett(s: GameState): boolean {
  return ASTE.some((ast) => {
    const feste = TALENTE.filter((t) => t.ast === ast && !t.endlos)
    return feste.length > 0 && feste.every((t) => (s.talents[t.id] ?? 0) >= 1)
  })
}

export const ERFOLGE: ErfolgConfig[] = [
  // ── Geld-Meilensteine ────────────────────────────────────────────────────
  { id: 'geld1e6',    name: '💰 Erste Million',      beschreibung: '1 Mio. € insgesamt verdient',   bonus: KLEIN,  erfuellt: (s) => s.gesamtVerdient >= 1_000_000 },
  { id: 'geld1e9',    name: '💎 Milliardär',          beschreibung: '1 Mrd. € insgesamt verdient',   bonus: KLEIN,  erfuellt: (s) => s.gesamtVerdient >= 1_000_000_000 },
  { id: 'geld1e12',   name: '🌌 Billionär',           beschreibung: '1 Bio. € insgesamt verdient',   bonus: MITTEL, erfuellt: (s) => s.gesamtVerdient >= 1_000_000_000_000 },
  { id: 'geld1e15',   name: '🪐 Billiardär',          beschreibung: '1 Brd. € insgesamt verdient',   bonus: MITTEL, erfuellt: (s) => s.gesamtVerdient >= 1_000_000_000_000_000 },
  { id: 'geld1e18',   name: '🌠 Trillionär',          beschreibung: '1 Tri. € insgesamt verdient',   bonus: MITTEL, erfuellt: (s) => s.gesamtVerdient >= 1_000_000_000_000_000_000 },
  { id: 'geld1e21',   name: '🏛️ Trilliardär',         beschreibung: '1 Trd. € insgesamt verdient',   bonus: GROSS,  erfuellt: (s) => s.gesamtVerdient >= 1e21 },
  { id: 'geld1e24',   name: '🌌 Quadrillionär',       beschreibung: '1 Quart. € insgesamt verdient', bonus: GROSS,  erfuellt: (s) => s.gesamtVerdient >= 1e24 },

  // ── Welt 1 – Business-Mengen ─────────────────────────────────────────────
  { id: 'limo25',       name: '🥤 Durststrecke',      beschreibung: '25 Limonadenstände',                 bonus: KLEIN,  erfuellt: (s) => (s.businesses.limonade?.anzahl ?? 0) >= 25 },
  { id: 'zeitung25',    name: '📰 Schlagzeilen',      beschreibung: '25 Zeitungskioske',                  bonus: KLEIN,  erfuellt: (s) => (s.businesses.zeitung?.anzahl ?? 0) >= 25 },
  { id: 'pizza25',      name: '🍕 Franchise',         beschreibung: '25 Pizzerien',                       bonus: KLEIN,  erfuellt: (s) => (s.businesses.pizza?.anzahl ?? 0) >= 25 },
  { id: 'waesche25',    name: '🚗 Glanz & Gloria',    beschreibung: '25 Autowäschen',                     bonus: KLEIN,  erfuellt: (s) => (s.businesses.waesche?.anzahl ?? 0) >= 25 },
  { id: 'donut25',      name: '🍩 Süßer Erfolg',      beschreibung: '25 Donut-Cafés',                     bonus: KLEIN,  erfuellt: (s) => (s.businesses.donut?.anzahl ?? 0) >= 25 },
  { id: 'fitness25',    name: '💪 Eiserner Wille',    beschreibung: '25 Fitnessstudios',                  bonus: KLEIN,  erfuellt: (s) => (s.businesses.fitness?.anzahl ?? 0) >= 25 },
  { id: 'bank25',       name: '🏦 Bankenkrise',       beschreibung: '25 Banken',                          bonus: KLEIN,  erfuellt: (s) => (s.businesses.bank?.anzahl ?? 0) >= 25 },
  { id: 'immo25',       name: '🏢 Skyline',           beschreibung: '25 Immobilien',                      bonus: KLEIN,  erfuellt: (s) => (s.businesses.immobilien?.anzahl ?? 0) >= 25 },
  { id: 'welt1alle50',  name: '🌍 Vollbeschäftigung', beschreibung: 'Alle Welt-1-Businesses auf 50 Stück', bonus: MITTEL, erfuellt: (s) => welt1Businesses.every((id) => (s.businesses[id]?.anzahl ?? 0) >= 50) },

  // ── Welt 2 – Freischaltung & Ausbau ──────────────────────────────────────
  { id: 'welt2frei',    name: '🚀 Aufbruch',          beschreibung: 'Welt 2 freigeschaltet',              bonus: KLEIN,  erfuellt: (s) => s.freigeschalteteWelten.includes('welt2') },
  { id: 'welt2alle25',  name: '🛸 Raumfahrer',        beschreibung: 'Alle Welt-2-Businesses auf 25 Stück', bonus: MITTEL, erfuellt: (s) => welt2Businesses.every((id) => (s.businesses[id]?.anzahl ?? 0) >= 25) },

  // ── Welt 3 – Freischaltung & Ausbau ──────────────────────────────────────
  { id: 'welt3frei',    name: '🌐 Weltherrscher',     beschreibung: 'Welt 3 freigeschaltet',              bonus: MITTEL, erfuellt: (s) => s.freigeschalteteWelten.includes('welt3') },
  { id: 'welt3alle25',  name: '⚔️ Imperator',         beschreibung: 'Alle Welt-3-Businesses auf 25 Stück', bonus: MITTEL, erfuellt: (s) => welt3Businesses.every((id) => (s.businesses[id]?.anzahl ?? 0) >= 25) },

  // ── Welt 4 – Freischaltung & Ausbau ──────────────────────────────────────
  { id: 'welt4frei',    name: '🎩 Luxusleben',        beschreibung: 'Welt 4 freigeschaltet',              bonus: GROSS,  erfuellt: (s) => s.freigeschalteteWelten.includes('welt4') },
  { id: 'welt4alle25',  name: '💎 Diamant-Baron',     beschreibung: 'Alle Welt-4-Businesses auf 25 Stück', bonus: GROSS,  erfuellt: (s) => welt4Businesses.every((id) => (s.businesses[id]?.anzahl ?? 0) >= 25) },

  // ── Stückzahl-Rekorde ────────────────────────────────────────────────────
  { id: 'stueck100',   name: '🏭 Fließband',          beschreibung: '100 Stück bei einem Business',       bonus: KLEIN,  erfuellt: (s) => groessteAnzahl(s) >= 100 },
  { id: 'stueck200',   name: '🔩 Massenproduktion',   beschreibung: '200 Stück bei einem Business',       bonus: MITTEL, erfuellt: (s) => groessteAnzahl(s) >= 200 },
  { id: 'stueck500',   name: '👑 Vollausbau',          beschreibung: '500 Stück bei einem Business',       bonus: MITTEL, erfuellt: (s) => groessteAnzahl(s) >= 500 },
  { id: 'stueck1000',  name: '🌋 Unstoppbar',          beschreibung: '1.000 Stück bei einem Business',     bonus: GROSS,  erfuellt: (s) => groessteAnzahl(s) >= 1000 },
  { id: 'gesamt1k',    name: '📦 Großhändler',         beschreibung: '1.000 Stück insgesamt',              bonus: KLEIN,  erfuellt: (s) => stueckGesamt(s) >= 1000 },
  { id: 'gesamt5k',    name: '🏙️ Metropole',           beschreibung: '5.000 Stück insgesamt',              bonus: MITTEL, erfuellt: (s) => stueckGesamt(s) >= 5000 },
  { id: 'gesamt10k',   name: '🌍 Weltkonzern',         beschreibung: '10.000 Stück insgesamt',             bonus: GROSS,  erfuellt: (s) => stueckGesamt(s) >= 10_000 },

  // ── Prestige & Investoren ────────────────────────────────────────────────
  { id: 'prestige1',   name: '♻️ Neuanfang',           beschreibung: 'Zum ersten Mal Prestige',            bonus: KLEIN,  erfuellt: (s) => s.prestigeCount >= 1 },
  { id: 'prestige5',   name: '🔁 Veteran',             beschreibung: '5× Prestige',                        bonus: MITTEL, erfuellt: (s) => s.prestigeCount >= 5 },
  { id: 'prestige10',  name: '🔄 Routinier',           beschreibung: '10× Prestige',                       bonus: MITTEL, erfuellt: (s) => s.prestigeCount >= 10 },
  { id: 'prestige25',  name: '🌀 Meister des Kreises', beschreibung: '25× Prestige',                       bonus: GROSS,  erfuellt: (s) => s.prestigeCount >= 25 },
  { id: 'prestige50',  name: '⚡ Unaufhaltsam',        beschreibung: '50× Prestige',                       bonus: GROSS,  erfuellt: (s) => s.prestigeCount >= 50 },
  { id: 'inv1k',       name: '🤝 Investoren-Magnet',   beschreibung: '1.000 Investoren',                   bonus: MITTEL, erfuellt: (s) => s.investoren >= 1000 },
  { id: 'inv10k',      name: '📈 Börsengott',          beschreibung: '10.000 Investoren',                  bonus: GROSS,  erfuellt: (s) => s.investoren >= 10_000 },

  // ── Manager & Sorten ─────────────────────────────────────────────────────
  { id: 'mgrAlle',     name: '🧑‍💼 Delegierer',         beschreibung: 'Alle 8 Welt-1-Manager anstellen',   bonus: KLEIN,  erfuellt: (s) => managerAnzahl(s) >= BUSINESSES.filter((b) => b.welt === 'welt1').length },
  { id: 'sortenAlle',  name: '🏙️ Imperium',            beschreibung: 'Alle 8 Welt-1-Sorten besitzen',     bonus: KLEIN,  erfuellt: (s) => sorten(s) >= BUSINESSES.filter((b) => b.welt === 'welt1').length },

  // ── Talentbaum ───────────────────────────────────────────────────────────
  { id: 'talente5',    name: '🌱 Lernender',           beschreibung: '5 Talente gekauft',                  bonus: KLEIN,  erfuellt: (s) => talenteAnzahl(s) >= 5 },
  { id: 'talente10',   name: '🏆 Talentiert',          beschreibung: '10 Talente gekauft',                 bonus: MITTEL, erfuellt: (s) => talenteAnzahl(s) >= 10 },
  { id: 'astKomplett', name: '🌟 Ast-Meister',         beschreibung: 'Einen Talent-Ast komplett',          bonus: MITTEL, erfuellt: einAstKomplett },

  // ── Klick-Rekorde ────────────────────────────────────────────────────────
  { id: 'klick100',    name: '👆 Eifrige Finger',      beschreibung: '100 manuelle Tipps',                 bonus: KLEIN,  erfuellt: (s) => (s.gesamtKlicks ?? 0) >= 100 },
  { id: 'klick1k',     name: '✌️ Serientapper',        beschreibung: '1.000 manuelle Tipps',               bonus: MITTEL, erfuellt: (s) => (s.gesamtKlicks ?? 0) >= 1000 },
  { id: 'klick10k',    name: '🖐️ Tipp-Legende',        beschreibung: '10.000 manuelle Tipps',              bonus: GROSS,  erfuellt: (s) => (s.gesamtKlicks ?? 0) >= 10_000 },

  // ── Event-Erfolge ────────────────────────────────────────────────────────
  { id: 'event1',      name: '🌟 Erstmal Glück',       beschreibung: 'Erstes Glücks-Event aktiviert',      bonus: KLEIN,  erfuellt: (s) => (s.gesamtEventsAktiviert ?? 0) >= 1 },
  { id: 'event10',     name: '🎰 Glückspilz',          beschreibung: '10 Glücks-Events aktiviert',         bonus: MITTEL, erfuellt: (s) => (s.gesamtEventsAktiviert ?? 0) >= 10 },

  // ── Ascension & Diamanten ────────────────────────────────────────────────
  { id: 'ascension1',  name: '💎 Aufgestiegen',        beschreibung: 'Zum ersten Mal Ascension',           bonus: GROSS,  erfuellt: (s) => (s.ascensionCount ?? 0) >= 1 },
  { id: 'ascension5',  name: '✨ Wiedergeboren',        beschreibung: '5× Ascension',                       bonus: GROSS,  erfuellt: (s) => (s.ascensionCount ?? 0) >= 5 },
  { id: 'diamant10',   name: '💍 Diamantsammler',      beschreibung: '10 Diamanten besitzen',              bonus: GROSS,  erfuellt: (s) => (s.diamanten ?? 0) >= 10 },
  { id: 'diamant100',  name: '👑 Diamantkrone',        beschreibung: '100 Diamanten besitzen',             bonus: GROSS,  erfuellt: (s) => (s.diamanten ?? 0) >= 100 },
]

/** Schneller Zugriff auf einen Erfolg über die id (u.a. für die Bonus-Summe). */
export const ERFOLG_MAP: Record<string, ErfolgConfig> = Object.fromEntries(
  ERFOLGE.map((e) => [e.id, e]),
)

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

/** Einkommens-Faktor aus den ABGEHOLTEN Erfolgen (1 = keiner; je Erfolg sein gestaffelter Bonus). */
export function erfolgsFaktor(state: GameState): number {
  const abgeholt = state.erfolgeAbgeholt ?? []
  return 1 + abgeholt.reduce((sum, id) => sum + (ERFOLG_MAP[id]?.bonus ?? 0), 0)
}

/** Wie viele erreichte Erfolge noch zum Abholen bereitliegen (erreicht, aber Belohnung nicht aktiviert). */
export function anzahlAbholbar(state: GameState): number {
  const abgeholt = state.erfolgeAbgeholt ?? []
  return state.erfolge.filter((id) => !abgeholt.includes(id)).length
}
