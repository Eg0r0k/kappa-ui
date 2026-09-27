import { createToaster } from '@/components/ui/toast'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createToaster())
})
