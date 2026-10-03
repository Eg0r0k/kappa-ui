import { describe, expect, it } from 'vitest'

import {
  isExample,
  matchModuleKey,
  registryItems,
  resolveExample,
  resolveInstallFilename,
  type RegistryItem,
} from '~/lib/registry'

const button: RegistryItem = {
  name: 'button',
  type: 'registry:ui',
  title: 'Button',
  description: 'A button.',
  files: [{ path: 'src/ui/button/Button.vue', type: 'registry:ui' }],
}

const demo: RegistryItem = {
  name: 'button-demo',
  type: 'registry:block',
  title: 'Button demo',
  description: 'A default button.',
  categories: ['example'],
  registryDependencies: ['button'],
  files: [{ path: 'src/examples/button/ButtonDemo.vue', type: 'registry:component' }],
}

const keys = [
  '/packages/registry/src/examples/button/ButtonDemo.vue',
  '/packages/registry/src/examples/button/Demo.vue',
]

describe('matchModuleKey', () => {
  it('matches a manifest path by its full suffix', () => {
    expect(matchModuleKey('src/examples/button/Demo.vue', keys)).toBe(keys[1])
    expect(matchModuleKey('src/examples/button/ButtonDemo.vue', keys)).toBe(keys[0])
  })

  it('does not match a file that only shares the end of its name', () => {
    expect(matchModuleKey('src/examples/button/emo.vue', keys)).toBeUndefined()
  })
})

describe('resolveExample', () => {
  it('returns the item and its module key', () => {
    expect(resolveExample('button-demo', [button, demo], keys)).toEqual({ item: demo, key: keys[0] })
  })

  it('rejects a name that is not in the manifest', () => {
    expect(() => resolveExample('nope', [button, demo], keys)).toThrow(
      'Example "nope" is not in packages/registry/registry.json.',
    )
  })

  it('rejects an item that is not an example', () => {
    expect(() => resolveExample('button', [button, demo], keys)).toThrow(
      'Registry item "button" is not an example (its categories must include "example").',
    )
  })

  it('rejects an example whose file was not found', () => {
    expect(() => resolveExample('button-demo', [button, demo], [])).toThrow(
      'Example "button-demo" lists src/examples/button/ButtonDemo.vue, which was not found under packages/registry/src.',
    )
  })
})

describe('resolveInstallFilename', () => {
  it('rewrites a src path to the consumer alias when there is no target', () => {
    expect(resolveInstallFilename({ path: 'src/ui/button/Button.vue', type: 'registry:ui' })).toBe(
      '@/components/ui/button/Button.vue',
    )
  })

  it('shows the target when the file ships to a fixed location', () => {
    expect(
      resolveInstallFilename({
        path: 'src/styles/scroll-fade.css',
        type: 'registry:file',
        target: 'styles/scroll-fade.css',
      }),
    ).toBe('styles/scroll-fade.css')
  })
})

describe('registryItems', () => {
  it('reads the real manifest', () => {
    expect(registryItems.filter(isExample).length).toBe(372)
  })
})
