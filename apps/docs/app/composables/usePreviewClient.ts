import { type Direction, type PreviewEvent, isPreviewState } from '~/lib/preview-protocol'

export const usePreviewClient = () => {
  const colorMode = useColorMode()
  const dir = ref<Direction>('ltr')
  const restart = ref(0)
  const retries = ref(0)
  const error = ref<string>()
  const key = computed(() => `${restart.value}:${retries.value}`)
  let siteTheme: string | undefined

  const post = (event: PreviewEvent) => {
    if (window.parent !== window) window.parent.postMessage(event, window.location.origin)
  }

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin || event.source !== window.parent) return
    if (!isPreviewState(event.data)) return
    const state = event.data
    dir.value = state.dir
    colorMode.forced = true
    // color-mode's page-level forcing writes the same reactive field
    ;(colorMode as { value: string }).value = state.colorScheme
    if (state.restart !== restart.value) {
      restart.value = state.restart
      error.value = undefined
    }
    if (siteTheme !== undefined && state.siteTheme !== siteTheme) refreshCookie('kappa-theme')
    siteTheme = state.siteTheme
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k' || event.defaultPrevented) return
    event.preventDefault()
    post({ type: 'kappa:shortcut' })
  }

  const fail = (message: string) => {
    error.value = message
    post({ type: 'kappa:error', message })
  }

  const retry = () => {
    error.value = undefined
    retries.value += 1
  }

  onMounted(() => {
    window.addEventListener('message', onMessage)
    window.addEventListener('keydown', onKeydown)
    post({ type: 'kappa:ready' })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('message', onMessage)
    window.removeEventListener('keydown', onKeydown)
  })

  return { dir, key, error, fail, retry, post }
}
