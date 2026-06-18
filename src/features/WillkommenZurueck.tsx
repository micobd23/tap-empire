// Overlay nach der Rückkehr: zeigt, wie viel die Manager offline verdient haben.
import { useGame } from '../store'
import { formatGeld } from '../game/format'

export function WillkommenZurueck() {
  const verdienst = useGame((s) => s.offlineVerdienst)
  const quittieren = useGame((s) => s.offlineQuittieren)

  if (verdienst <= 0) return null

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-800 p-6 text-center">
        <div className="text-3xl">👋</div>
        <h2 className="mt-2 text-lg font-semibold text-slate-100">Willkommen zurück!</h2>
        <p className="mt-1 text-slate-300">Deine Manager haben verdient:</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-400">+{formatGeld(verdienst)} €</p>
        <button
          onClick={quittieren}
          className="mt-4 w-full rounded-lg bg-emerald-600 py-2 font-medium text-white"
        >
          Super!
        </button>
      </div>
    </div>
  )
}
