import { queryCollection } from '@nuxt/content/server'

import { pagePathOfRaw } from '../../../app/lib/raw'

export default defineEventHandler(async (event) => {
  const path = pagePathOfRaw(event.path)
  if (!path) throw createError({ statusCode: 404, statusMessage: 'Not a page source' })
  const page = await queryCollection(event, 'docs').path(path).select('rawbody').first()
  if (!page) throw createError({ statusCode: 404, statusMessage: `No page at ${path}` })
  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return page.rawbody
})
