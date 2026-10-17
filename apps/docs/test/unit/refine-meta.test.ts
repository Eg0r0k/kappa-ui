import { describe, expect, it } from 'vitest'
import type { ComponentMeta, EventMeta, PropertyMeta } from 'vue-component-meta'

import { refineMeta } from '../../scripts/lib/refine-meta.ts'

const declarations = [{ file: 'x.vue', range: [0, 1] }]
const prop = (overrides: Record<string, unknown>): PropertyMeta =>
  ({ global: false, required: false, type: 'string', schema: 'string', declarations, ...overrides }) as PropertyMeta
const event = (name: string): EventMeta => ({ name, type: '[]', schema: [], declarations }) as unknown as EventMeta
const meta = (overrides: Partial<ComponentMeta>): ComponentMeta =>
  ({ type: 1, props: [], events: [], slots: [], exposed: [], ...overrides }) as ComponentMeta

describe('refineMeta', () => {
  it('drops global props and the handlers of declared events, then orders required first and booleans last', () => {
    const refined = refineMeta(
      meta({
        props: [
          prop({ name: 'open', type: 'boolean' }),
          prop({ name: 'class', global: true }),
          prop({ name: 'onUpdate:modelValue', type: '(value: string) => void' }),
          prop({ name: 'label' }),
          prop({ name: 'modelValue', required: true }),
        ],
        events: [event('update:modelValue')],
      }),
    )

    expect(refined.props.map((entry) => entry.name)).toEqual(['modelValue', 'label', 'open'])
  })

  it('collapses native browser types to their name and removes declarations everywhere', () => {
    const refined = refineMeta(
      meta({
        props: [
          prop({
            name: 'target',
            type: 'HTMLElement',
            schema: { kind: 'object', type: 'HTMLElement', schema: { id: prop({ name: 'id' }) } },
          }),
          prop({
            name: 'size',
            type: '"sm" | "md"',
            schema: { kind: 'enum', type: '"sm" | "md"', schema: { 0: '"sm"', 1: '"md"' } },
          }),
        ],
        events: [event('close')],
      }),
    )

    expect(refined.props[0]?.schema).toBe('HTMLElement')
    expect(refined.props[1]?.schema).toEqual({ kind: 'enum', type: '"sm" | "md"', schema: { 0: '"sm"', 1: '"md"' } })
    expect(JSON.stringify(refined)).not.toContain('declarations')
  })
})
