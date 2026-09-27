<script setup lang="ts">
import { ref } from 'vue'

import { provideOverlayPortalTarget } from '@kappa-ui/core/overlay'
import ButtonsCard from '~/components/themes/preview/ButtonsCard.vue'
import InboxCard from '~/components/themes/preview/InboxCard.vue'
import InvoicesCard from '~/components/themes/preview/InvoicesCard.vue'
import NotificationsCard from '~/components/themes/preview/NotificationsCard.vue'
import PlanCard from '~/components/themes/preview/PlanCard.vue'
import PlayerCard from '~/components/themes/preview/PlayerCard.vue'
import ProjectCard from '~/components/themes/preview/ProjectCard.vue'
import ReplyCard from '~/components/themes/preview/ReplyCard.vue'
import ShareCard from '~/components/themes/preview/ShareCard.vue'
import SignUpCard from '~/components/themes/preview/SignUpCard.vue'
import TeamCard from '~/components/themes/preview/TeamCard.vue'
import TypographyCard from '~/components/themes/preview/TypographyCard.vue'
import { previewGroup } from '~/lib/theme-preview'
import { ScrollArea } from '@/ui/scroll-area'
import { Toaster } from '@/ui/toast'

const portalTarget = ref<HTMLElement>()
provideOverlayPortalTarget(portalTarget)
</script>

<template>
  <div data-theme-preview class="flex flex-col overflow-hidden rounded-2xl border bg-background text-foreground">
    <div class="flex h-12 shrink-0 items-center justify-between gap-2 border-b ps-4 pe-2">
      <span class="text-label-lg text-muted-foreground">Preview</span>
      <slot name="actions" />
    </div>

    <ScrollArea class="min-h-0 flex-1">
      <div class="@container p-4 sm:p-6">
        <div class="gap-4 *:mb-4 *:break-inside-avoid @2xl:columns-2 @5xl:columns-3">
          <SignUpCard />
          <TeamCard />
          <PlayerCard />
          <InboxCard />
          <InvoicesCard />
          <ShareCard />
          <PlanCard />
          <ReplyCard />
          <NotificationsCard />
          <ProjectCard />
          <ButtonsCard />
          <TypographyCard />
        </div>
      </div>
    </ScrollArea>

    <div ref="portalTarget" data-slot="preview-portal" class="contents text-foreground" />
    <Toaster :group="previewGroup" position="bottom-end" />
  </div>
</template>
