// Startet den Spiel-Takt: alle 100 ms ein Tick, dazu Autosave und Speichern beim Verlassen.
import { useEffect } from 'react'
import { useGame } from './store'

export function useGameLoop() {
  useEffect(() => {
    let last = performance.now()
    const tickId = setInterval(() => {
      const now = performance.now()
      const delta = now - last
      last = now
      useGame.getState().tickStore(delta)
    }, 100)

    const saveId = setInterval(() => useGame.getState().speichernJetzt(), 15000)

    const speichern = () => useGame.getState().speichernJetzt()
    document.addEventListener('visibilitychange', speichern)
    window.addEventListener('beforeunload', speichern)

    return () => {
      clearInterval(tickId)
      clearInterval(saveId)
      document.removeEventListener('visibilitychange', speichern)
      window.removeEventListener('beforeunload', speichern)
    }
  }, [])
}
