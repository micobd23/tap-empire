// Spielstand sichern & laden: erzeugt einen kopierbaren Code und spielt ihn wieder ein.
// Wichtig, weil der Fortschritt nur lokal auf dem Gerät liegt (es gibt kein Cloud-Backup).
import { useState } from 'react'
import { useGame } from '../store'

export function SpielstandBackup() {
  const exportieren = useGame((s) => s.spielstandExportieren)
  const importieren = useGame((s) => s.spielstandImportieren)

  const [code, setCode] = useState('')
  const [kopiert, setKopiert] = useState(false)
  const [importText, setImportText] = useState('')
  const [importBestaetige, setImportBestaetige] = useState(false)
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string } | null>(null)

  function sichern() {
    setCode(exportieren())
    setKopiert(false)
  }

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(code)
      setKopiert(true)
    } catch {
      // Zwischenablage nicht verfügbar — der Code steht ja sichtbar zum manuellen Kopieren da.
    }
  }

  function einspielen() {
    const ok = importieren(importText)
    if (ok) {
      setMeldung({ ok: true, text: '✓ Spielstand geladen!' })
      setImportText('')
    } else {
      setMeldung({ ok: false, text: 'Code nicht erkannt — bitte den kompletten Text einfügen.' })
    }
    setImportBestaetige(false)
  }

  return (
    <div className="mt-6 border-t border-slate-800 pt-4">
      <h2 className="text-base font-medium text-slate-100">Spielstand sichern</h2>
      <p className="mb-3 mt-1 text-xs text-slate-400">
        Dein Fortschritt liegt nur auf diesem Gerät. Erstelle einen Sicherungs-Code und bewahre ihn
        auf (z. B. in einer Notiz) — so kannst du ihn nach einer Neuinstallation wieder einspielen.
      </p>

      <button
        onClick={sichern}
        className="w-full rounded-lg bg-slate-800 py-2 text-sm font-medium text-slate-200 active:scale-[0.99]"
      >
        📋 Sicherungs-Code erstellen
      </button>

      {code && (
        <div className="mt-2">
          <textarea
            readOnly
            value={code}
            onFocus={(e) => e.currentTarget.select()}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 p-2 text-[11px] leading-snug text-slate-300"
          />
          <button
            onClick={kopieren}
            className="mt-1 w-full rounded-lg bg-emerald-700 py-1.5 text-sm font-medium text-white"
          >
            {kopiert ? '✓ Kopiert' : 'In die Zwischenablage kopieren'}
          </button>
        </div>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-slate-300">Sicherung einspielen …</summary>
        <p className="mb-2 mt-2 text-xs text-slate-400">Achtung: überschreibt deinen aktuellen Spielstand.</p>
        <textarea
          value={importText}
          onChange={(e) => {
            setImportText(e.target.value)
            setMeldung(null)
            setImportBestaetige(false)
          }}
          rows={3}
          placeholder="Sicherungs-Code hier einfügen"
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 p-2 text-[11px] leading-snug text-slate-300 placeholder:text-slate-600"
        />
        {!importBestaetige ? (
          <button
            onClick={() => setImportBestaetige(true)}
            disabled={importText.trim() === ''}
            className="mt-1 w-full rounded-lg bg-slate-800 py-1.5 text-sm font-medium text-slate-200 disabled:opacity-40"
          >
            Einspielen
          </button>
        ) : (
          <div className="mt-1 flex gap-2">
            <button
              onClick={einspielen}
              className="flex-1 rounded-lg bg-amber-600 py-1.5 text-sm font-medium text-white"
            >
              Ja, überschreiben
            </button>
            <button
              onClick={() => setImportBestaetige(false)}
              className="flex-1 rounded-lg bg-slate-700 py-1.5 text-sm text-slate-200"
            >
              Abbrechen
            </button>
          </div>
        )}
        {meldung && (
          <p className={`mt-2 text-xs ${meldung.ok ? 'text-emerald-400' : 'text-red-400'}`}>{meldung.text}</p>
        )}
      </details>
    </div>
  )
}
