import { useState } from 'react'
import { useGameLoop } from './useGameLoop'
import { Header } from './features/Header'
import { BusinessList } from './features/BusinessList'
import { PrestigeScreen } from './features/PrestigeScreen'
import { ErfolgeScreen } from './features/ErfolgeScreen'
import { TabBar, type Tab } from './features/TabBar'
import { WillkommenZurueck } from './features/WillkommenZurueck'

function App() {
  useGameLoop()
  const [tab, setTab] = useState<Tab>('businesses')

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <Header />
      <main className="flex-1 px-3 pb-20">
        {tab === 'businesses' && <BusinessList />}
        {tab === 'prestige' && <PrestigeScreen />}
        {tab === 'erfolge' && <ErfolgeScreen />}
      </main>
      <TabBar tab={tab} setTab={setTab} />
      <WillkommenZurueck />
    </div>
  )
}

export default App
