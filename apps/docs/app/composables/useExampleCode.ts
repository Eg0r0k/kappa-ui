import { consumerFilename, consumerSource } from '~/lib/consumer'
import { findItem } from '~/lib/registry'
import { loadSource } from '~/lib/sources'

export const useExampleCode = (name: () => string) =>
  useAsyncData(
    () => `example-code:${name()}`,
    async () => {
      const files = findItem(name())?.files ?? []
      const { highlight } = await import('~/lib/highlight')
      return Promise.all(
        files.map(async (file) => {
          const source = consumerSource(await loadSource(file.path))
          return { filename: consumerFilename(file.path), source, html: await highlight(source, 'vue') }
        }),
      )
    },
  )
