// Der Talentbaum: fünf Äste (Spalten) mit Knoten, die man mit Talentpunkten freischaltet.
// Der letzte Knoten je Ast ist ein Endlos-Knoten: beliebig oft kaufbar, je Stufe teurer.
import { useGame } from '../store'
import { ASTE, TALENTE, TALENT_MAP } from '../game/config'
import {
  naechsteKosten,
  talentGekauft,
  talentGesperrt,
  talentKaufbar,
  talentStufe,
} from '../game/talents'

// Emoji je Ast — rein zur besseren Orientierung im Talentbaum.
const AST_EMOJI: Record<string, string> = {
  Wirtschaft: '💰',
  Tempo: '⚡',
  Kapital: '🏦',
  Offline: '🌙',
  Meisterschaft: '🏅',
}

export function TalentBaum() {
  const state = useGame((s) => s.state)
  const talentKaufen = useGame((s) => s.talentKaufen)

  return (
    <div className="grid grid-cols-2 gap-2 pb-4">
      {ASTE.map((ast) => (
        <div key={ast} className="flex flex-col gap-2">
          <div className="text-center text-xs font-medium text-slate-400">{AST_EMOJI[ast]} {ast}</div>
          {TALENTE.filter((t) => t.ast === ast).map((t) => {
            const stufe = talentStufe(state.talents, t.id)
            const aktiv = talentGekauft(state.talents, t.id)
            const kaufbar = talentKaufbar(state, t.id)
            const gesperrt = talentGesperrt(state.talents, t.id)
            const kosten = naechsteKosten(t, state.talents)

            return (
              <button
                key={t.id}
                onClick={() => talentKaufen(t.id)}
                disabled={!kaufbar}
                className={`rounded-lg border p-2 text-left ${
                  kaufbar
                    ? 'border-amber-500 bg-amber-950/30'
                    : aktiv
                      ? 'border-emerald-600 bg-emerald-950/40'
                      : 'border-slate-700 bg-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-xs font-medium text-slate-100">{t.name}</span>
                  {t.endlos && (
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-400">
                      ♾️{stufe > 0 ? ` Lv ${stufe}` : ''}
                    </span>
                  )}
                </div>
                <div className="text-[11px] leading-tight text-slate-400">{t.beschreibung}</div>
                <div className={`mt-1 text-[11px] ${aktiv && !t.endlos ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {gesperrt
                    ? `🔒 nach «${TALENT_MAP[t.voraussetzung!].name}»`
                    : t.endlos
                      ? `${kosten} TP`
                      : aktiv
                        ? '✓ aktiv'
                        : `${kosten} TP`}
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
