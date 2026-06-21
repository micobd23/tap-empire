// Der Prestige-Bildschirm: Investoren-Vorschau, Neustart-Knopf, Talentbaum und Spielstand-Reset.
import { useState } from 'react'
import { useGame } from '../store'
import {
  empfohleneNeueInvestoren,
  globalerEinkommensMultiplikator,
  kannPrestige,
  multNachPrestige,
  neueInvestorenVorschau,
  prestigeLohntSich,
  rundenSchwelle,
  rundenVerdienst,
  tpGewinnVorschau,
} from '../game/prestige'
import { verfuegbareTalentpunkte } from '../game/talents'
import { formatGeld } from '../game/format'
import { soundPrestige } from '../sound'
import { TalentBaum } from './TalentBaum'
import { SpielstandBackup } from './SpielstandBackup'
import { AscensionCard } from './AscensionCard'

export function PrestigeScreen() {
  const vorschau = useGame((s) => neueInvestorenVorschau(s.state))
  const mult = useGame((s) => globalerEinkommensMultiplikator(s.state))
  const verfTP = useGame((s) => verfuegbareTalentpunkte(s.state))
  const kann = useGame((s) => kannPrestige(s.state))
  const multNachher = useGame((s) => multNachPrestige(s.state))
  const lohntSich = useGame((s) => prestigeLohntSich(s.state))
  const empfohlen = useGame((s) => empfohleneNeueInvestoren(s.state))
  const prestige = useGame((s) => s.prestige)
  const zuruecksetzen = useGame((s) => s.spielstandZuruecksetzen)
  const rundenErtrag = useGame((s) => rundenVerdienst(s.state))
  const schwelle = useGame((s) => rundenSchwelle(s.state.prestigeCount))
  const tpVorschau = useGame((s) => tpGewinnVorschau(s.state))
  const [bestaetige, setBestaetige] = useState(false)
  const [resetBestaetige, setResetBestaetige] = useState(false)
  const [flash, setFlash] = useState(false)

  return (
    <div className="pt-3">
      {flash && <div className="prestige-flash pointer-events-none fixed inset-0 z-50" />}

      {/* Ascension (Meta-Prestige) — erscheint erst im tiefen Endgame. */}
      <AscensionCard />

      <div className="mb-4 rounded-2xl border border-amber-700/50 bg-amber-950/30 p-4 text-center">
        <p className="text-sm text-amber-300/80">Neustart bringt dir</p>
        <p className="text-3xl font-semibold text-amber-300">
          +{formatGeld(vorschau)} <span className="text-lg">Investoren</span>
        </p>
        <p className="mt-1 text-xs text-amber-300/70">
          ×{mult.toFixed(2)} → ×{multNachher.toFixed(2)} Einkommen
        </p>
        {kann && (
          <p className="mt-0.5 text-xs text-emerald-300/80">
            🌳 +{tpVorschau} Talentpunkt{tpVorschau === 1 ? '' : 'e'}
          </p>
        )}

        {/* Runden-Fortschrittsbalken — verschwindet sobald Prestige freigeschaltet ist */}
        {!kann && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-amber-300/70">
              <span>Runden-Verdienst</span>
              <span>{formatGeld(rundenErtrag)} / {formatGeld(schwelle)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (rundenErtrag / schwelle) * 100).toFixed(1)}%` }}
              />
            </div>
            {rundenErtrag < schwelle ? (
              <p className="mt-3 rounded-lg bg-slate-800/60 py-2 text-sm text-slate-400">
                Verdiene diese Runde noch {formatGeld(schwelle - rundenErtrag)}, um prestige-n zu können.
              </p>
            ) : (
              <p className="mt-3 rounded-lg bg-slate-800/60 py-2 text-sm text-slate-400">
                Verdiene noch etwas mehr — du brauchst mindestens 1 neuen Investor.
              </p>
            )}
          </div>
        )}

        {kann && (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              lohntSich ? 'bg-emerald-950/40 text-emerald-300' : 'bg-amber-950/30 text-amber-300/90'
            }`}
          >
            {lohntSich
              ? '✓ Guter Zeitpunkt — deine Investoren machen einen kräftigen Sprung.'
              : `⏳ Geht schon — richtig lohnen tut es sich ab etwa +${formatGeld(empfohlen)} Investoren (gerade wären es +${formatGeld(vorschau)}).`}
          </p>
        )}

        {kann && !bestaetige && (
          <button
            onClick={() => setBestaetige(true)}
            className="mt-3 w-full rounded-lg bg-amber-700 py-2.5 font-medium text-white active:scale-[0.99]"
          >
            Imperium verkaufen & neu starten
          </button>
        )}

        {kann && bestaetige && (
          <div className="mt-3">
            <p className="mb-2 text-sm text-slate-200">
              Sicher? Geld, Businesses und Manager werden zurückgesetzt — Investoren, Talente und
              Auto-Manager bleiben.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundPrestige()
                  setFlash(true)
                  setTimeout(() => setFlash(false), 700)
                  prestige()
                  setBestaetige(false)
                }}
                className="flex-1 rounded-lg bg-amber-600 py-2 font-medium text-white"
              >
                Ja, neu starten
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
      </div>

      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-base font-medium text-slate-100">Talentbaum</h2>
        <span className="rounded-md bg-slate-800 px-2 py-1 text-sm text-amber-300">{verfTP} Talentpunkte</span>
      </div>

      <TalentBaum />

      <SpielstandBackup />

      <div className="mt-6 border-t border-slate-800 pt-4 text-center">
        {!resetBestaetige ? (
          <button onClick={() => setResetBestaetige(true)} className="text-xs text-slate-500 underline">
            Kompletten Spielstand zurücksetzen
          </button>
        ) : (
          <div>
            <p className="mb-2 text-xs text-red-400">
              Wirklich ALLES löschen? Auch Investoren, Talente und Prestige-Level gehen verloren.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  zuruecksetzen()
                  setResetBestaetige(false)
                }}
                className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white"
              >
                Ja, alles löschen
              </button>
              <button
                onClick={() => setResetBestaetige(false)}
                className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-slate-200"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
