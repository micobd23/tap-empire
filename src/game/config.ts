// ALLE Spieldaten und Balance-Werte an einem Ort.
// Wenn das Spiel sich zu schnell oder zu langsam anfühlt, ändert man NUR hier die Zahlen.
import type { BusinessConfig, TalentConfig, UpgradeConfig, WeltConfig } from './types'

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
export const PRESTIGE_RUNDEN_BASIS = 100_000_000
/** Faktor, um den die Mindestschwelle mit jedem Prestige-Level wächst (steil = unproportional). */
export const PRESTIGE_RUNDEN_FAKTOR = 5

/**
 * Die Welten. Welt 1 ist von Anfang an frei; weitere Welten schaltet man mit Geld frei
 * (wie bei Taps to Riches — ansparen, kein bestimmtes Business-Level nötig) und bekommt
 * dafür einen dauerhaften globalen Einkommens-Bonus. So gibt es nie ein Plateau.
 * Freischalt-Preise und Boni hier zentral tunen.
 */
export const WELTEN: WeltConfig[] = [
  { id: 'welt1', name: 'Klassik',  emoji: '🌍', freischaltKosten: 0,                        bonus: 0,    farbe: '#34d399', farbeTint: '#a7f3d0' },
  { id: 'welt2', name: 'Zukunft',  emoji: '🚀', freischaltKosten: 800_000_000_000,             bonus: 0.5,  farbe: '#22d3ee', farbeTint: '#a5f3fc' },
  { id: 'welt3', name: 'Imperium', emoji: '🌐', freischaltKosten: 250_000_000_000_000_000_000, bonus: 0.75, farbe: '#e879f9', farbeTint: '#f5d0fe' },
  { id: 'welt4', name: 'Luxus',    emoji: '🎩', freischaltKosten: 100_000_000_000_000_000_000_000_000_000, bonus: 1.0, farbe: '#fbbf24', farbeTint: '#fde68a' },
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

  // --- Welt 4: Luxus & Unterhaltung (erste Business ~12× Weltbank; Quint./Sext.-Bereich) ---
  { id: 'casino',       welt: 'welt4', name: 'Casino',               emoji: '🎰', basisKosten: 2_000_000_000_000_000_000_000_000_000,            kostenFaktor: 1.10, dauerMs: 2000,   basisErtrag: 1_000_000_000_000_000_000_000_000_000,             managerKosten: 12_000_000_000_000_000_000_000_000_000 },
  { id: 'filmstudio',   welt: 'welt4', name: 'Filmstudio',           emoji: '🎬', basisKosten: 24_000_000_000_000_000_000_000_000_000,            kostenFaktor: 1.10, dauerMs: 4000,   basisErtrag: 12_000_000_000_000_000_000_000_000_000,            managerKosten: 144_000_000_000_000_000_000_000_000_000 },
  { id: 'fussballklub', welt: 'welt4', name: 'Fußballklub',          emoji: '⚽', basisKosten: 288_000_000_000_000_000_000_000_000_000,           kostenFaktor: 1.10, dauerMs: 8000,   basisErtrag: 144_000_000_000_000_000_000_000_000_000,           managerKosten: 1_728_000_000_000_000_000_000_000_000_000 },
  { id: 'formel1',      welt: 'welt4', name: 'Formel-1-Team',        emoji: '🏎️', basisKosten: 3_456_000_000_000_000_000_000_000_000_000,         kostenFaktor: 1.10, dauerMs: 16000,  basisErtrag: 1_728_000_000_000_000_000_000_000_000_000,         managerKosten: 20_736_000_000_000_000_000_000_000_000_000 },
  { id: 'raumtourismus',welt: 'welt4', name: 'Raumfahrt-Tourismus',  emoji: '🛸', basisKosten: 41_472_000_000_000_000_000_000_000_000_000,        kostenFaktor: 1.10, dauerMs: 32000,  basisErtrag: 20_736_000_000_000_000_000_000_000_000_000,        managerKosten: 248_832_000_000_000_000_000_000_000_000_000 },
  { id: 'privatinsel',  welt: 'welt4', name: 'Privatinsel',          emoji: '🏝️', basisKosten: 497_664_000_000_000_000_000_000_000_000_000,       kostenFaktor: 1.10, dauerMs: 64000,  basisErtrag: 248_832_000_000_000_000_000_000_000_000_000,       managerKosten: 2_985_984_000_000_000_000_000_000_000_000_000 },
  { id: 'diamanten',    welt: 'welt4', name: 'Diamanten-Konzern',    emoji: '💎', basisKosten: 5_971_968_000_000_000_000_000_000_000_000_000,      kostenFaktor: 1.10, dauerMs: 128000, basisErtrag: 2_985_984_000_000_000_000_000_000_000_000_000,      managerKosten: 35_831_808_000_000_000_000_000_000_000_000_000 },
  { id: 'luxusimperium',welt: 'welt4', name: 'Luxus-Imperium',       emoji: '🎩', basisKosten: 71_663_616_000_000_000_000_000_000_000_000_000,     kostenFaktor: 1.10, dauerMs: 192000, basisErtrag: 35_831_808_000_000_000_000_000_000_000_000_000,     managerKosten: 429_981_696_000_000_000_000_000_000_000_000_000 },
]

/** Schneller Zugriff auf eine Business-Konfiguration über die id. */
export const BUSINESS_MAP: Record<string, BusinessConfig> = Object.fromEntries(
  BUSINESSES.map((b) => [b.id, b]),
)

// --- Prestige ---

/** Ab diesem Gesamtverdienst lohnt sich der erste Prestige (gibt die ersten Investoren). */
export const INVESTOR_BASIS = 1_000_000
/** Skalierung der Investoren-Formel (höher = mehr Investoren). */
export const INVESTOR_K = 30
/** Einkommens-Bonus pro Investor (0,01 = +1 %). */
export const INVESTOR_BONUS = 0.01
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

// --- Ascension (Meta-Prestige, zweite Reset-Ebene) ---

/** Ab diesem Lebensverdienst ist die erste Ascension möglich (tiefes Endgame). */
export const ASCENSION_BASIS = 1e24
/** Skalierung der Diamanten-Formel (höher = mehr Diamanten). */
export const ASCENSION_K = 10
/** Wurzel-Exponent der Diamanten-Formel (kleiner = flacher = mehr Grind je Diamant). */
export const ASCENSION_EXP = 0.2
/** Dauerhafter Einkommens-Bonus pro Diamant (0,10 = +10 %). Überlebt ALLES, auch Ascension. */
export const DIAMANT_BONUS = 0.1

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
  { ab: 10_000_000_000_000_000_000_000,       titel: 'Allherrscher' },
  { ab: 1_000_000_000_000_000_000_000_000_000, titel: 'Luxusbaron' },
  { ab: 1_000_000_000_000_000_000_000_000_000_000, titel: 'Goldfürst' },
  { ab: 1_000_000_000_000_000_000_000_000_000_000_000, titel: 'Diamantkaiser' },
]

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
  { id: 'temp1', ast: 'Tempo', name: 'Fließband I',  beschreibung: 'Zyklen 20 % schneller', kosten: 1, voraussetzung: null },
  { id: 'temp2', ast: 'Tempo', name: 'Fließband II', beschreibung: 'Zyklen 40 % schneller', kosten: 2, voraussetzung: 'temp1' },
  { id: 'temp3', ast: 'Tempo', name: 'Überschall',   beschreibung: 'Zyklen 60 % schneller', kosten: 3, voraussetzung: 'temp2' },
  { id: 'temp4', ast: 'Tempo', name: 'Hyperband',    beschreibung: 'Zyklen 75 % schneller', kosten: 4, voraussetzung: 'temp3' },
  { id: 'temp5', ast: 'Tempo', name: 'Lichttempo',   beschreibung: 'Zyklen 90 % schneller', kosten: 5, voraussetzung: 'temp4' },
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

/**
 * Käufliche Upgrades pro Business (3 Stück je Business, dauerhaft — überleben Prestige).
 * Upgrade 1: ×2 Ertrag  |  Upgrade 2: ×2 Speed (halbe Zykluszeit)  |  Upgrade 3: ×3 Ertrag
 * Kosten: grob ~10× / ~100× / ~1000× der Manager-Kosten.
 */
export const UPGRADES: UpgradeConfig[] = [
  // --- Welt 1: Klassik ---
  { id: 'limonade_u1', businessId: 'limonade', name: 'Zitronenpresse',   beschreibung: '×2 Ertrag',            kosten: 10_000,          effekt: 'ertrag', faktor: 2 },
  { id: 'limonade_u2', businessId: 'limonade', name: 'Lieferwagen',      beschreibung: '×2 schnellere Zyklen', kosten: 100_000,         effekt: 'tempo',  faktor: 2 },
  { id: 'limonade_u3', businessId: 'limonade', name: 'Geheimrezept',     beschreibung: '×3 Ertrag',            kosten: 1_000_000,       effekt: 'ertrag', faktor: 3 },

  { id: 'zeitung_u1',  businessId: 'zeitung',  name: 'Druckmaschine',    beschreibung: '×2 Ertrag',            kosten: 150_000,         effekt: 'ertrag', faktor: 2 },
  { id: 'zeitung_u2',  businessId: 'zeitung',  name: 'Fahrradbote',      beschreibung: '×2 schnellere Zyklen', kosten: 1_500_000,       effekt: 'tempo',  faktor: 2 },
  { id: 'zeitung_u3',  businessId: 'zeitung',  name: 'Digitalabo',       beschreibung: '×3 Ertrag',            kosten: 15_000_000,      effekt: 'ertrag', faktor: 3 },

  { id: 'waesche_u1',  businessId: 'waesche',  name: 'Hochdruckreiniger',beschreibung: '×2 Ertrag',            kosten: 1_000_000,       effekt: 'ertrag', faktor: 2 },
  { id: 'waesche_u2',  businessId: 'waesche',  name: 'Förderbahn',       beschreibung: '×2 schnellere Zyklen', kosten: 10_000_000,      effekt: 'tempo',  faktor: 2 },
  { id: 'waesche_u3',  businessId: 'waesche',  name: 'Vollautomatik',    beschreibung: '×3 Ertrag',            kosten: 100_000_000,     effekt: 'ertrag', faktor: 3 },

  { id: 'pizza_u1',    businessId: 'pizza',    name: 'Spezialsoße',      beschreibung: '×2 Ertrag',            kosten: 5_000_000,       effekt: 'ertrag', faktor: 2 },
  { id: 'pizza_u2',    businessId: 'pizza',    name: 'Lieferservice',    beschreibung: '×2 schnellere Zyklen', kosten: 50_000_000,      effekt: 'tempo',  faktor: 2 },
  { id: 'pizza_u3',    businessId: 'pizza',    name: 'Holzofen',         beschreibung: '×3 Ertrag',            kosten: 500_000_000,     effekt: 'ertrag', faktor: 3 },

  { id: 'donut_u1',    businessId: 'donut',    name: 'Zuckerglasur',     beschreibung: '×2 Ertrag',            kosten: 12_000_000,      effekt: 'ertrag', faktor: 2 },
  { id: 'donut_u2',    businessId: 'donut',    name: 'Backstraße',       beschreibung: '×2 schnellere Zyklen', kosten: 120_000_000,     effekt: 'tempo',  faktor: 2 },
  { id: 'donut_u3',    businessId: 'donut',    name: 'Franchisevertrag', beschreibung: '×3 Ertrag',            kosten: 1_200_000_000,   effekt: 'ertrag', faktor: 3 },

  { id: 'fitness_u1',  businessId: 'fitness',  name: 'Premiumgeräte',    beschreibung: '×2 Ertrag',            kosten: 100_000_000,     effekt: 'ertrag', faktor: 2 },
  { id: 'fitness_u2',  businessId: 'fitness',  name: '24h-Betrieb',      beschreibung: '×2 schnellere Zyklen', kosten: 1_000_000_000,   effekt: 'tempo',  faktor: 2 },
  { id: 'fitness_u3',  businessId: 'fitness',  name: 'Wellness-Spa',     beschreibung: '×3 Ertrag',            kosten: 10_000_000_000,  effekt: 'ertrag', faktor: 3 },

  { id: 'bank_u1',     businessId: 'bank',     name: 'Online-Banking',   beschreibung: '×2 Ertrag',            kosten: 1_000_000_000,   effekt: 'ertrag', faktor: 2 },
  { id: 'bank_u2',     businessId: 'bank',     name: 'Expresschalter',   beschreibung: '×2 schnellere Zyklen', kosten: 10_000_000_000,  effekt: 'tempo',  faktor: 2 },
  { id: 'bank_u3',     businessId: 'bank',     name: 'Kreditkarten',     beschreibung: '×3 Ertrag',            kosten: 100_000_000_000, effekt: 'ertrag', faktor: 3 },

  { id: 'immobilien_u1', businessId: 'immobilien', name: 'Luxussanierung',  beschreibung: '×2 Ertrag',            kosten: 10_000_000_000,   effekt: 'ertrag', faktor: 2 },
  { id: 'immobilien_u2', businessId: 'immobilien', name: 'Hausverwalter',   beschreibung: '×2 schnellere Zyklen', kosten: 100_000_000_000,  effekt: 'tempo',  faktor: 2 },
  { id: 'immobilien_u3', businessId: 'immobilien', name: 'Immobilienfonds', beschreibung: '×3 Ertrag',            kosten: 1_000_000_000_000,effekt: 'ertrag', faktor: 3 },

  // --- Welt 2: Zukunft & Weltraum ---
  { id: 'startup_u1',   businessId: 'startup',   name: 'Series-A-Funding', beschreibung: '×2 Ertrag',            kosten: 600_000_000_000,            effekt: 'ertrag', faktor: 2 },
  { id: 'startup_u2',   businessId: 'startup',   name: 'Agile-Sprint',     beschreibung: '×2 schnellere Zyklen', kosten: 6_000_000_000_000,          effekt: 'tempo',  faktor: 2 },
  { id: 'startup_u3',   businessId: 'startup',   name: 'Börsengang',       beschreibung: '×3 Ertrag',            kosten: 60_000_000_000_000,         effekt: 'ertrag', faktor: 3 },

  { id: 'eauto_u1',     businessId: 'eauto',     name: 'Gigafabrik',       beschreibung: '×2 Ertrag',            kosten: 7_500_000_000_000,          effekt: 'ertrag', faktor: 2 },
  { id: 'eauto_u2',     businessId: 'eauto',     name: 'Roboterstraße',    beschreibung: '×2 schnellere Zyklen', kosten: 75_000_000_000_000,         effekt: 'tempo',  faktor: 2 },
  { id: 'eauto_u3',     businessId: 'eauto',     name: 'Supercharger-Netz',beschreibung: '×3 Ertrag',            kosten: 750_000_000_000_000,        effekt: 'ertrag', faktor: 3 },

  { id: 'roboter_u1',   businessId: 'roboter',   name: 'KI-Steuerung',     beschreibung: '×2 Ertrag',            kosten: 90_000_000_000_000,         effekt: 'ertrag', faktor: 2 },
  { id: 'roboter_u2',   businessId: 'roboter',   name: 'Nanomotoren',      beschreibung: '×2 schnellere Zyklen', kosten: 900_000_000_000_000,        effekt: 'tempo',  faktor: 2 },
  { id: 'roboter_u3',   businessId: 'roboter',   name: 'Selbst-Replikation',beschreibung: '×3 Ertrag',           kosten: 9_000_000_000_000_000,      effekt: 'ertrag', faktor: 3 },

  { id: 'ki_u1',        businessId: 'ki',        name: 'Quantenchips',     beschreibung: '×2 Ertrag',            kosten: 1_080_000_000_000_000,      effekt: 'ertrag', faktor: 2 },
  { id: 'ki_u2',        businessId: 'ki',        name: 'Glasfasernetz',    beschreibung: '×2 schnellere Zyklen', kosten: 10_800_000_000_000_000,     effekt: 'tempo',  faktor: 2 },
  { id: 'ki_u3',        businessId: 'ki',        name: 'AGI-Modul',        beschreibung: '×3 Ertrag',            kosten: 108_000_000_000_000_000,    effekt: 'ertrag', faktor: 3 },

  { id: 'raumfahrt_u1', businessId: 'raumfahrt', name: 'Wiederverwendung', beschreibung: '×2 Ertrag',            kosten: 13_000_000_000_000_000,     effekt: 'ertrag', faktor: 2 },
  { id: 'raumfahrt_u2', businessId: 'raumfahrt', name: 'Ionenantrieb',     beschreibung: '×2 schnellere Zyklen', kosten: 130_000_000_000_000_000,    effekt: 'tempo',  faktor: 2 },
  { id: 'raumfahrt_u3', businessId: 'raumfahrt', name: 'Warpkern',         beschreibung: '×3 Ertrag',            kosten: 1_300_000_000_000_000_000,  effekt: 'ertrag', faktor: 3 },

  { id: 'mond_u1',      businessId: 'mond',      name: 'Schmelzofen',      beschreibung: '×2 Ertrag',            kosten: 155_000_000_000_000_000,    effekt: 'ertrag', faktor: 2 },
  { id: 'mond_u2',      businessId: 'mond',      name: 'Schwerkraftpumpe', beschreibung: '×2 schnellere Zyklen', kosten: 1_550_000_000_000_000_000,  effekt: 'tempo',  faktor: 2 },
  { id: 'mond_u3',      businessId: 'mond',      name: 'Helium-3-Reaktor', beschreibung: '×3 Ertrag',            kosten: 15_500_000_000_000_000_000, effekt: 'ertrag', faktor: 3 },

  { id: 'mars_u1',      businessId: 'mars',      name: 'Terraforming',     beschreibung: '×2 Ertrag',            kosten: 1_850_000_000_000_000_000,  effekt: 'ertrag', faktor: 2 },
  { id: 'mars_u2',      businessId: 'mars',      name: 'Hyperloop-Tunnel', beschreibung: '×2 schnellere Zyklen', kosten: 18_500_000_000_000_000_000, effekt: 'tempo',  faktor: 2 },
  { id: 'mars_u3',      businessId: 'mars',      name: 'Marsstaat',        beschreibung: '×3 Ertrag',            kosten: 185_000_000_000_000_000_000,effekt: 'ertrag', faktor: 3 },

  { id: 'orbital_u1',   businessId: 'orbital',   name: 'Solarsegel',       beschreibung: '×2 Ertrag',            kosten: 22_200_000_000_000_000_000, effekt: 'ertrag', faktor: 2 },
  { id: 'orbital_u2',   businessId: 'orbital',   name: 'Weltraumaufzug',   beschreibung: '×2 schnellere Zyklen', kosten: 222_000_000_000_000_000_000,effekt: 'tempo',  faktor: 2 },
  { id: 'orbital_u3',   businessId: 'orbital',   name: 'Dyson-Ring',       beschreibung: '×3 Ertrag',            kosten: 2_220_000_000_000_000_000_000,effekt: 'ertrag',faktor: 3 },

  // --- Welt 3: Globales Imperium ---
  { id: 'fluglinie_u1',      businessId: 'fluglinie',      name: 'Business-Class',    beschreibung: '×2 Ertrag',            kosten: 276_000_000_000_000_000_000,      effekt: 'ertrag', faktor: 2 },
  { id: 'fluglinie_u2',      businessId: 'fluglinie',      name: 'Direktrouten',      beschreibung: '×2 schnellere Zyklen', kosten: 2_760_000_000_000_000_000_000,    effekt: 'tempo',  faktor: 2 },
  { id: 'fluglinie_u3',      businessId: 'fluglinie',      name: 'Überschalljet',     beschreibung: '×3 Ertrag',            kosten: 27_600_000_000_000_000_000_000,   effekt: 'ertrag', faktor: 3 },

  { id: 'reederei_u1',       businessId: 'reederei',       name: 'Containerflotte',   beschreibung: '×2 Ertrag',            kosten: 3_300_000_000_000_000_000_000,    effekt: 'ertrag', faktor: 2 },
  { id: 'reederei_u2',       businessId: 'reederei',       name: 'Autopilot-Navigation',beschreibung: '×2 schnellere Zyklen',kosten: 33_000_000_000_000_000_000_000,  effekt: 'tempo',  faktor: 2 },
  { id: 'reederei_u3',       businessId: 'reederei',       name: 'Tiefseekabel',      beschreibung: '×3 Ertrag',            kosten: 330_000_000_000_000_000_000_000,  effekt: 'ertrag', faktor: 3 },

  { id: 'oelkonzern_u1',     businessId: 'oelkonzern',     name: 'Tiefbohrung',       beschreibung: '×2 Ertrag',            kosten: 39_600_000_000_000_000_000_000,   effekt: 'ertrag', faktor: 2 },
  { id: 'oelkonzern_u2',     businessId: 'oelkonzern',     name: 'Pipeline-Netz',     beschreibung: '×2 schnellere Zyklen', kosten: 396_000_000_000_000_000_000_000,  effekt: 'tempo',  faktor: 2 },
  { id: 'oelkonzern_u3',     businessId: 'oelkonzern',     name: 'Raffinerie-KI',     beschreibung: '×3 Ertrag',            kosten: 3_960_000_000_000_000_000_000_000,effekt: 'ertrag', faktor: 3 },

  { id: 'stahlwerk_u1',      businessId: 'stahlwerk',      name: 'Elektrolichtbogen', beschreibung: '×2 Ertrag',            kosten: 475_200_000_000_000_000_000_000,  effekt: 'ertrag', faktor: 2 },
  { id: 'stahlwerk_u2',      businessId: 'stahlwerk',      name: 'Walzstraße',        beschreibung: '×2 schnellere Zyklen', kosten: 4_752_000_000_000_000_000_000_000,effekt: 'tempo',  faktor: 2 },
  { id: 'stahlwerk_u3',      businessId: 'stahlwerk',      name: 'Nano-Legierung',    beschreibung: '×3 Ertrag',            kosten: 47_520_000_000_000_000_000_000_000,effekt: 'ertrag',faktor: 3 },

  { id: 'techriese_u1',      businessId: 'techriese',      name: 'App-Store',         beschreibung: '×2 Ertrag',            kosten: 5_700_000_000_000_000_000_000_000,effekt: 'ertrag', faktor: 2 },
  { id: 'techriese_u2',      businessId: 'techriese',      name: 'Cloud-Monopol',     beschreibung: '×2 schnellere Zyklen', kosten: 57_000_000_000_000_000_000_000_000,effekt: 'tempo', faktor: 2 },
  { id: 'techriese_u3',      businessId: 'techriese',      name: 'Metaverse',         beschreibung: '×3 Ertrag',            kosten: 570_000_000_000_000_000_000_000_000,effekt: 'ertrag',faktor: 3 },

  { id: 'medienimperium_u1', businessId: 'medienimperium', name: 'Streamingplattform',beschreibung: '×2 Ertrag',            kosten: 68_400_000_000_000_000_000_000_000,effekt: 'ertrag', faktor: 2 },
  { id: 'medienimperium_u2', businessId: 'medienimperium', name: 'Weltweites Netz',   beschreibung: '×2 schnellere Zyklen', kosten: 684_000_000_000_000_000_000_000_000,effekt: 'tempo', faktor: 2 },
  { id: 'medienimperium_u3', businessId: 'medienimperium', name: 'Neuralink-Werbung', beschreibung: '×3 Ertrag',            kosten: 6_840_000_000_000_000_000_000_000_000,effekt: 'ertrag',faktor: 3 },

  { id: 'pharmakonzern_u1',  businessId: 'pharmakonzern',  name: 'Gentherapie',       beschreibung: '×2 Ertrag',            kosten: 820_800_000_000_000_000_000_000_000,effekt: 'ertrag', faktor: 2 },
  { id: 'pharmakonzern_u2',  businessId: 'pharmakonzern',  name: 'Nanomedizin',       beschreibung: '×2 schnellere Zyklen', kosten: 8_208_000_000_000_000_000_000_000_000,effekt: 'tempo', faktor: 2 },
  { id: 'pharmakonzern_u3',  businessId: 'pharmakonzern',  name: 'Unsterblichkeit',   beschreibung: '×3 Ertrag',            kosten: 82_080_000_000_000_000_000_000_000_000,effekt: 'ertrag',faktor: 3 },

  // --- Welt 4: Luxus & Unterhaltung ---
  { id: 'casino_u1',       businessId: 'casino',       name: 'VIP-Lounge',          beschreibung: '×2 Ertrag',            kosten: 120_000_000_000_000_000_000_000_000_000,         effekt: 'ertrag', faktor: 2 },
  { id: 'casino_u2',       businessId: 'casino',       name: 'Highroller-Tisch',    beschreibung: '×2 schnellere Zyklen', kosten: 1_200_000_000_000_000_000_000_000_000_000,       effekt: 'tempo',  faktor: 2 },
  { id: 'casino_u3',       businessId: 'casino',       name: 'Jackpot-Maschinen',   beschreibung: '×3 Ertrag',            kosten: 12_000_000_000_000_000_000_000_000_000_000,      effekt: 'ertrag', faktor: 3 },

  { id: 'filmstudio_u1',   businessId: 'filmstudio',   name: 'Blockbuster-Deal',    beschreibung: '×2 Ertrag',            kosten: 1_440_000_000_000_000_000_000_000_000_000,       effekt: 'ertrag', faktor: 2 },
  { id: 'filmstudio_u2',   businessId: 'filmstudio',   name: 'Streamingvertrag',    beschreibung: '×2 schnellere Zyklen', kosten: 14_400_000_000_000_000_000_000_000_000_000,      effekt: 'tempo',  faktor: 2 },
  { id: 'filmstudio_u3',   businessId: 'filmstudio',   name: 'Oscar-Garantie',      beschreibung: '×3 Ertrag',            kosten: 144_000_000_000_000_000_000_000_000_000_000,     effekt: 'ertrag', faktor: 3 },

  { id: 'fussballklub_u1', businessId: 'fussballklub', name: 'Weltklasse-Transfer', beschreibung: '×2 Ertrag',            kosten: 17_280_000_000_000_000_000_000_000_000_000,      effekt: 'ertrag', faktor: 2 },
  { id: 'fussballklub_u2', businessId: 'fussballklub', name: 'Merchandising',       beschreibung: '×2 schnellere Zyklen', kosten: 172_800_000_000_000_000_000_000_000_000_000,     effekt: 'tempo',  faktor: 2 },
  { id: 'fussballklub_u3', businessId: 'fussballklub', name: 'Champions-League',    beschreibung: '×3 Ertrag',            kosten: 1_728_000_000_000_000_000_000_000_000_000_000,   effekt: 'ertrag', faktor: 3 },

  { id: 'formel1_u1',      businessId: 'formel1',      name: 'DRS-System',          beschreibung: '×2 Ertrag',            kosten: 207_360_000_000_000_000_000_000_000_000_000,     effekt: 'ertrag', faktor: 2 },
  { id: 'formel1_u2',      businessId: 'formel1',      name: 'Windkanal',           beschreibung: '×2 schnellere Zyklen', kosten: 2_073_600_000_000_000_000_000_000_000_000_000,   effekt: 'tempo',  faktor: 2 },
  { id: 'formel1_u3',      businessId: 'formel1',      name: 'WM-Titel',            beschreibung: '×3 Ertrag',            kosten: 20_736_000_000_000_000_000_000_000_000_000_000,  effekt: 'ertrag', faktor: 3 },

  { id: 'raumtourismus_u1',businessId: 'raumtourismus',name: 'Luxus-Kapsel',        beschreibung: '×2 Ertrag',            kosten: 2_488_320_000_000_000_000_000_000_000_000_000,   effekt: 'ertrag', faktor: 2 },
  { id: 'raumtourismus_u2',businessId: 'raumtourismus',name: 'Orbit-Hotel',         beschreibung: '×2 schnellere Zyklen', kosten: 24_883_200_000_000_000_000_000_000_000_000_000,  effekt: 'tempo',  faktor: 2 },
  { id: 'raumtourismus_u3',businessId: 'raumtourismus',name: 'Mond-Ausflug',        beschreibung: '×3 Ertrag',            kosten: 248_832_000_000_000_000_000_000_000_000_000_000, effekt: 'ertrag', faktor: 3 },

  { id: 'privatinsel_u1',  businessId: 'privatinsel',  name: 'Helipad',             beschreibung: '×2 Ertrag',            kosten: 29_859_840_000_000_000_000_000_000_000_000_000,  effekt: 'ertrag', faktor: 2 },
  { id: 'privatinsel_u2',  businessId: 'privatinsel',  name: 'Unterwasser-Villa',   beschreibung: '×2 schnellere Zyklen', kosten: 298_598_400_000_000_000_000_000_000_000_000_000, effekt: 'tempo',  faktor: 2 },
  { id: 'privatinsel_u3',  businessId: 'privatinsel',  name: 'Eigener Staat',       beschreibung: '×3 Ertrag',            kosten: 2_985_984_000_000_000_000_000_000_000_000_000_000,effekt: 'ertrag', faktor: 3 },

  { id: 'diamanten_u1',    businessId: 'diamanten',    name: 'Tiefsee-Mine',        beschreibung: '×2 Ertrag',            kosten: 358_318_080_000_000_000_000_000_000_000_000_000, effekt: 'ertrag', faktor: 2 },
  { id: 'diamanten_u2',    businessId: 'diamanten',    name: 'Laser-Cutter',        beschreibung: '×2 schnellere Zyklen', kosten: 3_583_180_800_000_000_000_000_000_000_000_000_000,effekt: 'tempo', faktor: 2 },
  { id: 'diamanten_u3',    businessId: 'diamanten',    name: 'Weltraum-Asteroiden', beschreibung: '×3 Ertrag',            kosten: 35_831_808_000_000_000_000_000_000_000_000_000_000,effekt: 'ertrag',faktor: 3 },

  { id: 'luxusimperium_u1',businessId: 'luxusimperium',name: 'Gold-Verkleidung',    beschreibung: '×2 Ertrag',            kosten: 4_299_816_960_000_000_000_000_000_000_000_000_000,effekt: 'ertrag', faktor: 2 },
  { id: 'luxusimperium_u2',businessId: 'luxusimperium',name: 'KI-Butler',           beschreibung: '×2 schnellere Zyklen', kosten: 42_998_169_600_000_000_000_000_000_000_000_000_000,effekt: 'tempo', faktor: 2 },
  { id: 'luxusimperium_u3',businessId: 'luxusimperium',name: 'Ewige Herrschaft',    beschreibung: '×3 Ertrag',            kosten: 429_981_696_000_000_000_000_000_000_000_000_000_000,effekt: 'ertrag',faktor: 3 },

  { id: 'weltbank_u1',       businessId: 'weltbank',       name: 'Digitale Währung',  beschreibung: '×2 Ertrag',            kosten: 9_849_600_000_000_000_000_000_000_000,effekt: 'ertrag', faktor: 2 },
  { id: 'weltbank_u2',       businessId: 'weltbank',       name: 'Hochfrequenzhandel',beschreibung: '×2 schnellere Zyklen', kosten: 98_496_000_000_000_000_000_000_000_000,effekt: 'tempo', faktor: 2 },
  { id: 'weltbank_u3',       businessId: 'weltbank',       name: 'Globaler Reservefonds',beschreibung: '×3 Ertrag',         kosten: 984_960_000_000_000_000_000_000_000_000,effekt: 'ertrag',faktor: 3 },
]

/** Schneller Zugriff auf alle Upgrades eines Business. */
export const UPGRADES_BY_BUSINESS: Record<string, UpgradeConfig[]> = {}
for (const u of UPGRADES) {
  if (!UPGRADES_BY_BUSINESS[u.businessId]) UPGRADES_BY_BUSINESS[u.businessId] = []
  UPGRADES_BY_BUSINESS[u.businessId].push(u)
}

/** Schneller Zugriff auf ein Upgrade über die id. */
export const UPGRADE_MAP: Record<string, UpgradeConfig> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
)

/** Schneller Zugriff auf ein Talent über die id. */
export const TALENT_MAP: Record<string, TalentConfig> = Object.fromEntries(
  TALENTE.map((t) => [t.id, t]),
)
