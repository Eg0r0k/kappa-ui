<script setup lang="ts">
import { provideOverlayPortalTarget } from '@kappa-ui/core/overlay'
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

import BookCallCard from '~/components/home/cards/BookCallCard.vue'
import DeployCard from '~/components/home/cards/DeployCard.vue'
import InboxCard from '~/components/home/cards/InboxCard.vue'
import InviteCard from '~/components/home/cards/InviteCard.vue'
import NotificationsCard from '~/components/home/cards/NotificationsCard.vue'
import PlayerCard from '~/components/home/cards/PlayerCard.vue'
import SearchCard from '~/components/home/cards/SearchCard.vue'
import SendMoneyCard from '~/components/home/cards/SendMoneyCard.vue'
import TasksCard from '~/components/home/cards/TasksCard.vue'
import VerifyCard from '~/components/home/cards/VerifyCard.vue'
import type { ShowcaseStyleKey } from '~/lib/showcase-styles'

const props = defineProps<{ styleKey: ShowcaseStyleKey }>()

const portal = ref<HTMLElement>()
provideOverlayPortalTarget(portal)

const viewport = useTemplateRef('viewport')
let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) (entry.target as HTMLElement).inert = entry.intersectionRatio < 0.5
    },
    { root: viewport.value, threshold: 0.5 },
  )
  for (const card of viewport.value?.querySelectorAll('[data-showcase-card]') ?? []) observer.observe(card)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section
    data-slot="home-showcase"
    :data-showcase-style="props.styleKey === 'kappa' ? undefined : props.styleKey"
    aria-label="Component showcase"
    class="relative bg-muted/60 text-foreground [view-transition-name:home-showcase] data-[showcase-style]:bg-background sm:max-lg:mx-5 sm:max-lg:rounded-3xl lg:rounded-s-3xl [:active-view-transition_&_*]:transition-none!"
  >
    <div
      ref="viewport"
      class="relative size-full overflow-clip sm:max-lg:rounded-3xl lg:rounded-s-3xl lg:mask-b-from-75%"
    >
      <div class="flex gap-4 p-5 max-sm:flex-col sm:p-6 sm:max-lg:block sm:max-lg:columns-2 lg:p-8">
        <div class="flex w-76 flex-none flex-col gap-4 max-lg:contents lg:pt-20">
          <VerifyCard class="max-sm:order-3" />
          <NotificationsCard class="max-sm:hidden" />
          <InviteCard class="max-sm:hidden" />
        </div>
        <div class="flex w-76 flex-none flex-col gap-4 max-lg:contents">
          <PlayerCard class="max-sm:order-2" />
          <InboxCard class="max-sm:order-1" />
          <BookCallCard class="max-sm:hidden" />
        </div>
        <div class="flex w-76 flex-none flex-col gap-4 max-lg:contents lg:pt-10">
          <SendMoneyCard class="max-sm:hidden" />
          <TasksCard class="max-sm:order-4" />
          <DeployCard class="max-sm:hidden" />
          <SearchCard class="max-sm:hidden" />
        </div>
      </div>
    </div>
    <div ref="portal" data-showcase-portal />
  </section>
</template>
