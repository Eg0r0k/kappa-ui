import { type Direction, type PreviewEvent, type Tone, isPreviewState } from '~/lib/preview-protocol'

export const usePreviewClient = () => {
  const colorMode = useColorMode()
  const dir = ref<Direction>('ltr')
  const color = ref<Tone>('primary')
  const inspect = ref(false)
  const key = ref(0)
  let siteTheme: string | undefined

  const post = (event: PreviewEvent) => {
    if (window.parent !== window) window.parent.postMessage(event, window.location.origin)
  }

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin || event.source !== window.parent) return
    if (!isPreviewState(event.data)) return
    const state = event.data
    dir.value = state.dir
    color.value = state.color
    inspect.value = state.inspect
    key.value = state.restart
    colorMode.forced = true
    // color-mode's page-level forcing writes the same reactive field
    ;(colorMode as { value: string }).value = state.colorScheme
    if (siteTheme !== undefined && state.siteTheme !== siteTheme) refreshCookie('kappa-theme')
    siteTheme = state.siteTheme
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k' || event.defaultPrevented) return
    event.preventDefault()
    post({ type: 'kappa:shortcut' })
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

  return { dir, color, inspect, key, post }
}
