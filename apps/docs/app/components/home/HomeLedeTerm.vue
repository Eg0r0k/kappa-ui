<script setup lang="ts">
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/ui/hover-card'

defineProps<{ label: string; href: string; text: string }>()
</script>

<template>
  <HoverCard :open-delay="200">
    <HoverCardTrigger as-child>
      <a
        :href="href"
        target="_blank"
        rel="noreferrer"
        class="rounded-xs font-medium text-foreground underline decoration-muted-foreground/50 decoration-dotted underline-offset-4 hover:decoration-foreground focus-visible:focus-ring"
        >{{ label }}</a
      >
    </HoverCardTrigger>
    <HoverCardContent class="flex w-72 flex-col gap-1">
      <p class="text-title-sm">{{ label }}</p>
      <p class="text-body-md text-muted-foreground">{{ text }}</p>
    </HoverCardContent>
  </HoverCard>
</template>
