// Glücks-Event-Banner: erscheint als Slide-up-Card über der Tab-Leiste.
// Zeigt wartendes Event (30s-Fenster zum Aktivieren) oder laufendes Event (mit Countdown).
import { useEffect, useState } from 'react'
import { useGame } from '../store'
import { EVENT_MAP } from '../game/events'

export function EventBanner() {
  const wartendesEvent = useGame((s) => s.state.wartendesEvent)
  const wartendesEventBisMs = useGame((s) => s.state.wartendesEventBisMs)
  const aktivesEvent = useGame((s) => s.state.aktivesEvent)
  const eventAktivieren = useGame((s) => s.eventAktivieren)

  // Sekunden-Tick für den sichtbaren Countdown (kein Re-render jede Frame).
  const [, tick] = useState(0)
  useEffect(() => {
    if (!wartendesEvent && !aktivesEvent) return
    const id = setInterval(() => tick((n) => n + 1), 250)
    return () => clearInterval(id)
  }, [wartendesEvent, aktivesEvent])

  const jetzt = Date.now()

  if (wartendesEvent) {
    const typ = EVENT_MAP[wartendesEvent]
    if (!typ) return null
    const sek = Math.max(0, Math.ceil((wartendesEventBisMs - jetzt) / 1000))
    const istStreik = typ.effekt === 'managerStreik'
    const rahmenFarbe = istStreik ? '#ef4444' : '#f59e0b'
    const hintergrund = istStreik ? '#450a0a' : '#431407'

    return (
      <div
        className="event-slide-up fixed bottom-16 inset-x-2 z-40 rounded-xl p-3 text-center"
        style={{ background: hintergrund, border: `1.5px solid ${rahmenFarbe}` }}
      >
        <div className="text-2xl leading-none">{typ.emoji}</div>
        <div className="mt-1 font-semibold text-white">{typ.name}</div>
        <div className="text-xs" style={{ color: istStreik ? '#fca5a5' : '#fcd34d' }}>{typ.beschreibung}</div>
        <button
          onClick={eventAktivieren}
          className="mt-2 w-full rounded-lg py-2 text-sm font-semibold text-white active:scale-95 transition-transform"
          style={{ background: rahmenFarbe }}
        >
          {istStreik ? 'Akzeptieren' : '✨ Aktivieren!'} · noch {sek}s
        </button>
      </div>
    )
  }

  if (aktivesEvent) {
    const typ = EVENT_MAP[aktivesEvent.typId]
    if (!typ || typ.dauerMs === 0) return null
    const sek = Math.max(0, Math.ceil((aktivesEvent.laeuftBisMs - jetzt) / 1000))
    if (sek === 0) return null
    const fortschritt = Math.max(0, (aktivesEvent.laeuftBisMs - jetzt) / typ.dauerMs) * 100
    const istStreik = typ.effekt === 'managerStreik'
    const akzentFarbe = istStreik ? '#ef4444' : '#f59e0b'

    return (
      <div
        className="fixed bottom-16 inset-x-2 z-40 flex items-center gap-2 rounded-lg px-3 py-2"
        style={{ background: istStreik ? '#450a0a' : '#431407', border: `1px solid ${akzentFarbe}55` }}
      >
        <span className="text-lg leading-none">{typ.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white">{typ.name} aktiv</div>
          <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full"
              style={{ width: `${fortschritt}%`, background: akzentFarbe }}
            />
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold" style={{ color: akzentFarbe }}>{sek}s</span>
      </div>
    )
  }

  return null
}
