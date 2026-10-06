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
    class="relative bg-muted/60 text-foreground max-lg:mx-4 max-lg:rounded-3xl lg:rounded-s-3xl"
  >
    <div ref="viewport" class="relative size-full overflow-clip mask-b-from-75% max-lg:rounded-3xl lg:rounded-s-3xl">
      <div
        class="flex gap-4 p-6 [view-transition-name:home-showcase] max-lg:mx-auto max-lg:max-w-sm max-lg:flex-col lg:p-8"
      >
        <div class="flex w-76 flex-none flex-col gap-4 max-lg:contents lg:pt-20">
          <VerifyCard class="max-lg:order-3" />
          <NotificationsCard class="max-lg:order-5" />
          <InviteCard class="max-lg:order-5" />
        </div>
        <div class="flex w-76 flex-none flex-col gap-4 max-lg:contents">
          <PlayerCard class="max-lg:order-2" />
          <InboxCard class="max-lg:order-1" />
          <BookCallCard class="max-lg:order-5" />
        </div>
        <div class="flex w-76 flex-none flex-col gap-4 max-lg:contents lg:pt-10">
          <SendMoneyCard class="max-lg:order-5" />
          <TasksCard class="max-lg:order-4" />
          <DeployCard class="max-lg:order-5" />
          <SearchCard class="max-lg:order-5" />
        </div>
      </div>
    </div>
    <div ref="portal" data-showcase-portal />
  </section>
</template>
