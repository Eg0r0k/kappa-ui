import assert from 'node:assert/strict'
import { test } from 'node:test'

import { thumbnailSvg } from './thumbs.ts'

const svg = (body: string) =>
  `<svg width="320" height="200" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>\n`

test('turns sentinel colours into CSS variables in one style attribute', () => {
  const result = thumbnailSvg({
    name: 'button',
    svg: svg('<rect opacity="0.45" x="1" y="2" width="3" height="4" fill="#133701" stroke="#133702"/>'),
    sentinels: { '#133701': 'primary', '#133702': 'border' },
  })
  assert.match(
    result,
    /<rect opacity="0.45" x="1" y="2" width="3" height="4" style="fill:var\(--primary\);stroke:var\(--border\)"\/>/,
  )
})

test('merges an existing style attribute', () => {
  const result = thumbnailSvg({
    name: 'button',
    svg: svg('<path d="M0 0" style="mix-blend-mode:multiply" fill="#133701"/>'),
    sentinels: { '#133701': 'primary' },
  })
  assert.match(result, /<path d="M0 0" style="mix-blend-mode:multiply;fill:var\(--primary\)"\/>/)
})

test('keeps the viewBox and drops the root size', () => {
  const result = thumbnailSvg({
    name: 'button',
    svg: svg('<path d="M0 0" fill="#133701"/>'),
    sentinels: { '#133701': 'primary' },
  })
  assert.match(result, /^<svg viewBox="0 0 320 200" fill="none" xmlns="http:\/\/www.w3.org\/2000\/svg">/)
})

test('matches sentinels whatever their case and keeps none', () => {
  const result = thumbnailSvg({
    name: 'button',
    svg: svg('<path d="M0 0" fill="#13370a" stroke="none"/>'),
    sentinels: { '#13370A': 'muted-foreground' },
  })
  assert.match(result, /<path d="M0 0" stroke="none" style="fill:var\(--muted-foreground\)"\/>/)
})

test('rewrites gradient stops', () => {
  const result = thumbnailSvg({
    name: 'fade',
    svg: svg(
      '<linearGradient id="g"><stop stop-color="#133701"/><stop offset="1" stop-color="#133701" stop-opacity="0"/></linearGradient>',
    ),
    sentinels: { '#133701': 'background' },
  })
  assert.match(result, /<stop style="stop-color:var\(--background\)"\/>/)
  assert.match(result, /<stop offset="1" stop-opacity="0" style="stop-color:var\(--background\)"\/>/)
})

test('drops colours inside a clip path and prefixes ids with the thumbnail name', () => {
  const result = thumbnailSvg({
    name: 'image',
    svg: svg(
      '<g clip-path="url(#clip0_26_1)">\n<circle fill="#133701"/>\n</g>\n<defs>\n<clipPath id="clip0_26_1">\n<path d="M0 0" fill="white"/>\n</clipPath>\n</defs>',
    ),
    sentinels: { '#133701': 'muted-foreground' },
  })
  assert.match(result, /<g clip-path="url\(#image-clip0_26_1\)">/)
  assert.match(result, /<clipPath id="image-clip0_26_1">\n<path d="M0 0"\/>/)
})

test('rejects a colour that is not a sentinel', () => {
  assert.throws(
    () => thumbnailSvg({ name: 'button', svg: svg('<path d="M0 0" fill="#0A0A0A"/>'), sentinels: {} }),
    /button: fill #0A0A0A is not bound to a Color variable/,
  )
  assert.throws(
    () => thumbnailSvg({ name: 'button', svg: svg('<path d="M0 0" stroke="white"/>'), sentinels: {} }),
    /button: stroke white is not bound to a Color variable/,
  )
})

test('rejects variables that are not plain CSS names', () => {
  assert.throws(
    () =>
      thumbnailSvg({
        name: 'button',
        svg: svg('<path d="M0 0" fill="#133701"/>'),
        sentinels: { '#133701': 'state/disabled' },
      }),
    /button: state\/disabled has no CSS variable/,
  )
})
