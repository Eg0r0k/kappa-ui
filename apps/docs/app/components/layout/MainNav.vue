<script setup lang="ts">
import { Button } from '@/ui/button'
import { COMPONENTS_PATH, sectionOf } from '~/lib/sidebar'

const emit = defineEmits<{ navigate: [] }>()
const route = useRoute()
const section = computed(() => (route.path.startsWith('/docs') ? sectionOf(route.path) : undefined))

const links = [
  { key: 'docs', label: 'Docs', to: '/docs/getting-started/introduction' },
  { key: 'components', label: 'Components', to: COMPONENTS_PATH },
] as const
</script>

<template>
  <nav aria-label="Main" class="flex items-center gap-1">
    <Button
      v-for="link in links"
      :key="link.key"
      variant="ghost"
      color="neutral"
      size="sm"
      as-child
      :class="section === link.key ? 'text-foreground' : 'text-muted-foreground'"
    >
      <NuxtLink :to="link.to" @click="emit('navigate')">{{ link.label }}</NuxtLink>
    </Button>
  </nav>
</template>
