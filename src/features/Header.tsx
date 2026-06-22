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
  const hilfeOeffnen = useGame((s) => s.hilfeOeffnen)
  const [zeigeDetails, setZeigeDetails] = useState(false)
  const [tonAn, setTonAn] = useState(soundAktiv())

  const proSekunde = einkommenProSekundeGesamt(state)
  const auf = multiplikatorAufschluesselung(state)
  const rang = aktuellerRang(state.gesamtVerdient)
  const weltFarbe = WELT_MAP[aktiveWelt].farbe

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700 bg-slate-900/95 px-4 py-3 text-center backdrop-blur">
      <button
        onClick={hilfeOeffnen}
        aria-label="Tutorial anzeigen"
        className="absolute left-3 top-3 text-lg leading-none opacity-70 active:scale-90"
      >
        ❓
      </button>
      <button
        onClick={() => setTonAn(soundUmschalten())}
        aria-label={tonAn ? 'Ton ausschalten' : 'Ton einschalten'}
        className="absolute right-3 top-3 text-lg leading-none opacity-70 active:scale-90"
      >
        {tonAn ? '🔊' : '🔇'}
      </button>
      <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.22em', color: weltFarbe, opacity: 0.7, fontFamily: 'monospace' }}>
        TAP EMPIRE
      </div>
      <div className="mt-0.5">
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-amber-200"
          style={{ background: 'rgba(245,158,11,0.16)', boxShadow: 'inset 0 0 0 1px rgba(253,230,138,0.25)' }}
        >
          🏅 {rang.titel}
        </span>
      </div>
      <div className="gold-text mt-0.5 text-4xl font-extrabold tracking-tight">{formatGeld(state.geld)} €</div>
      <div className="text-sm text-amber-100/45">{formatGeld(proSekunde)} € / Sekunde</div>
      {auf.gesamt > 1 && (
        <div className="mt-0.5">
          <button onClick={() => setZeigeDetails((v) => !v)} className="text-xs text-amber-400">
            {state.investoren > 0
              ? `${formatGeld(state.investoren)} Investoren`
              : `💎 ${formatGeld(state.diamanten)} Diamanten`}{' '}
            · ×{auf.gesamt.toFixed(2)} Einkommen {zeigeDetails ? '▴' : '▾'}
          </button>
          {zeigeDetails && (
            <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] text-amber-300/80">
              {auf.investoren > 1 && <span>Investoren ×{auf.investoren.toFixed(2)}</span>}
              {auf.talente > 1 && <span>Talente ×{auf.talente.toFixed(2)}</span>}
              {auf.meisterschaft > 1 && <span>Meisterschaft ×{auf.meisterschaft.toFixed(2)}</span>}
              {auf.erfolge > 1 && <span>Erfolge ×{auf.erfolge.toFixed(2)}</span>}
              {auf.welten > 1 && <span>Welten ×{auf.welten.toFixed(2)}</span>}
              {auf.diamanten > 1 && <span style={{ color: '#67e8f9' }}>💎 Diamanten ×{auf.diamanten.toFixed(2)}</span>}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
