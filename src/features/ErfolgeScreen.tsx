// Der Erfolge-Bildschirm: Liste aller Erfolge. Erreichte Erfolge muss man per Klick abholen,
// erst dann gibt die Belohnung (+X % Einkommen) ihren Bonus.
import { useGame } from '../store'
import { ERFOLGE } from '../game/erfolge'
import { ERFOLG_BONUS } from '../game/config'

export function ErfolgeScreen() {
  const erfolge = useGame((s) => s.state.erfolge)
  const erfolgeAbgeholt = useGame((s) => s.state.erfolgeAbgeholt)
  const erfolgAbholen = useGame((s) => s.erfolgAbholen)
  const alleErfolgeAbholen = useGame((s) => s.alleErfolgeAbholen)

  const bonusProzent = Math.round(ERFOLG_BONUS * 100)
  const abgeholt = erfolgeAbgeholt.length
  const abholbar = erfolge.filter((id) => !erfolgeAbgeholt.includes(id)).length

  return (
    <div className="pt-3">
      <div className="mb-4 rounded-2xl border border-emerald-700/40 bg-emerald-950/20 p-4 text-center">
        <p className="text-sm text-emerald-300/80">Erfolge abgeholt</p>
        <p className="text-3xl font-semibold text-emerald-300">
          {abgeholt} <span className="text-lg text-emerald-300/70">/ {ERFOLGE.length}</span>
        </p>
        <p className="mt-1 text-xs text-emerald-300/70">
          +{abgeholt * bonusProzent} % Einkommen aus Erfolgen (je +{bonusProzent} %)
        </p>
        {abholbar > 0 && (
          <button
            onClick={alleErfolgeAbholen}
            className="mt-3 w-full animate-pulse rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white"
          >
            🎁 {abholbar} {abholbar === 1 ? 'Belohnung' : 'Belohnungen'} abholen
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {ERFOLGE.map((e) => {
          const erreicht = erfolge.includes(e.id)
          const fertig = erfolgeAbgeholt.includes(e.id)
          const offenZumAbholen = erreicht && !fertig
          return (
            <div
              key={e.id}
              className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${
                offenZumAbholen
                  ? 'border-amber-500/60 bg-amber-950/20'
                  : fertig
                    ? 'border-emerald-600/50 bg-slate-800'
                    : 'border-slate-700 bg-slate-800/40 opacity-60'
              }`}
            >
              <div className="min-w-0">
                <div className={`font-medium ${erreicht ? 'text-slate-100' : 'text-slate-400'}`}>{e.name}</div>
                <div className="text-xs text-slate-400">{e.beschreibung}</div>
              </div>
              <div className="shrink-0 text-sm">
                {fertig ? (
                  <span className="font-medium text-emerald-400">✓ +{bonusProzent} %</span>
                ) : offenZumAbholen ? (
                  <button
                    onClick={() => erfolgAbholen(e.id)}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white"
                  >
                    Abholen +{bonusProzent} %
                  </button>
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
