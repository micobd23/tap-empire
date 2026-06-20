// Kopfzeile: Geld, automatisches Einkommen pro Sekunde und (ab Prestige) der antippbare Multiplikator.
import { useState } from 'react'
import { useGame } from '../store'
import { WELT_MAP } from '../game/config'
import { einkommenProSekundeGesamt, multiplikatorAufschluesselung } from '../game/prestige'
import { aktuellerRang } from '../game/economy'
import { formatGeld } from '../game/format'
import { soundAktiv, soundUmschalten } from '../sound'

export function Header() {
  // Den State einmal auswählen und die abgeleiteten Werte im Render berechnen.
  // (Nicht im Selector ein Objekt erzeugen — das löst in Zustand eine Endlosschleife aus.)
  const state = useGame((s) => s.state)
  const aktiveWelt = useGame((s) => s.aktiveWelt)
  const [zeigeDetails, setZeigeDetails] = useState(false)
  const [tonAn, setTonAn] = useState(soundAktiv())

  const proSekunde = einkommenProSekundeGesamt(state)
  const auf = multiplikatorAufschluesselung(state)
  const rang = aktuellerRang(state.gesamtVerdient)
  const weltFarbe = WELT_MAP[aktiveWelt].farbe

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700 bg-slate-900/95 px-4 py-3 text-center backdrop-blur">
      <button
        onClick={() => setTonAn(soundUmschalten())}
        aria-label={tonAn ? 'Ton ausschalten' : 'Ton einschalten'}
        className="absolute right-3 top-3 text-lg leading-none opacity-70 active:scale-90"
      >
        {tonAn ? '🔊' : '🔇'}
      </button>
      <div className="text-xs font-medium text-amber-300/90">🏅 {rang.titel}</div>
      <div className="text-3xl font-semibold" style={{ color: weltFarbe }}>{formatGeld(state.geld)} €</div>
      <div className="text-sm text-slate-400">{formatGeld(proSekunde)} € / Sekunde</div>
      {state.investoren > 0 && (
        <div className="mt-0.5">
          <button onClick={() => setZeigeDetails((v) => !v)} className="text-xs text-amber-400">
            {formatGeld(state.investoren)} Investoren · ×{auf.gesamt.toFixed(2)} Einkommen {zeigeDetails ? '▴' : '▾'}
          </button>
          {zeigeDetails && (
            <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-amber-300/80">
              <span>Investoren ×{auf.investoren.toFixed(2)}</span>
              <span>Talente ×{auf.talente.toFixed(2)}</span>
              <span>Meisterschaft ×{auf.meisterschaft.toFixed(2)}</span>
              <span>Erfolge ×{auf.erfolge.toFixed(2)}</span>
              {auf.welten > 1 && <span>Welten ×{auf.welten.toFixed(2)}</span>}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
