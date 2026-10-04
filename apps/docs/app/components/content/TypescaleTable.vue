<script setup lang="ts">
import TableFrame from '~/components/TableFrame.vue'
import { onMounted, ref } from 'vue'

const roles = [
  { name: 'display-lg', class: 'text-display-lg' },
  { name: 'display-md', class: 'text-display-md' },
  { name: 'display-sm', class: 'text-display-sm' },
  { name: 'headline-lg', class: 'text-headline-lg' },
  { name: 'headline-md', class: 'text-headline-md' },
  { name: 'headline-sm', class: 'text-headline-sm' },
  { name: 'title-lg', class: 'text-title-lg' },
  { name: 'title-md', class: 'text-title-md' },
  { name: 'title-sm', class: 'text-title-sm' },
  { name: 'body-lg', class: 'text-body-lg' },
  { name: 'body-md', class: 'text-body-md' },
  { name: 'body-sm', class: 'text-body-sm' },
  { name: 'label-lg', class: 'text-label-lg' },
  { name: 'label-md', class: 'text-label-md' },
  { name: 'label-sm', class: 'text-label-sm' },
] as const

const resolved = ref<Record<string, string>>({})

onMounted(() => {
  const style = getComputedStyle(document.documentElement)
  const read = (name: string, property: string) => style.getPropertyValue(`--typescale-${name}-${property}`).trim()
  resolved.value = Object.fromEntries(
    roles.map((role) => [
      role.name,
      `${read(role.name, 'size')} / ${read(role.name, 'line-height')} · ${read(role.name, 'weight')}`,
    ]),
  )
})
</script>

<template>
  <TableFrame class="my-6">
    <div class="divide-y">
      <div
        v-for="role in roles"
        :key="role.name"
        class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3"
      >
        <span :class="[role.class, 'min-w-0 break-words']">{{ role.name.replace('-', ' ') }}</span>
        <span class="shrink-0 font-mono text-xs text-muted-foreground">
          text-{{ role.name }} <span class="ml-2">{{ resolved[role.name] }}</span>
        </span>
      </div>
    </div>
  </TableFrame>
</template>
