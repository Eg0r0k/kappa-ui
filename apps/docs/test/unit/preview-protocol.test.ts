import { describe, expect, it } from 'vitest'

import { isPreviewEvent, isPreviewState, previewPath } from '~/lib/preview-protocol'

describe('isPreviewState', () => {
  it('accepts a complete state message only', () => {
    const state = { type: 'kappa:state', colorScheme: 'dark', dir: 'rtl', restart: 2, siteTheme: '{"hue":"150"}' }
    expect(isPreviewState(state)).toBe(true)
    expect(isPreviewState({ ...state, colorScheme: 'system' })).toBe(false)
    expect(isPreviewState({ ...state, dir: 'up' })).toBe(false)
    expect(isPreviewState({ ...state, restart: '2' })).toBe(false)
    expect(isPreviewState({ ...state, type: 'kappa:ready' })).toBe(false)
    expect(isPreviewState(null)).toBe(false)
    expect(isPreviewState('kappa:state')).toBe(false)
  })
})

describe('isPreviewEvent', () => {
  it('accepts the four preview events with their fields', () => {
    expect(isPreviewEvent({ type: 'kappa:ready' })).toBe(true)
    expect(isPreviewEvent({ type: 'kappa:size', height: 320 })).toBe(true)
    expect(isPreviewEvent({ type: 'kappa:size', height: Number.NaN })).toBe(false)
    expect(isPreviewEvent({ type: 'kappa:error', message: 'Boom' })).toBe(true)
    expect(isPreviewEvent({ type: 'kappa:error' })).toBe(false)
    expect(isPreviewEvent({ type: 'kappa:shortcut' })).toBe(true)
    expect(isPreviewEvent({ type: 'webpackOk' })).toBe(false)
    expect(isPreviewEvent(undefined)).toBe(false)
  })
})

describe('previewPath', () => {
  it('builds the preview route of an example', () => {
    expect(previewPath('button-demo')).toBe('/preview/button-demo')
  })
})
