import { onBeforeUnmount, ref } from 'vue'

export const useCopied = (value: () => string, delay = 1500) => {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  const copy = async () => {
    await navigator.clipboard.writeText(value())
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), delay)
  }

  onBeforeUnmount(() => clearTimeout(timer))

  return { copied, copy }
}
