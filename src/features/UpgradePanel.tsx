// Kompaktes Upgrade-Panel, das unter einer Business-Karte aufklappt.
import { useGame } from '../store'
import { UPGRADES_BY_BUSINESS } from '../game/config'
import { formatGeld } from '../game/format'

interface Props {
  businessId: string
  weltFarbe: string
}

export function UpgradePanel({ businessId, weltFarbe }: Props) {
  const upgrades = UPGRADES_BY_BUSINESS[businessId] ?? []
  const geld = useGame((s) => s.state.geld)
  const gekauft = useGame((s) => s.state.gekaufteUpgrades ?? [])
  const upgradeKaufen = useGame((s) => s.upgradeKaufen)

  return (
    <div className="mt-1 flex flex-col gap-1 rounded-lg bg-slate-900/70 p-2">
      {upgrades.map((u) => {
        const istGekauft = gekauft.includes(u.id)
        const kannKaufen = !istGekauft && geld >= u.kosten
        return (
          <div
            key={u.id}
            className="flex items-center gap-2"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className={`text-xs font-medium ${istGekauft ? 'text-slate-400' : 'text-slate-200'}`}>
                {u.name}
              </span>
              <span className="text-[10px] text-slate-500">{u.beschreibung}</span>
            </div>
            {istGekauft ? (
              <span className="shrink-0 rounded px-2 py-0.5 text-xs" style={{ color: weltFarbe }}>
                ✓ Aktiv
              </span>
            ) : (
              <button
                onClick={() => upgradeKaufen(u.id)}
                disabled={!kannKaufen}
                className="shrink-0 whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium text-white disabled:bg-slate-700 disabled:text-slate-500"
                style={kannKaufen ? { background: weltFarbe } : undefined}
              >
                {formatGeld(u.kosten)} €
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
