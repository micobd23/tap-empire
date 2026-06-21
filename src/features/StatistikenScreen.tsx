// Statistiken-Tab: zeigt allgemeine Spielstatistiken ohne Spielmechanik-Einfluss.
import { useGame } from '../store'
import { BUSINESSES } from '../game/config'
import { formatGeld } from '../game/format'

function Zeile({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="font-semibold text-white">{wert}</span>
    </div>
  )
}

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{titel}</h2>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

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

export function StatistikenScreen() {
  const state = useGame((s) => s.state)

  const meistgespieltesId = BUSINESSES.reduce<string | null>((beste, b) => {
    if (!beste) return b.id
    return (state.businesses[b.id]?.anzahl ?? 0) > (state.businesses[beste]?.anzahl ?? 0) ? b.id : beste
  }, null)
  const meistgespieltes = meistgespieltesId
    ? BUSINESSES.find((b) => b.id === meistgespieltesId)
    : null

  return (
    <div className="pt-3">
      <Abschnitt titel="Einkommen">
        <Zeile label="Gesamt verdient" wert={formatGeld(state.gesamtVerdient)} />
        <Zeile label="Rekord EPS" wert={`${formatGeld(state.rekordEps ?? 0)} / s`} />
      </Abschnitt>

      <Abschnitt titel="Businesses">
        <Zeile
          label="Lieblings-Business"
          wert={meistgespieltes ? `${meistgespieltes.emoji} ${meistgespieltes.name}` : '—'}
        />
        <Zeile
          label="Stück insgesamt"
          wert={Object.values(state.businesses).reduce((s, rt) => s + rt.anzahl, 0).toLocaleString('de-DE')}
        />
        <Zeile label="Manager angestellt" wert={`${Object.values(state.businesses).filter((rt) => rt.hatManager).length}`} />
      </Abschnitt>

      <Abschnitt titel="Prestige">
        <Zeile label="Prestige-Anzahl" wert={`${state.prestigeCount}×`} />
        <Zeile label="Investoren gesamt" wert={state.investoren.toLocaleString('de-DE')} />
        <Zeile
          label="Schnellste Runde"
          wert={formatZeit(state.schnellstePrestigeRundeMs ?? 0)}
        />
      </Abschnitt>

      <Abschnitt titel="Aktivität">
        <Zeile label="Manuelle Tipps" wert={(state.gesamtKlicks ?? 0).toLocaleString('de-DE')} />
        <Zeile label="Events aktiviert" wert={`${state.gesamtEventsAktiviert ?? 0}`} />
        <Zeile label="Erfolge abgeholt" wert={`${state.erfolgeAbgeholt.length} / 46`} />
        <Zeile label="Welten freigeschaltet" wert={`${state.freigeschalteteWelten.length} / 4`} />
      </Abschnitt>
    </div>
  )
}
