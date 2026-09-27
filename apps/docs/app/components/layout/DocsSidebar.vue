<script setup lang="ts">
import { ScrollArea } from '@/ui/scroll-area'

const emit = defineEmits<{ navigate: [] }>()

const sections = useDocsNavigation()
</script>

<template>
  <ScrollArea class="h-full">
    <nav aria-label="Documentation" class="px-4 py-6 text-sm">
      <div v-for="section in sections" :key="section.path" class="mb-6">
        <p class="mb-2 px-2 font-medium">{{ section.title }}</p>
        <ul class="grid gap-0.5">
          <li v-for="item in section.children ?? []" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:focus-ring aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground"
              @click="emit('navigate')"
            >
              {{ item.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
  </ScrollArea>
</template>
