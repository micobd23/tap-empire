import { useState } from 'react'
import { useGameLoop } from './useGameLoop'
import { useGame } from './store'
import { WELT_MAP } from './game/config'
import { Header } from './features/Header'
import { BusinessList } from './features/BusinessList'
import { PrestigeScreen } from './features/PrestigeScreen'
import { ErfolgeScreen } from './features/ErfolgeScreen'
import { TabBar, type Tab } from './features/TabBar'
import { WillkommenZurueck } from './features/WillkommenZurueck'
import { Onboarding } from './features/Onboarding'
import { EventBanner } from './features/EventBanner'

function App() {
  useGameLoop()
  const [tab, setTab] = useState<Tab>('businesses')
  const aktiveWelt = useGame((s) => s.aktiveWelt)
  const weltFarbe = WELT_MAP[aktiveWelt].farbe

  return (
    <div className="relative mx-auto flex min-h-full max-w-md flex-col">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: -1,
          backgroundImage: `
            radial-gradient(ellipse 100% 55% at 0% 0%, ${weltFarbe}40, transparent 60%),
            radial-gradient(ellipse 70% 50% at 100% 100%, rgba(99,102,241,0.18), transparent 60%),
            radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 22px 22px',
        }}
      />
      <Header />
      <main className="flex-1 px-3 pb-20">
        {tab === 'businesses' && <BusinessList />}
        {tab === 'prestige' && <PrestigeScreen />}
        {tab === 'erfolge' && <ErfolgeScreen />}
      </main>
      <TabBar tab={tab} setTab={setTab} />
      <WillkommenZurueck />
      <Onboarding />
      <EventBanner />
    </div>
  )
}

export default App
