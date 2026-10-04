import { pickActiveHeading } from '~/lib/toc'

export const useScrollSpy = (ids: () => string[]) => {
  const active = ref<string>()
  const visible = new Set<string>()
  let observer: IntersectionObserver | undefined

  const observe = () => {
    observer?.disconnect()
    visible.clear()
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        active.value = pickActiveHeading(ids(), visible, active.value ?? null) ?? undefined
      },
      { rootMargin: '-56px 0px -60% 0px' },
    )
    for (const id of ids()) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
  }

  onMounted(() => {
    watch(ids, () => nextTick(observe), { immediate: true })
  })
  onBeforeUnmount(() => observer?.disconnect())

  return active
}
