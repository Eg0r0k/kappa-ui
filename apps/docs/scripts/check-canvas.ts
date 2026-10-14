import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { chromium, type Browser, type Page } from 'playwright'

import { type CanvasEntry, readCanvasEntries } from './lib/canvas.ts'
import { serveOutput } from './lib/serve-output.ts'

/*
  node scripts/check-canvas.ts fit | keyboard | perf [--url <site>] [--only slug,slug]

  fit: opens every card at 1440×900 and 390×844, expands its inline triggers, and reports a demo
       that had to be scaled down or that paints outside its card.
  keyboard: focuses a field in an open card on a phone and shrinks the screen like a keyboard would;
       the cards must keep their scale, the field must stay in the visible band, and everything must
       return to where it was once the field blurs and the screen comes back.
  perf: pans continuously and reports frame times and long tasks.
*/

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: { url: { type: 'string' }, only: { type: 'string' } },
})
const mode = positionals[0]
if (mode !== 'fit' && mode !== 'keyboard' && mode !== 'perf') {
  console.error('check-canvas: expected one of fit, keyboard or perf')
  process.exit(1)
}

const desktop = { viewport: { width: 1440, height: 900 } }
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }

type Reading = { scale: number; outsideCard: number }

/** The open card's demo: how far it was scaled down to fit, and how far anything paints outside the card. */
const readOpenCard = (): Reading | null => {
  const body = document.querySelector<HTMLElement>('[data-open-body]')
  const inner = body?.firstElementChild as HTMLElement | null
  const card = body?.closest<HTMLElement>('[data-slot=demo-card]')
  if (!body || !inner || !card) return null
  const match = /scale\(([\d.]+)\)/.exec(inner.style.transform)
  const bounds = card.getBoundingClientRect()
  const z = bounds.width / card.offsetWidth
  let outside = 0
  for (const el of body.querySelectorAll('*')) {
    const style = getComputedStyle(el)
    if (el.closest('[hidden]') || Number(style.opacity) < 0.1 || style.position === 'fixed') continue
    let clipped = false
    for (let ancestor = el.parentElement; ancestor && ancestor !== body; ancestor = ancestor.parentElement) {
      const parent = getComputedStyle(ancestor)
      if (parent.overflowX !== 'visible' || parent.overflowY !== 'visible') {
        clipped = true
        break
      }
    }
    if (clipped) continue
    const rect = el.getBoundingClientRect()
    if (rect.width <= 1 && rect.height <= 1) continue
    outside = Math.max(
      outside,
      (bounds.left - rect.left) / z,
      (rect.right - bounds.right) / z,
      (bounds.top - rect.top) / z,
      (rect.bottom - bounds.bottom) / z,
    )
  }
  return { scale: match ? Number(match[1]) : 1, outsideCard: Math.round(outside) }
}

const scaleOf = (transform: string | undefined) => /scale\(([\d.]+)\)/.exec(transform ?? '')?.[1]

const readState = () => {
  const card = document.querySelector('[data-open-body]')?.closest<HTMLElement>('[data-item]')
  const field = document.activeElement
  const rect = field instanceof HTMLElement ? field.getBoundingClientRect() : undefined
  return {
    transform: card?.style.transform,
    field: rect ? [Math.round(rect.top), Math.round(rect.bottom)] : null,
    height: innerHeight,
  }
}

const openSite = async (page: Page, url: string) => {
  await page.goto(`${url}/`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    document.querySelector('[data-slot=home-canvas]')?.scrollIntoView({ block: 'start' })
    window.scrollBy(0, -56)
  })
  await page.waitForSelector('[data-slot=canvas]')
  await page.waitForTimeout(1200)
}

const openCard = async (page: Page, title: string) => {
  await page.click('[data-canvas-find]')
  await page.waitForSelector('[role=dialog] [cmdk-input], [role=dialog] input')
  await page.keyboard.type(title)
  await page.waitForTimeout(150)
  const found = await page.evaluate((wanted) => {
    const option = [...document.querySelectorAll<HTMLElement>('[role=dialog] [role=option]')].find(
      (candidate) => candidate.textContent?.trim() === wanted,
    )
    option?.click()
    return Boolean(option)
  }, title)
  if (!found) {
    await page.keyboard.press('Escape')
    return false
  }
  await page.waitForTimeout(900)
  return true
}

const closeCard = async (page: Page) => {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
}

const fit = async (browser: Browser, url: string, entries: CanvasEntry[]) => {
  let failed = 0
  for (const profile of [desktop, phone]) {
    const page = await browser.newPage(profile)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await openSite(page, url)
    const problems: string[] = []
    for (const entry of entries) {
      if (!(await openCard(page, entry.title))) {
        problems.push(`${entry.slug}: not in the Find list`)
        continue
      }
      const closed = await page.evaluate(readOpenCard)
      let worst = closed
      let expanded = false
      const triggers = page.locator('[data-open-body] [aria-expanded="false"]:not([aria-haspopup])')
      for (let i = 0; i < Math.min(await triggers.count(), 6); i++) {
        const clicked = await triggers
          .nth(0)
          .click({ timeout: 800 })
          .then(
            () => true,
            () => false,
          )
        if (!clicked) break
        await page.waitForTimeout(450)
        const now = await page.evaluate(readOpenCard)
        if (now && worst && (now.scale < worst.scale || now.outsideCard > worst.outsideCard)) {
          worst = now
          expanded = true
        }
      }
      if (!worst) problems.push(`${entry.slug}: no open card`)
      else if (worst.scale < 0.999 || worst.outsideCard > 0) {
        problems.push(
          `${entry.slug}: scale ${worst.scale}, ${worst.outsideCard}px outside${expanded ? ' after expanding' : ''}`,
        )
      }
      await closeCard(page)
    }
    const label = `${profile.viewport.width}×${profile.viewport.height}`
    console.log(`${label}: checked ${entries.length}, problems: ${problems.length}`)
    for (const problem of problems) console.log(`  ${problem}`)
    if (errors.length > 0) console.log(`  page errors: ${errors.slice(0, 5).join(' | ')}`)
    failed += problems.length + errors.length
    await page.close()
  }
  return failed === 0
}

const keyboard = async (browser: Browser, url: string, entries: CanvasEntry[]) => {
  const page = await browser.newPage(phone)
  await openSite(page, url)
  let ok = true
  const slugs = args.only ? entries.map((entry) => entry.slug) : ['input-floating', 'textarea']
  for (const slug of slugs) {
    const entry = entries.find((candidate) => candidate.slug === slug)
    if (!entry || !(await openCard(page, entry.title))) {
      console.log(`${slug}: could not open`)
      ok = false
      continue
    }
    const before = await page.evaluate(readState)
    await page.evaluate(() => {
      const fields = document.querySelectorAll<HTMLElement>('[data-open-body] input, [data-open-body] textarea')
      fields[fields.length - 1]?.focus()
    })
    await page.waitForTimeout(100)
    for (let h = 844; h > 379; h -= 58) {
      await page.setViewportSize({ width: 390, height: h })
      await page.waitForTimeout(30)
    }
    await page.waitForTimeout(600)
    const during = await page.evaluate(readState)
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    for (let h = 380; h < 845; h += 58) {
      await page.setViewportSize({ width: 390, height: h })
      await page.waitForTimeout(30)
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(1000)
    const after = await page.evaluate(readState)
    const scales = [before, during, after].map((state) => scaleOf(state.transform))
    // The lift settles within half a pixel and the rect is rounded: allow 2px.
    const inBand = during.field ? during.field[1]! <= during.height - 22 && during.field[0]! >= 0 : false
    const same = scales[0] === scales[1] && scales[1] === scales[2] && before.transform === after.transform
    console.log(`${slug}: scale ${scales.join(' → ')}, field ${JSON.stringify(during.field)} in ${during.height}px`)
    if (!inBand) console.log(`  the field is not in the visible band`)
    if (!same) console.log(`  moved: ${before.transform} → ${after.transform}`)
    if (!inBand || !same) ok = false
    await closeCard(page)
  }
  await page.close()
  return ok
}

const perf = async (browser: Browser, url: string) => {
  const page = await browser.newPage(desktop)
  await openSite(page, url)
  await page.waitForTimeout(2000)
  await page.evaluate(() => {
    const frames: number[] = []
    const longTasks: number[] = []
    const window_ = window as Window & { __frames?: number[]; __longTasks?: number[] }
    window_.__frames = frames
    window_.__longTasks = longTasks
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) longTasks.push(Math.round(entry.duration))
    }).observe({ type: 'longtask' })
    let last = performance.now()
    const loop = (now: number) => {
      frames.push(now - last)
      last = now
      if (frames.length < 400) requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  })
  const centre = { x: 720, y: 500 }
  await page.mouse.move(centre.x, centre.y)
  await page.mouse.down()
  for (let i = 0; i < 120; i++) {
    await page.mouse.move(centre.x - (i % 60) * 20, centre.y - (i % 60) * 6)
    await page.waitForTimeout(8)
  }
  await page.mouse.up()
  await page.waitForTimeout(1500)
  const { frames, longTasks } = await page.evaluate(() => {
    const window_ = window as Window & { __frames?: number[]; __longTasks?: number[] }
    return { frames: window_.__frames ?? [], longTasks: window_.__longTasks ?? [] }
  })
  const sorted = frames.slice(5).sort((a, b) => a - b)
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))]?.toFixed(1)
  const live = await page.evaluate(() => document.querySelectorAll('[data-slot=demo-body] [data-slot]').length)
  console.log(`frames: median ${at(0.5)}ms, p95 ${at(0.95)}ms, p99 ${at(0.99)}ms, max ${sorted.at(-1)?.toFixed(1)}ms`)
  console.log(`long tasks: ${longTasks.length} (${longTasks.join(', ') || 'none'}), live demo parts: ${live}`)
  await page.close()
  return true
}

const { entries, errors } = await readCanvasEntries(docsRoot)
if (errors.length > 0) {
  console.error(`check-canvas: ${errors.length} manifest error(s)`)
  for (const message of errors) console.error(`  • ${message}`)
  process.exit(1)
}
const only = args.only ? new Set(args.only.split(',')) : undefined
const selected = only ? entries.filter((entry) => only.has(entry.slug)) : entries

const output = join(docsRoot, '.output/public')
if (!args.url && !existsSync(join(output, 'index.html'))) {
  console.error('check-canvas: no .output/public; run `pnpm build` first or pass --url <dev server>')
  process.exit(1)
}
const server = args.url ? undefined : await serveOutput(output)
const url = (args.url ?? server!.url).replace(/\/+$/, '')
const browser = await chromium.launch()
const checks = {
  fit: () => fit(browser, url, selected),
  keyboard: () => keyboard(browser, url, selected),
  perf: () => perf(browser, url),
}
const passed = await checks[mode]()
await browser.close()
server?.close()
process.exit(passed ? 0 : 1)
