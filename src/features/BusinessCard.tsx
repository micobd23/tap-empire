// Eine Business-Karte: antippen zum Produzieren (mit fliegender +X), kaufen, Manager anstellen.
import { useEffect, useRef, useState } from 'react'
import { useGame } from '../store'
import { BALKEN_VOLL_AB_MS, BUSINESS_MAP, MEILENSTEINE, WELT_MAP } from '../game/config'
import { ertragProZyklus, kostenFuer, maxKaufbar, tempoMeilensteinFaktor } from '../game/economy'
import { globalerEinkommensMultiplikator } from '../game/prestige'
import { talentEffekte } from '../game/talents'
import { formatGeld } from '../game/format'
import { soundKauf, soundMeilenstein, soundTap } from '../sound'

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
  // Münz-Partikel (mit zufälliger Flugbahn) und der Pop-Zähler fürs Emoji.
  const [muenzen, setMuenzen] = useState<{ key: number; dx: number; dy: number }[]>([])
  const [popKey, setPopKey] = useState(0)
  // Kurzes Aufblitzen, wenn ein Meilenstein überschritten wird.
  const [blitz, setBlitz] = useState(false)
  const vorigeAnzahl = useRef(anzahl)

  // Erkennt beim Kauf, ob eine Meilenstein-Schwelle (25/50/100/…) übersprungen wurde.
  useEffect(() => {
    const vor = vorigeAnzahl.current
    vorigeAnzahl.current = anzahl
    if (anzahl > vor && MEILENSTEINE.some((m) => vor < m && anzahl >= m)) {
      setBlitz(true)
      soundMeilenstein()
      const t = window.setTimeout(() => setBlitz(false), 600)
      return () => clearTimeout(t)
    }
  }, [anzahl])

  const weltFarbe = WELT_MAP[b.welt].farbe
  const weltTint = WELT_MAP[b.welt].farbeTint

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
  // Ref nach jedem Render aktualisieren (nicht während des Renders — das verbietet React).
  useEffect(() => {
    mengeRef.current = menge
  })
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
  }

  function haltStart(e: React.PointerEvent) {
    // Verhindert, dass iOS den Hold als Scroll-Geste interpretiert und pointercancel feuert.
    e.preventDefault()
    if (startRef.current !== null || wiederholRef.current !== null) return
    startRef.current = window.setTimeout(() => {
      wiederholRef.current = window.setInterval(() => kaufen(id, mengeRef.current), 120)
    }, 350)
    // { once: true } → Listener entfernt sich selbst, kein Referenz-Problem bei Re-renders.
    window.addEventListener('pointerup', haltStop, { once: true })
    window.addEventListener('pointercancel', haltStop, { once: true })
  }

  // Sicherheitsnetz: Timer stoppen, falls die Karte verschwindet.
  useEffect(() => haltStop, [])

  function handleTap() {
    if (!aktiv || hatManager || laeuft) return
    antippen(id)
    soundTap()
    // Vibration wirkt nur auf Android — iOS-Safari ignoriert die API (schadet aber nicht).
    if ('vibrate' in navigator) navigator.vibrate(8)
    const key = Date.now() + Math.random()
    setFloats((f) => [...f, { key, wert: ertrag }])
    setTimeout(() => setFloats((f) => f.filter((x) => x.key !== key)), 900)
    // Ein paar Münzen in zufällige Richtungen wegspritzen lassen.
    const neue = Array.from({ length: 4 }, (_, i) => ({
      key: key + i + 1,
      dx: (Math.random() - 0.5) * 60,
      dy: -30 - Math.random() * 40,
    }))
    setMuenzen((m) => [...m, ...neue])
    setTimeout(() => {
      const keys = new Set(neue.map((n) => n.key))
      setMuenzen((m) => m.filter((x) => !keys.has(x.key)))
    }, 700)
    // Emoji kurz aufpoppen (Key-Wechsel startet die CSS-Animation neu).
    setPopKey((k) => k + 1)
  }

  return (
    <div
      className={`relative mb-2 flex items-center gap-3 rounded-r-xl border border-slate-700 bg-slate-800 p-3 ${blitz ? 'meilenstein-blitz' : ''}`}
      style={{ borderLeft: `3px solid ${weltFarbe}` }}
    >
      {floats.map((f) => (
        <span
          key={f.key}
          className="float-zahl pointer-events-none absolute left-9 top-1 z-20 text-sm font-medium text-emerald-300"
        >
          +{formatGeld(f.wert)} €
        </span>
      ))}
      {muenzen.map((m) => (
        <span
          key={m.key}
          className="muenze pointer-events-none absolute left-7 top-7 z-20 text-base"
          style={{ '--dx': `${m.dx}px`, '--dy': `${m.dy}px` } as React.CSSProperties}
        >
          🪙
        </span>
      ))}

      <button
        onClick={handleTap}
        disabled={!aktiv || hatManager}
        aria-label={`${b.name} produzieren`}
        className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg text-3xl transition-transform active:scale-90 disabled:active:scale-100 ${aktiv ? '' : 'opacity-60'}`}
        style={{ background: `${weltFarbe}18`, border: `1px solid ${weltFarbe}35` }}
      >
        <span key={popKey} className={`relative z-10 ${popKey > 0 ? 'tap-pop' : ''}`}>
          {b.emoji}
        </span>
        {aktiv && (
          <span
            className="absolute left-0.5 top-0.5 z-10 rounded px-1 text-[10px] font-semibold leading-tight"
            style={{ background: 'rgba(0,0,0,0.65)', color: weltTint }}
          >
            ×{anzahl}
          </span>
        )}
        <div
          className="absolute bottom-0 left-0 h-2"
          style={{ width: `${prozent}%`, background: weltFarbe }}
        />
      </button>

      <div className={`min-w-0 flex-1 ${aktiv ? '' : 'opacity-60'}`}>
        <div className="truncate font-medium text-slate-100">{b.name}</div>
        <div className="whitespace-nowrap text-sm" style={{ color: weltFarbe }}>
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
        onClick={() => {
          kaufen(id, mengeRef.current)
          soundKauf()
        }}
        onPointerDown={haltStart}
        onPointerCancel={haltStop}
        onContextMenu={(e) => e.preventDefault()}
        disabled={!kannKaufen}
        className="w-28 shrink-0 touch-none select-none rounded-lg px-2 py-2 text-center font-medium text-white transition-transform active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 disabled:active:scale-100"
        style={kannKaufen ? { background: weltFarbe } : undefined}
      >
        <div className="text-xs opacity-80">Kaufen ×{menge}</div>
        <div className="truncate text-sm">{formatGeld(kosten)} €</div>
      </button>
    </div>
  )
}
