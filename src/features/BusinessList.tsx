// Die Liste aller Businesses, mit dem Kaufmengen-Umschalter (×1 / ×10 / ×100 / Max) oben.
import { AUTO_KAUFER_AB_PRESTIGE, BUSINESSES } from '../game/config'
import { useGame, type KaufModus } from '../store'
import { BusinessCard } from './BusinessCard'

const MODI: KaufModus[] = [1, 10, 100, 'max']

export function BusinessList() {
  const kaufModus = useGame((s) => s.kaufModus)
  const setKaufModus = useGame((s) => s.setKaufModus)
  const autoKauf = useGame((s) => s.state.autoKauf)
  const autoKaufFrei = useGame((s) => s.state.prestigeCount >= AUTO_KAUFER_AB_PRESTIGE)
  const autoKaufUmschalten = useGame((s) => s.autoKaufUmschalten)

  return (
    <div className="pt-3">
      <div className="mb-2 flex gap-1">
        {MODI.map((m) => (
          <button
            key={String(m)}
            onClick={() => setKaufModus(m)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
              kaufModus === m ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {m === 'max' ? 'Max' : `×${m}`}
          </button>
        ))}
      </div>

      {autoKaufFrei && (
        <button
          onClick={autoKaufUmschalten}
          className={`mb-2 flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-sm font-medium ${
            autoKauf ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          🤖 Auto-Käufer {autoKauf ? 'an' : 'aus'}
        </button>
      )}

      {BUSINESSES.map((b) => (
        <BusinessCard key={b.id} id={b.id} />
      ))}
    </div>
  )
}
