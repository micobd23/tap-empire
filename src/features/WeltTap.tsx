// Imperium-Tap: eine große Tap-Fläche oben im Business-Tab. Bezieht sich auf die
// GESAMTE aktive Welt — ein Tap gibt freies Bonus-Geld (≈ ein paar Sekunden Einkommen).
// Lohnt sich immer, ist aber nie nötig: Idle bleibt der Hauptmotor.
import { useRef, useState } from 'react'
import { useGame } from '../store'
import { WELT_MAP } from '../game/config'
import { weltTapErtrag } from '../game/prestige'
import { formatGeld } from '../game/format'
import { soundTap } from '../sound'

export function WeltTap() {
  const aktiveWelt = useGame((s) => s.aktiveWelt)
  const proTap = useGame((s) => weltTapErtrag(s.state))
  const weltTippen = useGame((s) => s.weltTippen)

  const welt = WELT_MAP[aktiveWelt]
  const farbe = welt.farbe
  const tint = welt.farbeTint

  const [floats, setFloats] = useState<{ key: number; wert: number }[]>([])
  const [muenzen, setMuenzen] = useState<{ key: number; dx: number; dy: number }[]>([])
  const [popKey, setPopKey] = useState(0)
  const naechsteKey = useRef(0)

  function handleTap() {
    const ertrag = weltTippen()
    if (ertrag <= 0) return // gedeckelt (Autoclicker-Schutz) — kein Feedback
    soundTap()
    if ('vibrate' in navigator) navigator.vibrate(8)

    const key = naechsteKey.current++
    setFloats((f) => [...f, { key, wert: ertrag }])
    setTimeout(() => setFloats((f) => f.filter((x) => x.key !== key)), 900)

    const neue = Array.from({ length: 6 }, (_, i) => ({
      key: naechsteKey.current++ + i,
      dx: (Math.random() - 0.5) * 120,
      dy: -40 - Math.random() * 50,
    }))
    setMuenzen((m) => [...m, ...neue])
    setTimeout(() => {
      const keys = new Set(neue.map((n) => n.key))
      setMuenzen((m) => m.filter((x) => !keys.has(x.key)))
    }, 700)

    setPopKey((k) => k + 1)
  }

  return (
    <button
      onClick={handleTap}
      aria-label="Imperium antippen"
      className="relative mb-2 flex w-full touch-none select-none items-center justify-center gap-3 overflow-hidden rounded-xl py-4 transition-transform active:scale-[0.98]"
      style={{
        background: `radial-gradient(ellipse 70% 120% at 50% 0%, ${farbe}40, ${farbe}12)`,
        boxShadow: `inset 0 0 0 1px ${farbe}55, 0 4px 16px ${farbe}26`,
      }}
    >
      {floats.map((f) => (
        <span
          key={f.key}
          className="float-zahl pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 text-base font-semibold text-emerald-300"
        >
          +{formatGeld(f.wert)} €
        </span>
      ))}
      {muenzen.map((m) => (
        <span
          key={m.key}
          className="muenze pointer-events-none absolute left-1/2 top-1/2 z-20 text-lg"
          style={{ '--dx': `${m.dx}px`, '--dy': `${m.dy}px` } as React.CSSProperties}
        >
          🪙
        </span>
      ))}

      <span key={popKey} className={`text-4xl leading-none ${popKey > 0 ? 'tap-pop' : ''}`}>
        {welt.emoji}
      </span>
      <span className="text-left">
        <span className="block text-sm font-semibold" style={{ color: tint }}>
          Imperium antippen
        </span>
        <span className="block text-xs" style={{ color: farbe }}>
          +{formatGeld(proTap)} € pro Tap
        </span>
      </span>
    </button>
  )
}
