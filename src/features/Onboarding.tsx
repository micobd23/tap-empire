// Kurzer Einstieg für neue Spieler: erklärt die Kernschleife in wenigen Schritten.
// Erscheint nur beim allerersten Start (kein Flag gesetzt UND noch nichts verdient),
// damit bestehende Spielstände nicht gestört werden.
import { useState } from 'react'
import { useGame } from '../store'

const SCHLUESSEL = 'te-onboarding'

const SCHRITTE = [
  {
    emoji: '🍋',
    titel: 'Tippe dein erstes Geschäft',
    text: 'Tippe auf den Limonadenstand, um Geld zu verdienen. Jeder Tipp bringt dir Münzen.',
  },
  {
    emoji: '🛒',
    titel: 'Kaufe mehr',
    text: 'Mit dem grünen Kaufen-Knopf holst du dir mehr Geschäfte — jedes verdient zusätzlich. Halte den Knopf gedrückt für Mehrfachkauf.',
  },
  {
    emoji: '🧑‍💼',
    titel: 'Stell einen Manager ein',
    text: 'Ein Manager führt ein Geschäft automatisch weiter — auch wenn du offline bist. So läuft das Geld von ganz allein.',
  },
  {
    emoji: '⭐',
    titel: 'Wachse mit Prestige',
    text: 'Später startest du neu und bekommst Investoren für einen dauerhaften Bonus. Aber das kommt mit der Zeit — leg einfach los!',
  },
]

export function Onboarding() {
  // Nur für echte Neulinge: einmalig beim Mount entscheiden (stabil bis weggeklickt).
  const [zeige, setZeige] = useState(() => {
    try {
      return !localStorage.getItem(SCHLUESSEL) && useGame.getState().state.gesamtVerdient === 0
    } catch {
      return false
    }
  })
  const [schritt, setSchritt] = useState(0)

  if (!zeige) return null

  function fertig() {
    try {
      localStorage.setItem(SCHLUESSEL, 'gesehen')
    } catch {
      // localStorage nicht verfügbar — dann erscheint es eben in dieser Sitzung erneut.
    }
    setZeige(false)
  }

  const s = SCHRITTE[schritt]
  const letzter = schritt === SCHRITTE.length - 1

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-800 p-6 text-center">
        <div className="text-4xl">{s.emoji}</div>
        <h2 className="mt-2 text-lg font-semibold text-slate-100">{s.titel}</h2>
        <p className="mt-2 text-sm text-slate-300">{s.text}</p>

        {/* Fortschrittspunkte */}
        <div className="mt-4 flex justify-center gap-1.5">
          {SCHRITTE.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === schritt ? 'bg-emerald-400' : 'bg-slate-600'}`}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {!letzter && (
            <button
              onClick={fertig}
              className="flex-1 rounded-lg bg-slate-700 py-2 text-sm text-slate-300"
            >
              Überspringen
            </button>
          )}
          <button
            onClick={() => (letzter ? fertig() : setSchritt((n) => n + 1))}
            className="flex-1 rounded-lg bg-emerald-600 py-2 font-medium text-white active:scale-[0.99]"
          >
            {letzter ? "Los geht's!" : 'Weiter'}
          </button>
        </div>
      </div>
    </div>
  )
}
