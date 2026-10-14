import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { chromium, type Page } from 'playwright'

import { type CanvasSize, type CanvasSizes, readCanvasEntries } from './lib/canvas.ts'
import { serveOutput } from './lib/serve-output.ts'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(docsRoot, 'app/assets/canvas/sizes.json')

const { values: args } = parseArgs({ options: { url: { type: 'string' }, only: { type: 'string' } } })

// Desktop demos get a 660px box (the preview's p-10 on both sides): past Tailwind's sm breakpoint, so a
// demo takes its two-column layout instead of one tall stack, and no wider than the home page's canvas column.
const DESKTOP_WIDTH = 740
const profiles = [
  { key: 'desktop', viewport: { width: DESKTOP_WIDTH, height: 900 } },
  { key: 'phone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
] as const

/**
 * The painted extent of the demo: every box that draws, including absolutely positioned ones, and
 * nothing a box clips, hides or leaves visually hidden. The card centres the demo, so the width is
 * measured both ways from the preview box's centre.
 */
const extent = (): CanvasSize | null => {
  const box = document.querySelector('[data-slot=preview-content]')
  if (!box) return null
  const bounds = box.getBoundingClientRect()
  const centre = bounds.left + bounds.width / 2
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  const visit = (el: Element) => {
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.1) return
    if (style.position === 'fixed' || el.hasAttribute('hidden') || style.contentVisibility === 'hidden') return
    if (style.display !== 'contents') {
      const rect = el.getBoundingClientRect()
      if ((style.clip && style.clip !== 'auto') || (rect.width <= 1 && rect.height <= 1)) return
      if (rect.width > 0 || rect.height > 0) {
        left = Math.min(left, rect.left)
        top = Math.min(top, rect.top)
        right = Math.max(right, rect.right)
        bottom = Math.max(bottom, rect.bottom)
      }
      if (style.overflowX !== 'visible' || style.overflowY !== 'visible') return
    }
    for (const child of el.children) visit(child)
  }
  for (const child of box.children) visit(child)
  if (!Number.isFinite(left)) return null
  // An even width keeps the centred demo on whole pixels.
  return { width: 2 * Math.ceil(Math.max(centre - left, right - centre)), height: Math.ceil(bottom - top) }
}

/** Triggers that expand in place; anything that opens a popup renders in a portal and never grows the card. */
const markTriggers = () =>
  [...document.querySelectorAll('[data-slot=preview-content] [aria-expanded="false"]')]
    .filter((el) => !el.hasAttribute('aria-haspopup') && el.getAttribute('role') !== 'combobox')
    .map((el, index) => {
      el.setAttribute('data-measure-trigger', String(index))
      return index
    })

const mounted = () => (document.querySelector('[data-slot=preview-content] > div')?.children.length ?? 0) > 0

const max = (a: CanvasSize, b: CanvasSize) => ({
  width: Math.max(a.width, b.width),
  height: Math.max(a.height, b.height),
})

const measure = async (page: Page, url: string, example: string) => {
  await page.goto(`${url}/preview/${example}`, { waitUntil: 'networkidle' })
  await page.waitForFunction(mounted)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  let size = await page.evaluate(extent)
  if (!size) return { size: { width: 120, height: 36 }, grew: false }
  let grew = false
  for (const index of await page.evaluate(markTriggers)) {
    const trigger = page.locator(`[data-measure-trigger="${index}"]`)
    const clicked = await trigger.click({ timeout: 1500 }).then(
      () => true,
      () => false,
    )
    if (!clicked) continue
    await page.waitForTimeout(450)
    const after = await page.evaluate(extent)
    if (!after) continue
    if (after.width > size.width || after.height > size.height) grew = true
    size = max(size, after)
  }
  return { size, grew }
}

/** A trigger that navigates (a link, a dev-server reload) destroys the page's context: measure once more. */
const measureTwice = async (page: Page, url: string, example: string) => {
  try {
    return await measure(page, url, example)
  } catch (error) {
    console.warn(`${example}: ${(error as Error).message.split('\n')[0]}; retrying`)
    return measure(page, url, example)
  }
}

const { entries, errors } = await readCanvasEntries(docsRoot)
if (errors.length > 0) {
  console.error(`measure-canvas: ${errors.length} manifest error(s)`)
  for (const message of errors) console.error(`  • ${message}`)
  process.exit(1)
}
const only = args.only ? new Set(args.only.split(',')) : undefined
const selected = only ? entries.filter((entry) => only.has(entry.slug)) : entries

const output = join(docsRoot, '.output/public')
if (!args.url && !existsSync(join(output, 'index.html'))) {
  console.error('measure-canvas: no .output/public; run `pnpm build` first or pass --url <dev server>')
  process.exit(1)
}
const server = args.url ? undefined : await serveOutput(output)
const url = (args.url ?? server!.url).replace(/\/+$/, '')

const sizes: CanvasSizes =
  existsSync(outFile) && only ? (JSON.parse(await readFile(outFile, 'utf8')) as CanvasSizes) : {}
const pageErrors: string[] = []
const grown: string[] = []
const browser = await chromium.launch()
const started = Date.now()
for (const profile of profiles) {
  const context = await browser.newContext({ ...profile, colorScheme: 'light', reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.on('pageerror', (error) => pageErrors.push(`${profile.key} ${page.url()}: ${error.message}`))
  for (const entry of selected) {
    const { size, grew } = await measureTwice(page, url, entry.example)
    sizes[entry.slug] = { ...(sizes[entry.slug] ?? { desktop: size, phone: size }), [profile.key]: size }
    if (grew) grown.push(`${entry.slug} (${profile.key})`)
    console.log(`${profile.key.padEnd(7)} ${entry.slug.padEnd(20)} ${size.width} × ${size.height}`)
  }
  await context.close()
}
await browser.close()
server?.close()

const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)))
await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')
console.log(`measure-canvas: ${selected.length} component(s) in ${Math.round((Date.now() - started) / 1000)}s`)
if (grown.length > 0) console.log(`grew when expanded: ${grown.join(', ')}`)
if (pageErrors.length > 0) {
  console.error(`page errors:\n  ${pageErrors.join('\n  ')}`)
  process.exit(1)
}
