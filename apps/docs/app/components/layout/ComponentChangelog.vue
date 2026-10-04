<script setup lang="ts">
import ChangelogTimeline from '~/components/ChangelogTimeline.vue'
import type { ChangelogData } from '~~/scripts/lib/changelog'

const props = defineProps<{ component: string }>()

const { data: releases } = await useAsyncData(`changelog:${props.component}`, async () => {
  const { default: changelog } = await import('~/generated/changelog.json')
  return (changelog as unknown as ChangelogData).items[props.component]?.releases ?? []
})
</script>

<template>
  <section aria-labelledby="changelog" data-slot="component-changelog" class="mt-12 flex flex-col gap-6">
    <h2 id="changelog" class="scroll-mt-20 text-2xl font-semibold tracking-tight">Changelog</h2>
    <ChangelogTimeline v-if="releases?.length" :releases="releases" />
    <p v-else class="text-body-md text-muted-foreground">No changes yet.</p>
  </section>
</template>
