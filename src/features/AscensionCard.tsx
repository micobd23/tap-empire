// Ascension-Karte (Meta-Prestige) im Prestige-Tab. Erscheint erst, wenn die Schwelle
// erreicht ist. Harter Reset gegen dauerhafte Diamanten 💎 (permanenter Einkommens-Bonus).
import { useState } from 'react'
import { useGame } from '../store'
import {
  ascensionFreigeschaltet,
  diamantBonusFaktor,
  kannAscension,
  neueDiamantenVorschau,
} from '../game/ascension'
import { ASCENSION_BASIS, DIAMANT_BONUS } from '../game/config'
import { formatGeld } from '../game/format'
import { soundPrestige } from '../sound'

const DIAMANT = '#22d3ee' // Cyan/Diamant-Akzent, hebt sich von Prestige-Gold ab

export function AscensionCard() {
  const state = useGame((s) => s.state)
  const ascension = useGame((s) => s.ascension)
  const [bestaetige, setBestaetige] = useState(false)
  const [flash, setFlash] = useState(false)

  // Vor der Freischaltung gar nicht anzeigen — hält den Screen fürs Frühspiel sauber.
  if (!ascensionFreigeschaltet(state)) return null

  const diamanten = state.diamanten
  const vorschau = neueDiamantenVorschau(state)
  const kann = kannAscension(state)
  const aktuellerBonus = diamantBonusFaktor(state)
  const bonusNachher = 1 + (diamanten + vorschau) * DIAMANT_BONUS
  const fortschritt = Math.min(100, (state.gesamtVerdient / ASCENSION_BASIS) * 100)

  return (
    <div
      className="mb-4 rounded-2xl p-4 text-center"
      style={{ background: 'rgba(8,40,48,0.45)', border: `1px solid ${DIAMANT}55` }}
    >
      {flash && <div className="prestige-flash pointer-events-none fixed inset-0 z-50" />}

      <div className="text-2xl leading-none">💎</div>
      <p className="mt-1 text-sm font-semibold" style={{ color: DIAMANT }}>
        Ascension
      </p>
      <p className="mt-0.5 text-xs text-cyan-200/70">
        {diamanten > 0
          ? `${formatGeld(diamanten)} Diamanten · ×${aktuellerBonus.toFixed(2)} Einkommen`
          : 'Steige auf und beginne stärker neu'}
      </p>

      {kann ? (
        <>
          <p className="mt-3 text-3xl font-semibold" style={{ color: DIAMANT }}>
            +{formatGeld(vorschau)} <span className="text-lg">Diamanten</span>
          </p>
          <p className="mt-1 text-xs text-cyan-200/70">
            Bonus ×{aktuellerBonus.toFixed(2)} → ×{bonusNachher.toFixed(2)}
          </p>

          {!bestaetige ? (
            <button
              onClick={() => setBestaetige(true)}
              className="mt-3 w-full rounded-lg py-2.5 font-medium text-white active:scale-[0.99]"
              style={{ background: '#0e7490' }}
            >
              Aufsteigen (Ascension)
            </button>
          ) : (
            <div className="mt-3">
              <p className="mb-2 text-sm text-slate-200">
                Sicher? <strong>Alles</strong> aus der Prestige-Ebene wird zurückgesetzt — Geld,
                Businesses, Welten, Investoren, Talente und Prestige-Level. Diamanten, Erfolge und
                Business-Upgrades bleiben.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    soundPrestige()
                    setFlash(true)
                    setTimeout(() => setFlash(false), 700)
                    ascension()
                    setBestaetige(false)
                  }}
                  className="flex-1 rounded-lg py-2 font-medium text-white"
                  style={{ background: '#0891b2' }}
                >
                  Ja, aufsteigen
                </button>
                <button
                  onClick={() => setBestaetige(false)}
                  className="flex-1 rounded-lg bg-slate-700 py-2 text-slate-200"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-cyan-200/70">
            <span>Fortschritt zur nächsten Ascension</span>
            <span>{formatGeld(state.gesamtVerdient)} / {formatGeld(ASCENSION_BASIS)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${fortschritt.toFixed(1)}%`, background: DIAMANT }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Jeder Diamant gibt dauerhaft +{Math.round(DIAMANT_BONUS * 100)} % Einkommen — auch über
            Ascensions hinweg.
          </p>
        </div>
      )}
    </div>
  )
}
