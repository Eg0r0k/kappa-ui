import { describe, expect, it } from 'vitest'

import { mergeApi, type ComponentMetaInput } from '../../scripts/lib/api-meta.ts'

const meta = (overrides: Partial<ComponentMetaInput> = {}): ComponentMetaInput => ({
  props: [],
  events: [],
  slots: [],
  exposed: [],
  ...overrides,
})

describe('mergeApi', () => {
  it('takes types and defaults from the component and descriptions from the file', () => {
    const { api, errors } = mergeApi(
      meta({
        props: [
          {
            name: 'orientation',
            type: '"vertical" | "horizontal" | undefined',
            required: false,
            default: '"vertical"',
          },
        ],
        events: [{ name: 'scroll', type: '[info: Info]' }],
        slots: [{ name: 'default', type: '{ item: T; index: number; }' }],
        exposed: [{ name: 'reset', type: '() => void' }],
      }),
      {
        component: 'ScrollArea',
        file: 'ui/scroll-area/ScrollArea.vue',
        props: { orientation: 'Axis the area scrolls on.' },
        emits: { scroll: 'Fires on scroll.' },
        slots: { default: 'Content.' },
        exposed: { reset: 'Drops measurements.' },
      },
    )

    expect(errors).toEqual([])
    expect(api).toEqual({
      component: 'ScrollArea',
      props: [
        {
          name: 'orientation',
          type: '"vertical" | "horizontal"',
          description: 'Axis the area scrolls on.',
          default: '"vertical"',
          required: false,
        },
      ],
      emits: [{ name: 'scroll', type: '[info: Info]', description: 'Fires on scroll.' }],
      slots: [{ name: 'default', type: '{ item: T; index: number; }', description: 'Content.' }],
      exposed: [{ name: 'reset', type: '() => void', description: 'Drops measurements.' }],
    })
  })

  it('reports every undocumented member', () => {
    const { errors } = mergeApi(
      meta({
        props: [{ name: 'size', type: 'string', required: false }],
        events: [{ name: 'scroll', type: '[]' }],
        slots: [{ name: 'default', type: '{}' }],
        exposed: [{ name: 'reset', type: '() => void' }],
      }),
      { component: 'X', file: 'ui/x/X.vue' },
    )

    expect(errors).toEqual([
      'X: prop "size" has no description',
      'X: emit "scroll" has no description',
      'X: slot "default" has no description',
      'X: exposed "reset" has no description',
    ])
  })

  it('reports a description for a member that does not exist', () => {
    const { errors } = mergeApi(meta(), {
      component: 'X',
      file: 'ui/x/X.vue',
      props: { gone: 'Old prop.' },
    })

    expect(errors).toEqual(['X: prop "gone" is described but does not exist'])
  })

  it('drops exposed members that mirror props, event handlers or Vue internals', () => {
    const { api, errors } = mergeApi(
      meta({
        props: [{ name: 'size', type: 'string', required: false }],
        events: [{ name: 'scroll', type: '[]' }],
        exposed: [
          { name: 'size', type: 'string' },
          { name: 'onScroll', type: '() => void' },
          { name: '$el', type: 'any' },
          { name: 'reset', type: '() => void' },
        ],
      }),
      {
        component: 'X',
        file: 'ui/x/X.vue',
        props: { size: 'Size.' },
        emits: { scroll: 'Scroll.' },
        exposed: { reset: 'Reset.' },
      },
    )

    expect(errors).toEqual([])
    expect(api.exposed.map((row) => row.name)).toEqual(['reset'])
  })

  it('uses a described default only where the component defines none', () => {
    const { api, errors } = mergeApi(meta({ props: [{ name: 'variant', type: 'string', required: false }] }), {
      component: 'Button',
      file: 'ui/button/Button.vue',
      props: { variant: { description: 'Style.', default: '"default"' } },
    })
    expect(errors).toEqual([])
    expect(api.props[0]?.default).toBe('"default"')

    const clash = mergeApi(meta({ props: [{ name: 'as', type: 'string', required: false, default: '"button"' }] }), {
      component: 'Button',
      file: 'ui/button/Button.vue',
      props: { as: { description: 'Element.', default: '"div"' } },
    })
    expect(clash.errors).toEqual([
      'Button: prop "as" sets a default in its description, but the component already defines "button"',
    ])
  })

  it('expands described fields from an object inside a union', () => {
    const virtualize = {
      name: 'virtualize',
      type: 'boolean | Options | undefined',
      required: false,
      default: 'false',
      schema: {
        kind: 'enum',
        type: 'boolean | Options | undefined',
        schema: [
          'undefined',
          'false',
          'true',
          {
            kind: 'object',
            type: 'Options',
            schema: {
              overscan: { name: 'overscan', type: 'number | undefined', required: false },
              lanes: { name: 'lanes', type: 'number | undefined', required: false },
            },
          },
        ],
      },
    }

    const { api, errors } = mergeApi(meta({ props: [virtualize] }), {
      component: 'ScrollArea',
      file: 'ui/scroll-area/ScrollArea.vue',
      props: { virtualize: { description: 'Virtualize.', fields: { overscan: 'Extra items.', lanes: 'Columns.' } } },
    })

    expect(errors).toEqual([])
    expect(api.props[0]?.fields).toEqual([
      { name: 'overscan', type: 'number', description: 'Extra items.', required: false },
      { name: 'lanes', type: 'number', description: 'Columns.', required: false },
    ])

    const incomplete = mergeApi(meta({ props: [virtualize] }), {
      component: 'ScrollArea',
      file: 'ui/scroll-area/ScrollArea.vue',
      props: { virtualize: { description: 'Virtualize.', fields: { overscan: 'Extra items.', gone: 'Old.' } } },
    })
    expect(incomplete.errors).toEqual([
      'ScrollArea: prop "virtualize" field "lanes" has no description',
      'ScrollArea: prop "virtualize" field "gone" is described but does not exist',
    ])
  })

  it('reads union members serialized as an object with numeric keys', () => {
    const { api, errors } = mergeApi(
      meta({
        props: [
          {
            name: 'virtualize',
            type: 'boolean | Options | undefined',
            required: false,
            schema: {
              kind: 'enum',
              type: 'boolean | Options | undefined',
              schema: {
                '0': 'undefined',
                '1': {
                  kind: 'object',
                  type: 'Options',
                  schema: { gap: { name: 'gap', type: 'number | undefined', required: false } },
                },
              },
            },
          },
        ],
      }),
      {
        component: 'ScrollArea',
        file: 'ui/scroll-area/ScrollArea.vue',
        props: { virtualize: { description: 'Virtualize.', fields: { gap: 'Gap.' } } },
      },
    )

    expect(errors).toEqual([])
    expect(api.props[0]?.fields?.map((field) => field.name)).toEqual(['gap'])
  })

  it('reports fields on a prop without an object shape', () => {
    const { errors } = mergeApi(
      meta({ props: [{ name: 'delay', type: 'number', required: false, schema: 'number' }] }),
      { component: 'X', file: 'ui/x/X.vue', props: { delay: { description: 'Delay.', fields: { a: 'A.' } } } },
    )

    expect(errors).toEqual(['X: prop "delay" describes fields, but its type has no object shape'])
  })
})
