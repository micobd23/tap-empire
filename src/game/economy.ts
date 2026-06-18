// Reine Rechen-Funktionen für Kosten und Einkommen. Keine Seiteneffekte.
import type { BusinessConfig, BusinessRuntime, GameState } from './types'
import {
  BUSINESSES,
  MEILENSTEINE,
  RAENGE,
  TEMPO_MEILENSTEIN_BOOST,
  TEMPO_MEILENSTEIN_INTERVALL,
  TEMPO_MEILENSTEIN_MAX,
} from './config'

/**
 * Kosten, um `menge` weitere Stück zu kaufen, wenn man schon `besitzt` Stück hat.
 * (Geometrische Reihe — jeder Kauf ist um den kostenFaktor teurer.)
 */
export function kostenFuer(b: BusinessConfig, besitzt: number, menge = 1): number {
  const r = b.kostenFaktor
  return (b.basisKosten * Math.pow(r, besitzt) * (Math.pow(r, menge) - 1)) / (r - 1)
}

/** Wie viele Stück man sich mit `geld` höchstens leisten kann. */
export function maxKaufbar(b: BusinessConfig, besitzt: number, geld: number): number {
  const r = b.kostenFaktor
  const erstes = b.basisKosten * Math.pow(r, besitzt)
  if (geld < erstes) return 0
  const menge = Math.log((geld * (r - 1)) / erstes + 1) / Math.log(r)
  return Math.floor(menge)
}

/** Meilenstein-Multiplikator: pro erreichtem Meilenstein verdoppelt sich der Ertrag. */
export function meilensteinMultiplikator(anzahl: number): number {
  let m = 1
  for (const schwelle of MEILENSTEINE) {
    if (anzahl >= schwelle) m *= 2
  }
  return m
}

/** Nächste Meilenstein-Schwelle über der aktuellen Anzahl (oder null, wenn alle erreicht). */
export function naechsterMeilenstein(anzahl: number): number | null {
  for (const schwelle of MEILENSTEINE) {
    if (anzahl < schwelle) return schwelle
  }
  return null
}

/**
 * Bonus-Faktor des Meisterschafts-Asts (Talente m1–m5 + minf). Wächst mit den Stückzahlen,
 * den Sorten und den erreichten Meilensteinen. Liefert 1, wenn kein solches Talent gekauft ist.
 */
export function meisterschaftsFaktor(state: GameState): number {
  const stufe = (id: string) => state.talents[id] ?? 0
  const werte = Object.values(state.businesses)
  const gesamtStueck = werte.reduce((s, rt) => s + rt.anzahl, 0)

  let bonus = 0

  // m1 Mengenmeister: +1 % je 100 Stück; m4 Massenproduktion verdoppelt das auf +2 %.
  if (stufe('m1') >= 1) {
    const proHundert = stufe('m4') >= 1 ? 0.02 : 0.01
    bonus += Math.floor(gesamtStueck / 100) * proHundert
  }

  // m2 Spezialist: +10 % je Business-Sorte mit Manager.
  if (stufe('m2') >= 1) {
    bonus += werte.filter((rt) => rt.hatManager).length * 0.1
  }

  // m3 Meilenstein-Profi: +5 % je erreichtem Ertrags-Meilenstein (über alle Businesses).
  if (stufe('m3') >= 1) {
    let meilensteine = 0
    for (const rt of werte) {
      for (const schwelle of MEILENSTEINE) {
        if (rt.anzahl >= schwelle) meilensteine++
      }
    }
    bonus += meilensteine * 0.05
  }

  // m5 Imperium: +100 %, sobald mindestens 4 Sorten je 100+ Stück haben.
  if (stufe('m5') >= 1 && werte.filter((rt) => rt.anzahl >= 100).length >= 4) {
    bonus += 1
  }

  // minf Meisterschaft endlos: +0,5 % je 100 Stück, je Stufe.
  const mInf = stufe('minf')
  if (mInf > 0) bonus += Math.floor(gesamtStueck / 100) * 0.005 * mInf

  return 1 + bonus
}

/** Faktor auf die Zyklusdauer durch Tempo-Meilensteine (kleiner = schneller, 1 = kein Bonus). */
export function tempoMeilensteinFaktor(anzahl: number): number {
  const stufen = Math.floor(anzahl / TEMPO_MEILENSTEIN_INTERVALL)
  const reduktion = Math.min(stufen * TEMPO_MEILENSTEIN_BOOST, TEMPO_MEILENSTEIN_MAX)
  return 1 - reduktion
}

/** Nächste Tempo-Meilenstein-Schwelle über der aktuellen Anzahl (oder null, wenn der Cap erreicht ist). */
export function naechsteTempoMeilenstein(anzahl: number): number | null {
  const maxStufen = Math.ceil(TEMPO_MEILENSTEIN_MAX / TEMPO_MEILENSTEIN_BOOST)
  const naechsteStufe = Math.floor(anzahl / TEMPO_MEILENSTEIN_INTERVALL) + 1
  if (naechsteStufe > maxStufen) return null
  return naechsteStufe * TEMPO_MEILENSTEIN_INTERVALL
}

/** Ertrag einer einzelnen Auszahlung (ein Zyklus) bei gegebener Stückzahl. */
export function ertragProZyklus(b: BusinessConfig, anzahl: number): number {
  return anzahl * b.basisErtrag * meilensteinMultiplikator(anzahl)
}

/**
 * Dauerhaftes Einkommen pro Sekunde — nur Businesses mit Manager laufen von selbst.
 * `zyklusFaktor` < 1 (aus Tempo-Talenten) macht die Zyklen kürzer = mehr pro Sekunde.
 */
export function einkommenProSekundeAuto(
  b: BusinessConfig,
  rt: BusinessRuntime,
  zyklusFaktor = 1,
): number {
  if (rt.anzahl === 0 || !rt.hatManager) return 0
  const dauer = b.dauerMs * zyklusFaktor * tempoMeilensteinFaktor(rt.anzahl)
  return ertragProZyklus(b, rt.anzahl) / (dauer / 1000)
}

/** Gesamtes automatisches Einkommen pro Sekunde (für den Header), inkl. Multiplikator & Tempo. */
export function gesamtEinkommenProSekunde(
  state: GameState,
  multiplikator = 1,
  zyklusFaktor = 1,
): number {
  let summe = 0
  for (const b of BUSINESSES) {
    const rt = state.businesses[b.id]
    if (rt) summe += einkommenProSekundeAuto(b, rt, zyklusFaktor)
  }
  return summe * multiplikator
}

/** Aktueller Rang-Titel (und ab welchem Gesamtverdienst der nächste kommt; null = höchster Rang). */
export function aktuellerRang(gesamtVerdient: number): { titel: string; naechsterAb: number | null } {
  let titel = RAENGE[0].titel
  let naechsterAb: number | null = RAENGE.length > 1 ? RAENGE[1].ab : null
  for (let i = 0; i < RAENGE.length; i++) {
    if (gesamtVerdient >= RAENGE[i].ab) {
      titel = RAENGE[i].titel
      naechsterAb = i + 1 < RAENGE.length ? RAENGE[i + 1].ab : null
    } else {
      break
    }
  }
  return { titel, naechsterAb }
}

/** Günstigstes Business, dessen nächstes Stück gerade leistbar ist (für den Auto-Käufer). */
export function guenstigstesLeistbares(state: GameState): BusinessConfig | null {
  let bestes: BusinessConfig | null = null
  let besterPreis = Infinity
  for (const b of BUSINESSES) {
    const rt = state.businesses[b.id]
    const preis = kostenFuer(b, rt ? rt.anzahl : 0, 1)
    if (preis <= state.geld && preis < besterPreis) {
      besterPreis = preis
      bestes = b
    }
  }
  return bestes
}
