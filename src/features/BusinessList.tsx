// Die Business-Liste: oben Welt-Umschalter, dann Kaufmengen (×1/×10/×100/Max), dann die Businesses.
import { AUTO_KAUFER_AB_PRESTIGE, BUSINESSES, WELTEN, WELT_MAP } from '../game/config'
import { useGame, type KaufModus } from '../store'
import { formatGeld } from '../game/format'
import { BusinessCard } from './BusinessCard'

const MODI: KaufModus[] = [1, 10, 100, 'max']

export function BusinessList() {
  const kaufModus = useGame((s) => s.kaufModus)
  const setKaufModus = useGame((s) => s.setKaufModus)
  const autoKauf = useGame((s) => s.state.autoKauf)
  const autoKaufFrei = useGame((s) => s.state.prestigeCount >= AUTO_KAUFER_AB_PRESTIGE)
  const autoKaufUmschalten = useGame((s) => s.autoKaufUmschalten)
  const freigeschaltet = useGame((s) => s.state.freigeschalteteWelten)
  const geld = useGame((s) => s.state.geld)
  const aktiveWelt = useGame((s) => s.aktiveWelt)
  const setAktiveWelt = useGame((s) => s.setAktiveWelt)
  const weltFreischalten = useGame((s) => s.weltFreischalten)

  // Im Umschalter zeigen wir alle freigeschalteten Welten + die nächste gesperrte (als Spar-Ziel).
  const sichtbareWelten: typeof WELTEN = []
  for (const w of WELTEN) {
    sichtbareWelten.push(w)
    if (!freigeschaltet.includes(w.id)) break // bei der ersten gesperrten Welt aufhören
  }

  return (
    <div className="pt-3">
      {/* Welt-Umschalter — erscheint, sobald es eine zweite Welt zu sehen/freizuschalten gibt. */}
      {sichtbareWelten.length > 1 && (
        <div className="mb-2 flex gap-1">
          {sichtbareWelten.map((w) => {
            if (freigeschaltet.includes(w.id)) {
              return (
                <button
                  key={w.id}
                  onClick={() => setAktiveWelt(w.id)}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
                    aktiveWelt === w.id ? 'text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                  style={aktiveWelt === w.id ? { background: WELT_MAP[w.id].farbe } : undefined}
                >
                  {w.emoji} {w.name}
                </button>
              )
            }
            // Noch gesperrt: Freischalt-Knopf. Leuchtet (pulsiert), sobald genug Geld da ist.
            const leistbar = geld >= w.freischaltKosten
            return (
              <button
                key={w.id}
                onClick={() => weltFreischalten(w.id)}
                disabled={!leistbar}
                title={`${w.emoji} ${w.name} freischalten (+${Math.round(w.bonus * 100)} % Einkommen)`}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${
                  leistbar ? 'animate-pulse bg-amber-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                🔒 {w.emoji} {formatGeld(w.freischaltKosten)} €
              </button>
            )
          })}
        </div>
      )}

      <div className="mb-2 flex gap-1">
        {/* Kaufmenge als EIN kompakter Knopf, der durch ×1 → ×10 → ×100 → Max springt. */}
        <button
          onClick={() => setKaufModus(MODI[(MODI.indexOf(kaufModus) + 1) % MODI.length])}
          title="Tippen wechselt die Kaufmenge: ×1 → ×10 → ×100 → Max"
          className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200"
        >
          ↻ {kaufModus === 'max' ? 'Max' : `×${kaufModus}`}
        </button>
        {autoKaufFrei && (
          <button
            onClick={autoKaufUmschalten}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
              autoKauf ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            🤖 Auto-Käufer {autoKauf ? 'an' : 'aus'}
          </button>
        )}
      </div>

      {BUSINESSES.filter((b) => b.welt === aktiveWelt).map((b) => (
        <BusinessCard key={b.id} id={b.id} />
      ))}
    </div>
  )
}
