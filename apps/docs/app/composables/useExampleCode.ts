import { computedAsync } from '@vueuse/core'

import { applyProps } from '#scripts/lib/example-props'
import { consumerFilename, consumerSource } from '~/lib/consumer'
import type { ControlValue } from '~/lib/example-controls'
import { findItem } from '~/lib/registry'
import { loadSource } from '~/lib/sources'

export const useExampleCode = (
  name: () => string,
  props: () => Readonly<Record<string, ControlValue>> = () => ({}),
) => {
  const { data: sources } = useAsyncData(
    () => `example-source:${name()}`,
    () =>
      Promise.all(
        (findItem(name())?.files ?? []).map(async (file) => ({
          filename: consumerFilename(file.path),
          raw: consumerSource(await loadSource(file.path)),
        })),
      ),
  )
  const data = computedAsync(async () => {
    const files = sources.value ?? []
    const applied = props()
    const { highlight } = await import('~/lib/highlight')
    return Promise.all(
      files.map(async (file, index) => {
        const source = index === 0 ? applyProps(file.raw, applied) : file.raw
        return { filename: file.filename, source, html: await highlight(source, 'vue') }
      }),
    )
  }, undefined)
  return { data }
}
