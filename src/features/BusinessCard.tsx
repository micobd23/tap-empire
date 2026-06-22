// Eine Business-Karte: antippen zum Produzieren (mit fliegender +X), kaufen, Manager anstellen.
import { useEffect, useRef, useState } from 'react'
import { useGame } from '../store'
import { BALKEN_VOLL_AB_MS, BUSINESS_MAP, MEILENSTEINE, UPGRADES_BY_BUSINESS, WELT_MAP } from '../game/config'
import { ertragProZyklus, kostenFuer, maxKaufbar, tempoMeilensteinFaktor, upgradeEffekte } from '../game/economy'
import { globalerEinkommensMultiplikator } from '../game/prestige'
import { talentEffekte } from '../game/talents'
import { formatGeld, formatWartezeit } from '../game/format'
import { einkommenProSekundeGesamt } from '../game/prestige'
import { soundKauf, soundMeilenstein, soundTap } from '../sound'
import { UpgradePanel } from './UpgradePanel'

export function BusinessCard({ id }: { id: string }) {
  const b = BUSINESS_MAP[id]
  const anzahl = useGame((s) => s.state.businesses[id].anzahl)
  const hatManager = useGame((s) => s.state.businesses[id].hatManager)
  const fortschrittMs = useGame((s) => s.state.businesses[id].fortschrittMs)
  const laeuft = useGame((s) => s.state.businesses[id].laeuft)
  const geld = useGame((s) => s.state.geld)
  const kaufModus = useGame((s) => s.kaufModus)
  const mult = useGame((s) => globalerEinkommensMultiplikator(s.state))
  const zyklusFaktor = useGame((s) => talentEffekte(s.state.talents).zyklusFaktor)
  const managerRabatt = useGame((s) => talentEffekte(s.state.talents).managerRabatt)
  const gekaufteUpgrades = useGame((s) => s.state.gekaufteUpgrades ?? [])
  const kaufen = useGame((s) => s.kaufen)
  const antippen = useGame((s) => s.antippen)
  const managerKaufen = useGame((s) => s.managerKaufen)

  const [upgradeOffen, setUpgradeOffen] = useState(false)
  const [floats, setFloats] = useState<{ key: number; wert: number }[]>([])
  // Münz-Partikel (mit zufälliger Flugbahn) und der Pop-Zähler fürs Emoji.
  const [muenzen, setMuenzen] = useState<{ key: number; dx: number; dy: number }[]>([])
  const [popKey, setPopKey] = useState(0)
  // Kurzes Aufblitzen, wenn ein Meilenstein überschritten wird.
  const [blitz, setBlitz] = useState(false)
  const vorigeAnzahl = useRef(anzahl)

  // Erkennt beim Kauf, ob eine Meilenstein-Schwelle (25/50/100/…) übersprungen wurde.
  useEffect(() => {
    const vor = vorigeAnzahl.current
    vorigeAnzahl.current = anzahl
    if (anzahl > vor && MEILENSTEINE.some((m) => vor < m && anzahl >= m)) {
      setBlitz(true)
      soundMeilenstein()
      const t = window.setTimeout(() => setBlitz(false), 600)
      return () => clearTimeout(t)
    }
  }, [anzahl])

  const weltFarbe = WELT_MAP[b.welt].farbe
  const weltTint = WELT_MAP[b.welt].farbeTint

  const aktiv = anzahl > 0
  const tempoFaktor = tempoMeilensteinFaktor(anzahl)
  const { ertragFaktor, tempoDivisor } = upgradeEffekte(id, gekaufteUpgrades)
  const dauer = (b.dauerMs / tempoDivisor) * zyklusFaktor * tempoFaktor
  const laeuftGerade = aktiv && (hatManager || laeuft)
  // Nur im Automatik-Betrieb (Manager) den Balken bei Sekundentakt einfach voll lassen,
  // statt ihn flackern zu lassen. Tippt man selbst, läuft er bewusst durch — als Feedback.
  const prozent = !laeuftGerade
    ? 0
    : hatManager && dauer <= BALKEN_VOLL_AB_MS
      ? 100
      : Math.min(100, (fortschrittMs / dauer) * 100)
  const ertrag = ertragProZyklus(b, Math.max(anzahl, 1), ertragFaktor) * mult
  // Pro-Sekunde-Wert für die Anzeige — macht schnelle und langsame Businesses vergleichbar.
  const ertragProSekunde = ertrag / (dauer / 1000)
  const managerKosten = b.managerKosten * (1 - managerRabatt)

  const eps = useGame((s) => einkommenProSekundeGesamt(s.state))

  const naechsterMeilenstein = MEILENSTEINE.find((m) => m > anzahl) ?? null
  const meilensteinBasis = naechsterMeilenstein !== null
    ? (MEILENSTEINE[MEILENSTEINE.indexOf(naechsterMeilenstein) - 1] ?? 0)
    : 0
  const meilensteinProzent = naechsterMeilenstein !== null
    ? Math.min(100, ((anzahl - meilensteinBasis) / (naechsterMeilenstein - meilensteinBasis)) * 100)
    : 100

  const maxMenge = maxKaufbar(b, anzahl, geld)
  const menge = kaufModus === 'max' ? Math.max(maxMenge, 1) : kaufModus
  const kosten = kostenFuer(b, anzahl, menge)
  const kannKaufen = kaufModus === 'max' ? maxMenge >= 1 : geld >= kosten

  // Der einzelne Kauf läuft über onClick — auf dem iPhone das zuverlässigste Touch-Ereignis
  // (onPointerDown wurde dort oft verschluckt). Hält man den Knopf, kommen nach kurzer Zeit
  // automatisch Wiederholungen dazu. mengeRef hält immer die aktuelle Menge (Max-Modus zählt mit).
  const mengeRef = useRef(menge)
  // Ref nach jedem Render aktualisieren (nicht während des Renders — das verbietet React).
  useEffect(() => {
    mengeRef.current = menge
  })
  const startRef = useRef<number | null>(null)
  const wiederholRef = useRef<number | null>(null)

  function haltStop() {
    if (startRef.current !== null) {
      clearTimeout(startRef.current)
      startRef.current = null
    }
    if (wiederholRef.current !== null) {
      clearInterval(wiederholRef.current)
      wiederholRef.current = null
    }
  }

  function haltStart(e: React.PointerEvent) {
    // Verhindert, dass iOS den Hold als Scroll-Geste interpretiert und pointercancel feuert.
    e.preventDefault()
    if (startRef.current !== null || wiederholRef.current !== null) return
    startRef.current = window.setTimeout(() => {
      wiederholRef.current = window.setInterval(() => kaufen(id, mengeRef.current), 120)
    }, 350)
    // { once: true } → Listener entfernt sich selbst, kein Referenz-Problem bei Re-renders.
    window.addEventListener('pointerup', haltStop, { once: true })
    window.addEventListener('pointercancel', haltStop, { once: true })
  }

  // Sicherheitsnetz: Timer stoppen, falls die Karte verschwindet.
  useEffect(() => haltStop, [])

  function handleTap() {
    if (!aktiv || hatManager || laeuft) return
    antippen(id)
    soundTap()
    // Vibration wirkt nur auf Android — iOS-Safari ignoriert die API (schadet aber nicht).
    if ('vibrate' in navigator) navigator.vibrate(8)
    const key = Date.now() + Math.random()
    setFloats((f) => [...f, { key, wert: ertrag }])
    setTimeout(() => setFloats((f) => f.filter((x) => x.key !== key)), 900)
    // Ein paar Münzen in zufällige Richtungen wegspritzen lassen.
    const neue = Array.from({ length: 4 }, (_, i) => ({
      key: key + i + 1,
      dx: (Math.random() - 0.5) * 60,
      dy: -30 - Math.random() * 40,
    }))
    setMuenzen((m) => [...m, ...neue])
    setTimeout(() => {
      const keys = new Set(neue.map((n) => n.key))
      setMuenzen((m) => m.filter((x) => !keys.has(x.key)))
    }, 700)
    // Emoji kurz aufpoppen (Key-Wechsel startet die CSS-Animation neu).
    setPopKey((k) => k + 1)
  }

  const alleUpgrades = UPGRADES_BY_BUSINESS[id] ?? []
  const anzahlGekauft = alleUpgrades.filter((u) => gekaufteUpgrades.includes(u.id)).length
  const alleGekauft = alleUpgrades.length > 0 && anzahlGekauft === alleUpgrades.length
  const kannUpgradeKaufen = aktiv && alleUpgrades.some(
    (u) => !gekaufteUpgrades.includes(u.id) && geld >= u.kosten
  )

  return (
    <div
      className={`relative mb-2 ${aktiv ? 'rounded-r-xl' : 'rounded-xl'} ${blitz ? 'meilenstein-blitz' : ''}`}
      style={aktiv
        ? {
            background: `linear-gradient(135deg, ${weltFarbe}26, rgba(255,255,255,0.03))`,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderRight: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(0,0,0,0.25)',
            borderLeft: `5px solid ${weltFarbe}`,
            boxShadow: `0 6px 18px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(255,255,255,0.04)`,
          }
        : { background: 'rgba(20,11,26,0.55)', border: `1.5px dashed ${weltFarbe}55` }
      }
    >
      {floats.map((f) => (
        <span
          key={f.key}
          className="float-zahl pointer-events-none absolute left-9 top-1 z-20 text-sm font-medium text-emerald-300"
        >
          +{formatGeld(f.wert)} €
        </span>
      ))}
      {muenzen.map((m) => (
        <span
          key={m.key}
          className="muenze pointer-events-none absolute left-7 top-7 z-20 text-base"
          style={{ '--dx': `${m.dx}px`, '--dy': `${m.dy}px` } as React.CSSProperties}
        >
          🪙
        </span>
      ))}

      <div className="flex items-center gap-3 p-3">
        <button
          onClick={handleTap}
          disabled={!aktiv || hatManager}
          aria-label={`${b.name} produzieren`}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg text-3xl transition-transform active:scale-90 disabled:active:scale-100"
          style={aktiv
            ? {
                background: `radial-gradient(circle at 30% 25%, ${weltFarbe}55, ${weltFarbe}14)`,
                boxShadow: `inset 0 0 0 1px ${weltFarbe}55, 0 0 16px ${weltFarbe}30`,
              }
            : { background: 'rgba(13,7,18,0.6)', filter: 'grayscale(1) opacity(0.45)' }
          }
        >
          <span key={popKey} className={`relative z-10 ${popKey > 0 ? 'tap-pop' : ''}`}>
            {b.emoji}
          </span>
          {aktiv && (
            <span
              className="absolute left-0.5 top-0.5 z-10 rounded px-1 text-[10px] font-semibold leading-tight"
              style={{ background: 'rgba(0,0,0,0.65)', color: weltTint }}
            >
              ×{anzahl}
            </span>
          )}
          <div
            className="absolute bottom-0 left-0 h-2"
            style={{ width: `${prozent}%`, background: weltFarbe, boxShadow: `0 0 8px ${weltFarbe}` }}
          />
        </button>

        <div className={`min-w-0 flex-1 ${aktiv ? '' : 'opacity-55'}`}>
          <div className="flex items-center gap-1">
            <span
              className={`truncate font-medium ${aktiv ? '' : 'text-slate-400'}`}
              style={aktiv ? { color: weltTint } : undefined}
            >{b.name}</span>
          </div>
          {aktiv ? (
            <>
              <div className="whitespace-nowrap text-sm" style={{ color: weltFarbe }}>
                +{formatGeld(ertragProSekunde)} € / s
              </div>
              {naechsterMeilenstein !== null && (
                <div className="mt-0.5 flex items-center gap-1.5">
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${meilensteinProzent}%`, background: `linear-gradient(90deg, ${weltFarbe}, ${weltTint})`, boxShadow: `0 0 6px ${weltFarbe}aa` }}
                    />
                  </div>
                  <span className="shrink-0 tabular-nums text-[10px] text-slate-500">
                    {anzahl} / {naechsterMeilenstein}
                  </span>
                </div>
              )}
              {!hatManager ? (
                <button
                  onClick={() => managerKaufen(id)}
                  disabled={geld < managerKosten}
                  className="mt-1 inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium text-amber-100 disabled:opacity-40"
                  style={{ background: 'rgba(245,158,11,0.18)', boxShadow: 'inset 0 0 0 1px rgba(253,230,138,0.22)' }}
                >
                  👔 Manager: {formatGeld(managerKosten)} €
                </button>
              ) : (
                <div className="mt-1 text-[11px] text-amber-400">👔 Manager aktiv ✓</div>
              )}
            </>
          ) : (
            <>
              <div className="whitespace-nowrap text-sm text-slate-500">
                ab {formatGeld(b.basisKosten)} €
              </div>
              {eps > 0 && geld < b.basisKosten && (
                <div className="text-[10px] text-slate-600">
                  ≈ {formatWartezeit((b.basisKosten - geld) / eps)}
                </div>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => {
            kaufen(id, mengeRef.current)
            soundKauf()
          }}
          onPointerDown={haltStart}
          onPointerCancel={haltStop}
          onContextMenu={(e) => e.preventDefault()}
          disabled={!kannKaufen}
          className={`relative w-24 shrink-0 touch-none select-none overflow-hidden rounded-xl px-2 py-2 text-center font-bold transition-transform active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none disabled:active:scale-100 ${kannKaufen ? 'shimmer' : ''}`}
          style={kannKaufen ? { background: `linear-gradient(180deg, ${weltTint}, ${weltFarbe})`, boxShadow: `0 4px 14px ${weltFarbe}66`, color: '#1a0f22' } : undefined}
        >
          <div className="text-xs opacity-80">Kaufen ×{menge}</div>
          <div className="truncate text-sm">{formatGeld(kosten)} €</div>
        </button>
      </div>

      {/* Upgrade-Streifen — immer sichtbar auf aktiven Karten mit Upgrades */}
      {aktiv && alleUpgrades.length > 0 && (
        <button
          onClick={() => setUpgradeOffen((o) => !o)}
          className="flex w-full items-center gap-2 border-t px-3 py-1.5 text-left transition-colors"
          style={{
            borderColor: alleGekauft ? '#1e293b' : `${weltFarbe}30`,
            background: upgradeOffen ? `${weltFarbe}10` : 'transparent',
          }}
        >
          <span className="text-[11px] font-medium" style={{ color: alleGekauft ? '#475569' : kannUpgradeKaufen ? weltFarbe : '#64748b' }}>
            ⬆ Upgrades
          </span>
          <div className="flex gap-1">
            {alleUpgrades.map((u) => {
              const gekauft = gekaufteUpgrades.includes(u.id)
              return (
                <span
                  key={u.id}
                  className="h-2 w-2 rounded-full"
                  style={{ background: gekauft ? weltFarbe : '#334155' }}
                />
              )
            })}
          </div>
          {kannUpgradeKaufen && (
            <span className="glow-pulse ml-auto text-[10px] font-semibold" style={{ color: weltFarbe }}>
              verfügbar
            </span>
          )}
          {alleGekauft && (
            <span className="ml-auto text-[10px] text-slate-600">✓ fertig</span>
          )}
          <span className="shrink-0 text-[10px] text-slate-600">{upgradeOffen ? '▲' : '▼'}</span>
        </button>
      )}

      {upgradeOffen && aktiv && (
        <div className="px-3 pb-3">
          <UpgradePanel businessId={id} weltFarbe={weltFarbe} />
        </div>
      )}
    </div>
  )
}
