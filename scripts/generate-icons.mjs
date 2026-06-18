// Erzeugt alle App-Icons aus dem Vektor-Design (Konzept "Münze & Tipp-Welle", Variante A:
// dunkelgrün + glänzende Münze). Neu generieren mit:  node scripts/generate-icons.mjs
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const defs = `
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#059669"/><stop offset="1" stop-color="#064e3b"/></linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fde68a" stop-opacity="0.6"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>
<linearGradient id="coin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7d6"/><stop offset="0.45" stop-color="#fcd34d"/><stop offset="1" stop-color="#df8c07"/></linearGradient>
</defs>`

const art = `
<circle cx="60" cy="60" r="47" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="3"/>
<circle cx="60" cy="60" r="44" fill="url(#glow)"/>
<circle cx="60" cy="60" r="34" fill="url(#coin)"/>
<circle cx="60" cy="60" r="34" fill="none" stroke="#7a3d05" stroke-opacity="0.55" stroke-width="2"/>
<circle cx="60" cy="60" r="27" fill="none" stroke="#fffbeb" stroke-opacity="0.45" stroke-width="1.4"/>
<ellipse cx="50" cy="47" rx="13" ry="8" fill="#ffffff" fill-opacity="0.42"/>
<circle cx="69" cy="50" r="3.4" fill="#ffffff" fill-opacity="0.6"/>
<text x="60" y="75" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="42" font-weight="bold" fill="#6b2207">€</text>
<path d="M86,31 L88.2,37.8 L95,40 L88.2,42.2 L86,49 L83.8,42.2 L77,40 L83.8,37.8 Z" fill="#fffde7"/>
<path d="M77,27 L78,30 L81,31 L78,32 L77,35 L76,32 L73,31 L76,30 Z" fill="#fff8c2"/>`

// rounded: abgerundete Ecken (für Browser/PWA "any"); scale<1: Inhalt verkleinern (Maskable-Sicherheitszone)
function svg({ rounded = true, scale = 1 } = {}) {
  const rx = rounded ? 27 : 0
  const inner = scale === 1 ? art : `<g transform="translate(60 60) scale(${scale}) translate(-60 -60)">${art}</g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${defs}<rect width="120" height="120" rx="${rx}" fill="url(#bg)"/>${inner}</svg>`
}

async function png(svgStr, size, file) {
  await sharp(Buffer.from(svgStr), { density: 384 }).resize(size, size).png().toFile(join(pub, file))
  console.log('✓', file, size + 'px')
}

await png(svg({ rounded: true }), 192, 'pwa-192x192.png')
await png(svg({ rounded: true }), 512, 'pwa-512x512.png')
await png(svg({ rounded: false, scale: 0.82 }), 512, 'maskable-512x512.png')
await png(svg({ rounded: false }), 180, 'apple-touch-icon.png')

writeFileSync(join(pub, 'favicon.svg'), svg({ rounded: true }))
console.log('✓ favicon.svg')
