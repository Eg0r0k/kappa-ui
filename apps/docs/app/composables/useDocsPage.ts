import { exampleLabel, exampleSlug, pageExamples, pageSlugOf } from '~/lib/examples'
import { findItem } from '~/lib/registry'

export const useDocsPage = (path: () => string) =>
  useAsyncData(
    () => `docs:${path()}`,
    () => queryCollection('docs').path(path()).first(),
    {
      transform: (page) => {
        if (!page) return null
        const { rawbody, ...rest } = page
        const slug = pageSlugOf(rest.path)
        const examples = pageExamples(rawbody ?? '').map((name) => ({
          name,
          slug: exampleSlug(name, slug),
          title: exampleLabel(findItem(name)?.title ?? name, rest.title),
        }))
        return { ...rest, examples }
      },
    },
  )
