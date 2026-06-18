// Der Erfolge-Bildschirm: Liste aller Erfolge, erreichte farbig, offene ausgegraut.
import { useGame } from '../store'
import { ERFOLGE } from '../game/erfolge'
import { ERFOLG_BONUS } from '../game/config'

export function ErfolgeScreen() {
  const erfolge = useGame((s) => s.state.erfolge)
  const erreicht = erfolge.length
  const bonusProzent = Math.round(ERFOLG_BONUS * 100)

  return (
    <div className="pt-3">
      <div className="mb-4 rounded-2xl border border-emerald-700/40 bg-emerald-950/20 p-4 text-center">
        <p className="text-sm text-emerald-300/80">Erfolge</p>
        <p className="text-3xl font-semibold text-emerald-300">
          {erreicht} <span className="text-lg text-emerald-300/70">/ {ERFOLGE.length}</span>
        </p>
        <p className="mt-1 text-xs text-emerald-300/70">
          +{erreicht * bonusProzent} % Einkommen aus Erfolgen (je +{bonusProzent} %)
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {ERFOLGE.map((e) => {
          const fertig = erfolge.includes(e.id)
          return (
            <div
              key={e.id}
              className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${
                fertig ? 'border-emerald-600/50 bg-slate-800' : 'border-slate-700 bg-slate-800/40 opacity-60'
              }`}
            >
              <div className="min-w-0">
                <div className={`font-medium ${fertig ? 'text-slate-100' : 'text-slate-400'}`}>{e.name}</div>
                <div className="text-xs text-slate-400">{e.beschreibung}</div>
              </div>
              <div className="shrink-0 text-sm">
                {fertig ? (
                  <span className="font-medium text-emerald-400">✓ +{bonusProzent} %</span>
                ) : (
                  <span className="text-slate-500">🔒</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
