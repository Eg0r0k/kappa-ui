import { createToaster } from '@/ui/toast'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createToaster())
})
