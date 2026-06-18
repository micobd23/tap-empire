// Untere Navigationsleiste: Businesses / Prestige / Erfolge — nur Symbole,
// damit unten Platz bleibt. Aktiv = volle Deckkraft + farbiger Balken oben.
import { useGame } from '../store'
import { kannPrestige } from '../game/prestige'

export type Tab = 'businesses' | 'prestige' | 'erfolge'

export function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const kann = useGame((s) => kannPrestige(s.state))

  const knopf = (ziel: Tab, emoji: string, balken: string, punkt = false) => (
    <button
      onClick={() => setTab(ziel)}
      aria-label={ziel}
      className={`relative flex-1 py-3 text-center text-2xl transition-opacity ${
        tab === ziel ? 'opacity-100' : 'opacity-40'
      }`}
    >
      {tab === ziel && <span className={`absolute inset-x-0 top-0 mx-auto h-0.5 w-8 rounded-full ${balken}`} />}
      <span className="relative inline-block">
        {emoji}
        {punkt && <span className="absolute -right-1.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />}
      </span>
    </button>
  )

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-md -translate-x-1/2 border-t border-slate-700 bg-slate-900 pb-[env(safe-area-inset-bottom)]">
      {knopf('businesses', '🏪', 'bg-emerald-400')}
      {knopf('prestige', '⭐', 'bg-amber-400', kann)}
      {knopf('erfolge', '🏆', 'bg-emerald-400')}
    </nav>
  )
}
