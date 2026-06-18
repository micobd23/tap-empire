// Eine Business-Karte: antippen zum Produzieren (mit fliegender +X), kaufen, Manager anstellen.
import { useEffect, useRef, useState } from 'react'
import { useGame } from '../store'
import { BALKEN_VOLL_AB_MS, BUSINESS_MAP } from '../game/config'
import { ertragProZyklus, kostenFuer, maxKaufbar, tempoMeilensteinFaktor } from '../game/economy'
import { globalerEinkommensMultiplikator } from '../game/prestige'
import { talentEffekte } from '../game/talents'
import { formatGeld } from '../game/format'

export function BusinessCard({ id }: { id: string }) {
  const b = BUSINESS_MAP[id]
  const anzahl = useGame((s) => s.state.businesses[id].anzahl)
  const hatManager = useGame((s) => s.state.businesses[id].hatManager)
  const fortschrittMs = useGame((s) => s.state.businesses[id].fortschrittMs)
  const laeuft = useGame((s) => s.state.businesses[id].laeuft)
  const geld = useGame((s) => s.state.geld)
  const kaufModus = useGame((s) => s.kaufModus)
  const mult = useGame((s) => globalerEinkommensMultiplikator(s.state))
  const zyklusFaktor = useGame((s) => talentEffekte(s.state.talents).zyklusFaktor)
  const managerRabatt = useGame((s) => talentEffekte(s.state.talents).managerRabatt)
  const kaufen = useGame((s) => s.kaufen)
  const antippen = useGame((s) => s.antippen)
  const managerKaufen = useGame((s) => s.managerKaufen)

  const [floats, setFloats] = useState<{ key: number; wert: number }[]>([])

  const aktiv = anzahl > 0
  const tempoFaktor = tempoMeilensteinFaktor(anzahl)
  const dauer = b.dauerMs * zyklusFaktor * tempoFaktor
  const laeuftGerade = aktiv && (hatManager || laeuft)
  // Nur im Automatik-Betrieb (Manager) den Balken bei Sekundentakt einfach voll lassen,
  // statt ihn flackern zu lassen. Tippt man selbst, läuft er bewusst durch — als Feedback.
  const prozent = !laeuftGerade
    ? 0
    : hatManager && dauer <= BALKEN_VOLL_AB_MS
      ? 100
      : Math.min(100, (fortschrittMs / dauer) * 100)
  const ertrag = ertragProZyklus(b, Math.max(anzahl, 1)) * mult
  // Pro-Sekunde-Wert für die Anzeige — macht schnelle und langsame Businesses vergleichbar.
  const ertragProSekunde = ertrag / (dauer / 1000)
  const managerKosten = b.managerKosten * (1 - managerRabatt)

  const maxMenge = maxKaufbar(b, anzahl, geld)
  const menge = kaufModus === 'max' ? Math.max(maxMenge, 1) : kaufModus
  const kosten = kostenFuer(b, anzahl, menge)
  const kannKaufen = kaufModus === 'max' ? maxMenge >= 1 : geld >= kosten

  // Der einzelne Kauf läuft über onClick — auf dem iPhone das zuverlässigste Touch-Ereignis
  // (onPointerDown wurde dort oft verschluckt). Hält man den Knopf, kommen nach kurzer Zeit
  // automatisch Wiederholungen dazu. mengeRef hält immer die aktuelle Menge (Max-Modus zählt mit).
  const mengeRef = useRef(menge)
  mengeRef.current = menge
  const startRef = useRef<number | null>(null)
  const wiederholRef = useRef<number | null>(null)

  function haltStop() {
    if (startRef.current !== null) {
      clearTimeout(startRef.current)
      startRef.current = null
    }
    if (wiederholRef.current !== null) {
      clearInterval(wiederholRef.current)
      wiederholRef.current = null
    }
    window.removeEventListener('pointerup', haltStop)
    window.removeEventListener('pointercancel', haltStop)
  }

  function haltStart() {
    if (startRef.current !== null || wiederholRef.current !== null) return
    // Nach 350 ms Halten automatisch wiederholen — der erste Kauf kommt vom onClick.
    startRef.current = window.setTimeout(() => {
      wiederholRef.current = window.setInterval(() => kaufen(id, mengeRef.current), 120)
    }, 350)
    // Global lauschen, falls der Knopf mitten im Halten deaktiviert wird (Geld leer).
    window.addEventListener('pointerup', haltStop)
    window.addEventListener('pointercancel', haltStop)
  }

  // Sicherheitsnetz: Timer stoppen, falls die Karte verschwindet.
  useEffect(() => haltStop, [])

  function handleTap() {
    if (!aktiv || hatManager || laeuft) return
    antippen(id)
    const key = Date.now() + Math.random()
    setFloats((f) => [...f, { key, wert: ertrag }])
    setTimeout(() => setFloats((f) => f.filter((x) => x.key !== key)), 900)
  }

  return (
    <div className="relative mb-2 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
      {floats.map((f) => (
        <span
          key={f.key}
          className="float-zahl pointer-events-none absolute left-9 top-1 z-20 text-sm font-medium text-emerald-300"
        >
          +{formatGeld(f.wert)} €
        </span>
      ))}

      <button
        onClick={handleTap}
        disabled={!aktiv || hatManager}
        aria-label={`${b.name} produzieren`}
        className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-900 text-3xl transition-transform active:scale-95 disabled:active:scale-100 ${aktiv ? '' : 'opacity-60'}`}
      >
        <span className="relative z-10">{b.emoji}</span>
        {aktiv && (
          <span className="absolute left-0.5 top-0.5 z-10 rounded bg-slate-950/70 px-1 text-[10px] font-semibold leading-tight text-slate-200">
            ×{anzahl}
          </span>
        )}
        <div
          className="absolute bottom-0 left-0 h-1.5 bg-emerald-500"
          style={{ width: `${prozent}%` }}
        />
      </button>

      <div className={`min-w-0 flex-1 ${aktiv ? '' : 'opacity-60'}`}>
        <div className="truncate font-medium text-slate-100">{b.name}</div>
        <div className="whitespace-nowrap text-sm text-emerald-400">
          +{formatGeld(ertragProSekunde)} € / s
        </div>
        {aktiv && !hatManager && (
          <button
            onClick={() => managerKaufen(id)}
            disabled={geld < managerKosten}
            className="mt-1 whitespace-nowrap rounded-md bg-slate-700 px-2 py-0.5 text-xs text-slate-200 disabled:opacity-40"
          >
            Manager: {formatGeld(managerKosten)} €
          </button>
        )}
        {hatManager && <div className="mt-1 text-xs text-amber-400">Manager aktiv ✓</div>}
      </div>

      <button
        onClick={() => kaufen(id, mengeRef.current)}
        onPointerDown={haltStart}
        onPointerUp={haltStop}
        onPointerLeave={haltStop}
        onPointerCancel={haltStop}
        onContextMenu={(e) => e.preventDefault()}
        disabled={!kannKaufen}
        className="w-28 shrink-0 touch-none select-none rounded-lg bg-emerald-600 px-2 py-2 text-center font-medium text-white transition-transform active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 disabled:active:scale-100"
      >
        <div className="text-xs opacity-80">Kaufen ×{menge}</div>
        <div className="truncate text-sm">{formatGeld(kosten)} €</div>
      </button>
    </div>
  )
}
