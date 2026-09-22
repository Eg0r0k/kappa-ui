<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { flattenToc, pickActiveHeading, type TocLink } from '~/lib/toc'

const props = defineProps<{ links: TocLink[] }>()

const flat = computed(() => flattenToc(props.links))
const active = ref<string | null>(null)
const visible = new Set<string>()
let observer: IntersectionObserver | null = null

const observe = () => {
  observer?.disconnect()
  visible.clear()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id)
        else visible.delete(entry.target.id)
      }
      active.value = pickActiveHeading(
        flat.value.map((link) => link.id),
        visible,
        active.value,
      )
    },
    { rootMargin: '-56px 0px -60% 0px' },
  )
  for (const link of flat.value) {
    const element = document.getElementById(link.id)
    if (element) observer.observe(element)
  }
}

onMounted(observe)
watch(flat, () => nextTick(observe))
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav v-if="flat.length" aria-label="On this page" class="text-sm">
    <p class="mb-3 font-medium">On this page</p>
    <ul class="grid gap-2">
      <li v-for="link in flat" :key="link.id" :class="link.depth > 2 && 'ps-4'">
        <a
          :href="`#${link.id}`"
          :aria-current="active === link.id ? 'location' : undefined"
          :class="[
            'block transition-colors hover:text-foreground',
            active === link.id ? 'font-medium text-foreground' : 'text-muted-foreground',
          ]"
        >
          {{ link.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
