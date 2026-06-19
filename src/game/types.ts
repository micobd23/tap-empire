// Die Datentypen des Spiels. Hier ist festgelegt, welche Form unsere Daten haben.

/** Feste Eigenschaften einer Welt (Gruppe von Businesses, die man freischalten kann). */
export interface WeltConfig {
  id: string
  name: string
  emoji: string
  /** Einmalige Geld-Kosten zum Freischalten (0 = von Anfang an frei, wie Welt 1). */
  freischaltKosten: number
  /** Dauerhafter globaler Einkommens-Bonus, sobald freigeschaltet (0,5 = +50 %). */
  bonus: number
}

/** Feste Eigenschaften eines Business (kommen aus der config.ts, ändern sich nie). */
export interface BusinessConfig {
  id: string
  /** Zu welcher Welt das Business gehört (siehe WELTEN in config.ts). */
  welt: string
  name: string
  emoji: string
  /** Kosten für das allererste Stück. */
  basisKosten: number
  /** Jeder Kauf macht das nächste Stück um diesen Faktor teurer (z. B. 1,07). */
  kostenFaktor: number
  /** Dauer eines Produktionszyklus in Millisekunden. */
  dauerMs: number
  /** Ertrag pro Stück und Zyklus. */
  basisErtrag: number
  /** Einmalige Kosten, um einen Manager (Automatik) anzustellen. */
  managerKosten: number
}

/** Der veränderliche Zustand eines Business (wird gespeichert). */
export interface BusinessRuntime {
  /** Wie viele Stück man besitzt. */
  anzahl: number
  /** Läuft die Produktion automatisch (Manager gekauft)? */
  hatManager: boolean
  /** Fortschritt im aktuellen Zyklus, in Millisekunden. */
  fortschrittMs: number
  /** Läuft gerade ein (manuell gestarteter) Zyklus? Nur relevant ohne Manager. */
  laeuft: boolean
}

/** Feste Eigenschaften eines Talents im Talentbaum (aus der config.ts). */
export interface TalentConfig {
  id: string
  /** Zu welchem Ast (Spalte) das Talent gehört. */
  ast: string
  name: string
  beschreibung: string
  /** Kosten in Talentpunkten. Bei Endlos-Talenten: Kosten der ersten Stufe (steigt danach). */
  kosten: number
  /** id des Talents, das vorher gekauft sein muss (oder null = sofort verfügbar). */
  voraussetzung: string | null
  /** Endlos-Talent: beliebig oft kaufbar, jede Stufe wird um 1 TP teurer. */
  endlos?: boolean
}

/** Der gesamte Spielzustand. Genau das wird gespeichert und geladen. */
export interface GameState {
  geld: number
  /** Summe alles jemals Verdienten (über alle Prestiges hinweg) — Basis für die Investoren. */
  gesamtVerdient: number
  /** Zustand pro Business, nachgeschlagen über die id. */
  businesses: Record<string, BusinessRuntime>
  /** Prestige-Ressource 1: Investoren geben einen dauerhaften Einkommens-Multiplikator. */
  investoren: number
  /** Gekaufte Talente: talentId -> Stufe (0/fehlt = nicht gekauft). */
  talents: Record<string, number>
  /** Prestige-Ressource 2: insgesamt je verdiente Talentpunkte (ausgegeben + übrig). */
  talentpunkteVerdient: number
  /** Wie oft schon ein Prestige durchgeführt wurde (schaltet Auto-Manager frei). */
  prestigeCount: number
  /** Ist der Auto-Käufer eingeschaltet? (Wirkt erst ab AUTO_KAUFER_AB_PRESTIGE.) */
  autoKauf: boolean
  /** Ids der bereits erreichten Erfolge (dauerhaft). Erreicht = bereit zum Abholen. */
  erfolge: string[]
  /** Ids der abgeholten Erfolge — erst diese geben den Einkommens-Bonus (per Klick aktiviert). */
  erfolgeAbgeholt: string[]
  /** Ids der freigeschalteten Welten (mindestens 'welt1'; weitere kosten Geld). */
  freigeschalteteWelten: string[]
  /** gesamtVerdient-Wert beim letzten Prestige (0 = noch kein Prestige). Basis für den Runden-Verdienst. */
  gesamtVerdientBeimLetztenPrestige: number
  /** Zeitstempel des letzten Speicherns — für die Offline-Berechnung. */
  zuletztGesehen: number
}
