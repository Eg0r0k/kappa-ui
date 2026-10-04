import { activeHeading } from '~/lib/scroll-spy'

export const useScrollSpy = (ids: () => string[]) => {
  const active = ref<string>()
  let frame = 0

  const measure = () => {
    frame = 0
    const headings = ids().flatMap((id) => {
      const element = document.getElementById(id)
      if (!element) return []
      const margin = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0
      return [{ id, top: element.getBoundingClientRect().top, margin }]
    })
    active.value = activeHeading(headings)
  }

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(measure)
  }

  onMounted(() => {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    watch(ids, () => nextTick(schedule), { immediate: true })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    cancelAnimationFrame(frame)
  })

  return active
}
