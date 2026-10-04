import type { RouterConfig } from '@nuxt/schema'
import type { RouteLocationNormalized } from 'vue-router'

import { hashTarget } from '~/lib/hash'

const positionOf = (to: RouteLocationNormalized) => {
  const element = to.hash ? hashTarget(to.hash) : null
  if (!element) return { top: 0 }
  return { el: element, top: Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0 }
}

export default {
  scrollBehavior: (to, from, savedPosition) => {
    if (to.path === from.path) {
      if (savedPosition) return savedPosition
      if ((window.history.state as { demo?: boolean } | null)?.demo) return false
      return to.hash ? positionOf(to) : false
    }
    const nuxtApp = useNuxtApp()
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce('page:finish', () => {
        requestAnimationFrame(() => resolve(savedPosition ?? positionOf(to)))
      })
    })
  },
} satisfies RouterConfig
