import { createDialogs } from '@/ui/dialog'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createDialogs())
})
