// Logik rund um den Talentbaum: was ist kaufbar, welche Effekte hat man.
import type { GameState, TalentConfig } from './types'
import { TALENTE, TALENT_MAP } from './config'

/** Die gesammelten Auswirkungen aller gekauften Talente. */
export interface TalentEffekte {
  /** Faktor auf das gesamte Einkommen (1 = keine Änderung). */
  einkommensMultiplikator: number
  /** Faktor auf die Zyklusdauer (kleiner = schneller; 1 = normal). */
  zyklusFaktor: number
  /** Geld, mit dem man nach einem Prestige zusätzlich startet. */
  startkapital: number
  /** Rabatt auf Manager-Kosten (0,5 = 50 % günstiger). */
  managerRabatt: number
  /** Faktor auf den Investoren-Bonus (1,5 = Investoren wirken 50 % stärker). */
  investorVerstaerkung: number
  /** Maximal angerechnete Offline-Zeit in Millisekunden. */
  offlineDeckelMs: number
  /** Faktor auf das Offline-Einkommen. */
  offlineMultiplikator: number
  /** Rabatt auf Welt-Freischaltkosten (0,3 = 30 % günstiger). */
  weltRabatt: number
}

const STD_OFFLINE_DECKEL = 8 * 60 * 60 * 1000

export function talentGekauft(talents: Record<string, number>, id: string): boolean {
  return (talents[id] ?? 0) >= 1
}

/** Aktuelle Stufe eines Talents (0 = nicht gekauft; Endlos-Talente können höher gehen). */
export function talentStufe(talents: Record<string, number>, id: string): number {
  return talents[id] ?? 0
}

/** Kosten der nächsten Stufe. Endlos-Talente werden je gekaufter Stufe um 1 TP teurer. */
export function naechsteKosten(t: TalentConfig, talents: Record<string, number>): number {
  if (!t.endlos) return t.kosten
  return t.kosten + talentStufe(talents, t.id)
}

/** Summe der Talentpunkte, die bereits in Talente investiert wurden. */
export function ausgegebenePunkte(talents: Record<string, number>): number {
  let summe = 0
  for (const t of TALENTE) {
    const stufe = talentStufe(talents, t.id)
    if (stufe === 0) continue
    if (t.endlos) {
      // Stufenkosten sind kosten, kosten+1, … — also die Summe der ersten `stufe` Glieder.
      summe += stufe * t.kosten + (stufe * (stufe - 1)) / 2
    } else {
      summe += t.kosten
    }
  }
  return summe
}

/** Noch freie Talentpunkte = je verdient minus bereits ausgegeben. */
export function verfuegbareTalentpunkte(state: GameState): number {
  return state.talentpunkteVerdient - ausgegebenePunkte(state.talents)
}

/** Ist die Voraussetzung des Talents noch nicht erfüllt? */
export function talentGesperrt(talents: Record<string, number>, id: string): boolean {
  const t = TALENT_MAP[id]
  if (!t || !t.voraussetzung) return false
  return !talentGekauft(talents, t.voraussetzung)
}

/** Kann das Talent jetzt gekauft werden (Voraussetzung erfüllt, genug Punkte)? */
export function talentKaufbar(state: GameState, id: string): boolean {
  const t = TALENT_MAP[id]
  if (!t) return false
  // Feste Talente kann man nur einmal kaufen, Endlos-Talente beliebig oft.
  if (!t.endlos && talentGekauft(state.talents, id)) return false
  if (talentGesperrt(state.talents, id)) return false
  return verfuegbareTalentpunkte(state) >= naechsteKosten(t, state.talents)
}

/** Berechnet alle aktiven Talent-Effekte aus den gekauften Talenten. */
export function talentEffekte(talents: Record<string, number>): TalentEffekte {
  const hat = (id: string) => talentGekauft(talents, id)
  const stufe = (id: string) => talentStufe(talents, id)

  // Wirtschaft (feste Stufen). Der Tempo-Endlos-Knoten „Dauerschub" gibt +Ertrag,
  // was rechnerisch dasselbe ist wie +Einkommen — darum hier mit eingerechnet.
  let einkommen = 1
  if (hat('w1')) einkommen *= 1.25
  if (hat('w2')) einkommen *= 1.5
  if (hat('w3')) einkommen *= 2
  if (hat('w4')) einkommen *= 2
  if (hat('w5')) einkommen *= 3
  einkommen *= 1 + 0.1 * stufe('winf') // Wachstum endlos: +10 % je Stufe
  einkommen *= 1 + 0.05 * stufe('tempinf') // Dauerschub: +5 % Ertrag je Stufe

  // Tempo: Zyklusdauer-Faktor (kleiner = schneller), die höchste gekaufte Stufe gilt.
  const zyklusFaktor = hat('temp5')
    ? 0.3
    : hat('temp4')
      ? 0.4
      : hat('temp3')
        ? 0.5
        : hat('temp2')
          ? 0.7
          : hat('temp1')
            ? 0.85
            : 1

  // Kapital: Startkapital (k5 gilt), Investoren-Verstärkung (addiert sich), Welt-Rabatt (k1).
  const startkapital = hat('k5') ? 1_000_000 : 0
  const weltRabatt = hat('k1') ? 0.3 : 0
  let investorVerstaerkung = 1
  if (hat('k3')) investorVerstaerkung += 0.5
  if (hat('k4')) investorVerstaerkung += 1
  investorVerstaerkung += 0.03 * stufe('kinf') // Zinseszins: +3 % je Stufe

  // Offline: Deckel (höchste Stufe gilt), Einkommens-Faktor (×Basis, dann Nachtschicht).
  const offlineDeckelMs = hat('o4')
    ? 48 * 60 * 60 * 1000
    : hat('o2')
      ? 24 * 60 * 60 * 1000
      : hat('o1')
        ? 12 * 60 * 60 * 1000
        : STD_OFFLINE_DECKEL
  const offlineMultiplikator = (hat('o5') ? 3 : hat('o3') ? 2 : 1) * (1 + 0.1 * stufe('oinf'))

  return {
    einkommensMultiplikator: einkommen,
    zyklusFaktor,
    startkapital,
    managerRabatt: hat('k2') ? 0.5 : 0,
    investorVerstaerkung,
    offlineDeckelMs,
    offlineMultiplikator,
    weltRabatt,
  }
}
