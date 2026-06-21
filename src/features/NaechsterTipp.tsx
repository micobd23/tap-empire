// Dünne Hinweis-Zeile oben im Business-Tab: zeigt den nächsten sinnvollen Schritt.
import { useGame } from '../store'
import { naechsterTipp } from '../game/hinweise'

export function NaechsterTipp() {
  // s.state ist eine stabile Referenz — den Tipp im Render berechnen (NICHT im Selector
  // ein neues Objekt erzeugen, das löste sonst eine Endlosschleife aus).
  const state = useGame((s) => s.state)
  const tipp = naechsterTipp(state)
  if (!tipp) return null

  return (
    <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-300">
      <span className="text-sm leading-none">{tipp.emoji}</span>
      <span className="min-w-0 truncate">{tipp.text}</span>
    </div>
  )
}
