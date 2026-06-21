// Der Erfolge-Bildschirm: Liste aller Erfolge + aufklappbare Statistiken.
import { useState } from 'react'
import { useGame } from '../store'
import { ERFOLGE } from '../game/erfolge'
import { ERFOLG_BONUS, BUSINESSES } from '../game/config'
import { formatGeld } from '../game/format'

function formatZeit(ms: number): string {
  if (ms <= 0) return '—'
  const sek = Math.floor(ms / 1000)
  if (sek < 60) return `${sek} s`
  const min = Math.floor(sek / 60)
  const restSek = sek % 60
  if (min < 60) return `${min} min ${restSek} s`
  const std = Math.floor(min / 60)
  const restMin = min % 60
  return `${std} h ${restMin} min`
}

export function ErfolgeScreen() {
  const erfolge = useGame((s) => s.state.erfolge)
  const erfolgeAbgeholt = useGame((s) => s.state.erfolgeAbgeholt)
  const erfolgAbholen = useGame((s) => s.erfolgAbholen)
  const alleErfolgeAbholen = useGame((s) => s.alleErfolgeAbholen)
  const state = useGame((s) => s.state)
  const [statsOffen, setStatsOffen] = useState(false)

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

      {/* Statistiken-Toggle direkt unter der Zusammenfassung */}
      <div className="mb-4 border-t border-slate-700/50 pt-3">
        <button
          onClick={() => setStatsOffen((o) => !o)}
          className="flex w-full items-center justify-between px-1 py-1 text-sm text-slate-400"
        >
          <span>📊 Statistiken</span>
          <span>{statsOffen ? '▲' : '▼'}</span>
        </button>
        {statsOffen && (
          <div className="mt-2 flex flex-col gap-1.5">
            {([
              ['Gesamt verdient', formatGeld(state.gesamtVerdient) + ' €'],
              ['Rekord EPS', formatGeld(state.rekordEps ?? 0) + ' €/s'],
              ['Lieblings-Business', (() => {
                const b = BUSINESSES.reduce<typeof BUSINESSES[0] | null>((best, b) =>
                  !best || (state.businesses[b.id]?.anzahl ?? 0) > (state.businesses[best.id]?.anzahl ?? 0) ? b : best, null)
                return b ? `${b.emoji} ${b.name}` : '—'
              })()],
              ['Stück insgesamt', Object.values(state.businesses).reduce((s, rt) => s + rt.anzahl, 0).toLocaleString('de-DE')],
              ['Manager angestellt', `${Object.values(state.businesses).filter((rt) => rt.hatManager).length}`],
              ['Prestige-Anzahl', `${state.prestigeCount}×`],
              ['Investoren gesamt', state.investoren.toLocaleString('de-DE')],
              ['Schnellste Runde', formatZeit(state.schnellstePrestigeRundeMs ?? 0)],
              ['Manuelle Tipps', (state.gesamtKlicks ?? 0).toLocaleString('de-DE')],
              ['Events aktiviert', `${state.gesamtEventsAktiviert ?? 0}`],
              ['Welten freigeschaltet', `${state.freigeschalteteWelten.length} / 4`],
            ] as [string, string][]).map(([label, wert]) => (
              <div key={label} className="flex items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2">
                <span className="text-sm text-slate-300">{label}</span>
                <span className="font-semibold text-white">{wert}</span>
              </div>
            ))}
          </div>
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
