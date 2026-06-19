// ALLE Spieldaten und Balance-Werte an einem Ort.
// Wenn das Spiel sich zu schnell oder zu langsam anfühlt, ändert man NUR hier die Zahlen.
import type { BusinessConfig, TalentConfig, WeltConfig } from './types'

/** Geld, mit dem man ins Spiel startet (reicht für die ersten Limonadenstände). */
export const START_GELD = 10

/** Bei diesen Stückzahlen verdoppelt sich der Ertrag eines Business (Meilenstein-Boni). */
export const MEILENSTEINE = [25, 50, 100, 200, 300, 400, 500]

/** Alle so viele Stück gibt's eine Tempo-Meilenstein-Stufe (schnellere Zyklen). */
export const TEMPO_MEILENSTEIN_INTERVALL = 25
/** Wie viel schneller pro Tempo-Meilenstein-Stufe (additiv gestapelt). */
export const TEMPO_MEILENSTEIN_BOOST = 0.03
/** Obergrenze für die Tempo-Meilenstein-Reduktion (max. 50 % kürzere Zyklen). */
export const TEMPO_MEILENSTEIN_MAX = 0.5

/** Maximal gutgeschriebene Offline-Zeit: 8 Stunden. */
export const OFFLINE_MAX_MS = 8 * 60 * 60 * 1000

/** Ab dieser (effektiven) Zyklusdauer wird der Fortschrittsbalken einfach voll gezeigt statt
 *  durchlaufend — angenehmer fürs Auge, sobald Zyklen im Sekundentakt oder schneller laufen. */
export const BALKEN_VOLL_AB_MS = 1000

/** Mindestverdienst in der aktuellen Runde, bevor Prestige freigeschaltet wird (Basis für Prestige 0→1). */
export const PRESTIGE_RUNDEN_BASIS = 1_000_000
/** Faktor, um den die Mindestschwelle mit jedem Prestige-Level wächst. */
export const PRESTIGE_RUNDEN_FAKTOR = 2.5

/**
 * Die Welten. Welt 1 ist von Anfang an frei; weitere Welten schaltet man mit Geld frei
 * (wie bei Taps to Riches — ansparen, kein bestimmtes Business-Level nötig) und bekommt
 * dafür einen dauerhaften globalen Einkommens-Bonus. So gibt es nie ein Plateau.
 * Freischalt-Preise und Boni hier zentral tunen.
 */
export const WELTEN: WeltConfig[] = [
  { id: 'welt1', name: 'Klassik',  emoji: '🌍', freischaltKosten: 0,                        bonus: 0    },
  { id: 'welt2', name: 'Zukunft',  emoji: '🚀', freischaltKosten: 800_000_000_000,             bonus: 0.5  },
  { id: 'welt3', name: 'Imperium', emoji: '🌐', freischaltKosten: 250_000_000_000_000_000_000, bonus: 0.75 },
]

/** Schneller Zugriff auf eine Welt über die id. */
export const WELT_MAP: Record<string, WeltConfig> = Object.fromEntries(
  WELTEN.map((w) => [w.id, w]),
)

/** Die Liste aller Businesses, aufsteigend vom günstigsten zum teuersten (Welt für Welt). */
export const BUSINESSES: BusinessConfig[] = [
  // --- Welt 1: Klassik ---
  { id: 'limonade',   welt: 'welt1', name: 'Limonadenstand', emoji: '🍋', basisKosten: 4,         kostenFaktor: 1.07, dauerMs: 1000,   basisErtrag: 1,        managerKosten: 1_000 },
  { id: 'zeitung',    welt: 'welt1', name: 'Zeitungskiosk',  emoji: '📰', basisKosten: 60,        kostenFaktor: 1.15, dauerMs: 3000,   basisErtrag: 60,       managerKosten: 15_000 },
  { id: 'waesche',    welt: 'welt1', name: 'Autowäsche',     emoji: '🚗', basisKosten: 720,       kostenFaktor: 1.14, dauerMs: 6000,   basisErtrag: 540,      managerKosten: 100_000 },
  { id: 'pizza',      welt: 'welt1', name: 'Pizzeria',       emoji: '🍕', basisKosten: 8_640,     kostenFaktor: 1.13, dauerMs: 12000,  basisErtrag: 4_320,    managerKosten: 500_000 },
  { id: 'donut',      welt: 'welt1', name: 'Donut-Café',     emoji: '🍩', basisKosten: 103_680,   kostenFaktor: 1.12, dauerMs: 24000,  basisErtrag: 51_840,   managerKosten: 1_200_000 },
  { id: 'fitness',    welt: 'welt1', name: 'Fitnessstudio',  emoji: '💪', basisKosten: 1_244_160, kostenFaktor: 1.11, dauerMs: 48000,  basisErtrag: 622_080,  managerKosten: 10_000_000 },
  { id: 'bank',       welt: 'welt1', name: 'Bank',           emoji: '🏦', basisKosten: 14_929_920,kostenFaktor: 1.10, dauerMs: 96000,  basisErtrag: 7_464_960,managerKosten: 100_000_000 },
  { id: 'immobilien', welt: 'welt1', name: 'Immobilien',     emoji: '🏢', basisKosten: 179_159_040,kostenFaktor: 1.10,dauerMs: 192000, basisErtrag: 89_579_520,managerKosten: 1_000_000_000 },

  // --- Welt 2: Zukunft & Weltraum (Kosten/Erträge ×5 ggü. ursprünglicher Planung → Progression dauert länger) ---
  { id: 'startup',   welt: 'welt2', name: 'Tech-Startup',      emoji: '💻', basisKosten: 10_750_000_000,        kostenFaktor: 1.10, dauerMs: 2000,   basisErtrag: 5_375_000_000,         managerKosten: 60_000_000_000 },
  { id: 'eauto',     welt: 'welt2', name: 'E-Auto-Werk',       emoji: '🔋', basisKosten: 129_000_000_000,       kostenFaktor: 1.10, dauerMs: 4000,   basisErtrag: 64_500_000_000,        managerKosten: 750_000_000_000 },
  { id: 'roboter',   welt: 'welt2', name: 'Roboterfabrik',     emoji: '🤖', basisKosten: 1_548_000_000_000,     kostenFaktor: 1.10, dauerMs: 8000,   basisErtrag: 774_000_000_000,       managerKosten: 9_000_000_000_000 },
  { id: 'ki',        welt: 'welt2', name: 'KI-Rechenzentrum',  emoji: '🧠', basisKosten: 18_575_000_000_000,    kostenFaktor: 1.10, dauerMs: 16000,  basisErtrag: 9_285_000_000_000,     managerKosten: 108_000_000_000_000 },
  { id: 'raumfahrt', welt: 'welt2', name: 'Raumfahrt-Firma',   emoji: '🚀', basisKosten: 222_900_000_000_000,   kostenFaktor: 1.10, dauerMs: 32000,  basisErtrag: 111_450_000_000_000,   managerKosten: 1_300_000_000_000_000 },
  { id: 'mond',      welt: 'welt2', name: 'Mond-Mine',         emoji: '🌙', basisKosten: 2_675_000_000_000_000, kostenFaktor: 1.10, dauerMs: 64000,  basisErtrag: 1_337_500_000_000_000, managerKosten: 15_500_000_000_000_000 },
  { id: 'mars',      welt: 'welt2', name: 'Mars-Kolonie',      emoji: '🔴', basisKosten: 32_100_000_000_000_000,kostenFaktor: 1.10, dauerMs: 128000, basisErtrag: 16_050_000_000_000_000,managerKosten: 185_000_000_000_000_000 },
  { id: 'orbital',   welt: 'welt2', name: 'Orbital-Stadt',     emoji: '🛰️', basisKosten: 385_000_000_000_000_000,kostenFaktor: 1.10,dauerMs: 192000, basisErtrag: 192_500_000_000_000_000,managerKosten: 2_220_000_000_000_000_000 },

  // --- Welt 3: Globales Imperium (Kurve setzt ab ~12× dem neuen Welt-2-Orbital fort; ×5 skaliert) ---
  { id: 'fluglinie',      welt: 'welt3', name: 'Fluglinie',       emoji: '✈️',  basisKosten: 4_600_000_000_000_000_000,           kostenFaktor: 1.10, dauerMs: 2000,   basisErtrag: 2_300_000_000_000_000_000,            managerKosten: 27_600_000_000_000_000_000 },
  { id: 'reederei',       welt: 'welt3', name: 'Reederei',        emoji: '🚢',  basisKosten: 55_000_000_000_000_000_000,          kostenFaktor: 1.10, dauerMs: 4000,   basisErtrag: 27_500_000_000_000_000_000,           managerKosten: 330_000_000_000_000_000_000 },
  { id: 'oelkonzern',     welt: 'welt3', name: 'Ölkonzern',       emoji: '🛢️',  basisKosten: 660_000_000_000_000_000_000,         kostenFaktor: 1.10, dauerMs: 8000,   basisErtrag: 330_000_000_000_000_000_000,          managerKosten: 3_960_000_000_000_000_000_000 },
  { id: 'stahlwerk',      welt: 'welt3', name: 'Stahlwerk',       emoji: '🏭',  basisKosten: 7_920_000_000_000_000_000_000,       kostenFaktor: 1.10, dauerMs: 16000,  basisErtrag: 3_960_000_000_000_000_000_000,        managerKosten: 47_520_000_000_000_000_000_000 },
  { id: 'techriese',      welt: 'welt3', name: 'Tech-Riese',      emoji: '📱',  basisKosten: 95_000_000_000_000_000_000_000,      kostenFaktor: 1.10, dauerMs: 32000,  basisErtrag: 47_500_000_000_000_000_000_000,       managerKosten: 570_000_000_000_000_000_000_000 },
  { id: 'medienimperium', welt: 'welt3', name: 'Medienimperium',  emoji: '🎬',  basisKosten: 1_140_000_000_000_000_000_000_000,   kostenFaktor: 1.10, dauerMs: 64000,  basisErtrag: 570_000_000_000_000_000_000_000,      managerKosten: 6_840_000_000_000_000_000_000_000 },
  { id: 'pharmakonzern',  welt: 'welt3', name: 'Pharmakonzern',   emoji: '💊',  basisKosten: 13_680_000_000_000_000_000_000_000,  kostenFaktor: 1.10, dauerMs: 128000, basisErtrag: 6_840_000_000_000_000_000_000_000,    managerKosten: 82_080_000_000_000_000_000_000_000 },
  { id: 'weltbank',       welt: 'welt3', name: 'Weltbank',        emoji: '🏛️',  basisKosten: 164_160_000_000_000_000_000_000_000, kostenFaktor: 1.10, dauerMs: 192000, basisErtrag: 82_080_000_000_000_000_000_000_000,   managerKosten: 984_960_000_000_000_000_000_000_000 },
]

/** Schneller Zugriff auf eine Business-Konfiguration über die id. */
export const BUSINESS_MAP: Record<string, BusinessConfig> = Object.fromEntries(
  BUSINESSES.map((b) => [b.id, b]),
)

// --- Prestige ---

/** Ab diesem Gesamtverdienst lohnt sich der erste Prestige (gibt die ersten Investoren). */
export const INVESTOR_BASIS = 1_000_000
/** Skalierung der Investoren-Formel (höher = mehr Investoren). */
export const INVESTOR_K = 10
/** Einkommens-Bonus pro Investor (0,02 = +2 %). */
export const INVESTOR_BONUS = 0.02
/**
 * Empfohlener Mindest-Zuwachs an Investoren pro Prestige (0,5 = +50 %), damit sich der
 * Neustart spürbar lohnt und man nicht durch zu frühes Prestigen stagniert.
 * Nur ein Hinweis im Prestige-Screen, KEINE Sperre. Auf 1,0 stellen = „verdoppeln".
 */
export const PRESTIGE_EMPFEHLUNG_FAKTOR = 0.5

/**
 * Ab dieser Prestige-Anzahl bekommt das jeweils nächste Business seinen Manager
 * automatisch nach jedem Neustart. Index 0 = 1. Business, Index 1 = 2. Business, …
 */
export const AUTO_MANAGER_SCHWELLEN = [2, 5, 10, 25, 50, 100, 200, 400]

/** Ab diesem Prestige-Level ist der Auto-Käufer verfügbar (kauft das günstigste Leistbare). */
export const AUTO_KAUFER_AB_PRESTIGE = 3

/** Rang-Titel nach Gesamtverdienst (aufsteigend; der erste gilt von Anfang an). */
export const RAENGE: { ab: number; titel: string }[] = [
  { ab: 0,                   titel: 'Tellerwäscher' },
  { ab: 1_000,               titel: 'Kleinunternehmer' },
  { ab: 100_000,             titel: 'Geschäftsmann' },
  { ab: 1_000_000,           titel: 'Millionär' },
  { ab: 100_000_000,         titel: 'Magnat' },
  { ab: 1_000_000_000,       titel: 'Tycoon' },
  { ab: 100_000_000_000,     titel: 'Industrie-Mogul' },
  { ab: 1_000_000_000_000,   titel: 'Wirtschaftstitan' },
  { ab: 100_000_000_000_000,       titel: 'Imperator' },
  { ab: 10_000_000_000_000_000,    titel: 'Weltmacht' },
  { ab: 1_000_000_000_000_000_000, titel: 'Globalimperium' },
  { ab: 100_000_000_000_000_000_000, titel: 'Weltenlenker' },
  { ab: 10_000_000_000_000_000_000_000, titel: 'Allherrscher' },
]

/** Einkommens-Bonus pro erreichtem Erfolg (0,02 = +2 %). */
export const ERFOLG_BONUS = 0.02

/** Die Talente des Talentbaums, gruppiert in fünf Ästen. */
export const ASTE = ['Wirtschaft', 'Tempo', 'Kapital', 'Offline', 'Meisterschaft'] as const

// Jeder Ast hat 5 feste Knoten (Kosten 1→2→3→4→5) und am Ende einen Endlos-Knoten,
// der beliebig oft kaufbar ist und je Stufe um 1 TP teurer wird (Start: 5 TP).
export const TALENTE: TalentConfig[] = [
  // Ast Wirtschaft — globaler Einkommens-Multiplikator
  { id: 'w1', ast: 'Wirtschaft', name: 'Wachstum I',   beschreibung: '+25 % Einkommen', kosten: 1, voraussetzung: null },
  { id: 'w2', ast: 'Wirtschaft', name: 'Wachstum II',  beschreibung: '+50 % Einkommen', kosten: 2, voraussetzung: 'w1' },
  { id: 'w3', ast: 'Wirtschaft', name: 'Wachstum III', beschreibung: '×2 Einkommen',    kosten: 3, voraussetzung: 'w2' },
  { id: 'w4', ast: 'Wirtschaft', name: 'Großkonzern',  beschreibung: '×2 Einkommen',    kosten: 4, voraussetzung: 'w3' },
  { id: 'w5', ast: 'Wirtschaft', name: 'Monopol',      beschreibung: '×3 Einkommen',    kosten: 5, voraussetzung: 'w4' },
  { id: 'winf', ast: 'Wirtschaft', name: 'Wachstum endlos', beschreibung: '+10 % Einkommen je Stufe', kosten: 5, voraussetzung: 'w5', endlos: true },
  // Ast Tempo — Produktionszyklen beschleunigen
  { id: 'temp1', ast: 'Tempo', name: 'Fließband I',  beschreibung: 'Zyklen 15 % schneller', kosten: 1, voraussetzung: null },
  { id: 'temp2', ast: 'Tempo', name: 'Fließband II', beschreibung: 'Zyklen 30 % schneller', kosten: 2, voraussetzung: 'temp1' },
  { id: 'temp3', ast: 'Tempo', name: 'Überschall',   beschreibung: 'Zyklen 50 % schneller', kosten: 3, voraussetzung: 'temp2' },
  { id: 'temp4', ast: 'Tempo', name: 'Hyperband',    beschreibung: 'Zyklen 60 % schneller', kosten: 4, voraussetzung: 'temp3' },
  { id: 'temp5', ast: 'Tempo', name: 'Lichttempo',   beschreibung: 'Zyklen 70 % schneller', kosten: 5, voraussetzung: 'temp4' },
  { id: 'tempinf', ast: 'Tempo', name: 'Dauerschub', beschreibung: '+5 % Ertrag je Stufe', kosten: 5, voraussetzung: 'temp5', endlos: true },
  // Ast Kapital — Reset-Boni und Komfort
  { id: 'k1', ast: 'Kapital', name: 'Welt-Rabatt',       beschreibung: 'Welten −30 % günstiger',   kosten: 1, voraussetzung: null },
  { id: 'k2', ast: 'Kapital', name: 'Manager-Rabatt',   beschreibung: 'Manager 50 % günstiger',   kosten: 2, voraussetzung: 'k1' },
  { id: 'k3', ast: 'Kapital', name: 'Investoren-Boost', beschreibung: 'Investoren wirken +50 %',  kosten: 3, voraussetzung: 'k2' },
  { id: 'k4', ast: 'Kapital', name: 'Fusion',           beschreibung: 'Investoren wirken +100 %', kosten: 4, voraussetzung: 'k3' },
  { id: 'k5', ast: 'Kapital', name: 'Börsengang',       beschreibung: 'Start mit 1 Mio. €',       kosten: 5, voraussetzung: 'k4' },
  { id: 'kinf', ast: 'Kapital', name: 'Zinseszins',     beschreibung: 'Investoren +3 % je Stufe', kosten: 5, voraussetzung: 'k5', endlos: true },
  // Ast Offline — Ertrag im Schlaf
  { id: 'o1', ast: 'Offline', name: 'Offline-Profi',  beschreibung: 'Offline-Deckel 12 h',      kosten: 1, voraussetzung: null },
  { id: 'o2', ast: 'Offline', name: 'Langschläfer',   beschreibung: 'Offline-Deckel 24 h',      kosten: 2, voraussetzung: 'o1' },
  { id: 'o3', ast: 'Offline', name: 'Traumrendite',   beschreibung: 'Offline-Einkommen ×2',     kosten: 3, voraussetzung: 'o2' },
  { id: 'o4', ast: 'Offline', name: 'Schichtbetrieb', beschreibung: 'Offline-Deckel 48 h',      kosten: 4, voraussetzung: 'o3' },
  { id: 'o5', ast: 'Offline', name: 'Vollautomatik',  beschreibung: 'Offline-Einkommen ×3',     kosten: 5, voraussetzung: 'o4' },
  { id: 'oinf', ast: 'Offline', name: 'Nachtschicht', beschreibung: '+10 % Offline je Stufe',   kosten: 5, voraussetzung: 'o5', endlos: true },
  // Ast Meisterschaft — Boni, die mit den Stückzahlen wachsen
  { id: 'm1', ast: 'Meisterschaft', name: 'Mengenmeister',     beschreibung: '+1 % Einkommen je 100 Stück',     kosten: 1, voraussetzung: null },
  { id: 'm2', ast: 'Meisterschaft', name: 'Spezialist',        beschreibung: '+10 % je Sorte mit Manager',      kosten: 2, voraussetzung: 'm1' },
  { id: 'm3', ast: 'Meisterschaft', name: 'Meilenstein-Profi', beschreibung: '+5 % je Ertrags-Meilenstein',     kosten: 3, voraussetzung: 'm2' },
  { id: 'm4', ast: 'Meisterschaft', name: 'Massenproduktion',  beschreibung: 'Mengenmeister wirkt doppelt',     kosten: 4, voraussetzung: 'm3' },
  { id: 'm5', ast: 'Meisterschaft', name: 'Imperium',          beschreibung: '+100 % bei 4+ Sorten à 100 Stück', kosten: 5, voraussetzung: 'm4' },
  { id: 'minf', ast: 'Meisterschaft', name: 'Meisterschaft endlos', beschreibung: '+0,5 % je 100 Stück je Stufe', kosten: 5, voraussetzung: 'm5', endlos: true },
]

/** Schneller Zugriff auf ein Talent über die id. */
export const TALENT_MAP: Record<string, TalentConfig> = Object.fromEntries(
  TALENTE.map((t) => [t.id, t]),
)
