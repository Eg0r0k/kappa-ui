import { type MaybeRefOrGetter, type Ref, type WatchSource, onMounted, ref, toValue, watch } from 'vue'

import { type ContrastCheck, type ContrastResult, createContrastMeter } from '~/lib/contrast'

const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

export const useContrast = (
  scope: Ref<HTMLElement | null | undefined>,
  checks: MaybeRefOrGetter<readonly ContrastCheck[]>,
  source?: WatchSource,
) => {
  const results = ref<ContrastResult[]>([])
  const colorMode = useColorMode()
  let meter: ReturnType<typeof createContrastMeter> | undefined

  const measure = async () => {
    await frame()
    if (!scope.value) return
    meter ??= createContrastMeter()
    results.value = meter(scope.value, toValue(checks))
  }

  onMounted(() => {
    watch([() => colorMode.value, () => toValue(checks), ...(source ? [source] : [])], measure, {
      immediate: true,
      deep: true,
    })
  })

  return results
}
