<script setup lang="ts">
import { Tag } from '@lucide/vue'

import { Badge } from '@/ui/badge'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from '@/ui/stepper'
import InlineText from '~/components/content/InlineText.vue'

type Release = {
  package: 'registry' | 'core'
  version: string
  date: string
  entries: { hash?: string; url?: string; text: string }[]
}

const props = defineProps<{ releases: Release[] }>()

const format = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' })
const paragraphs = (text: string) => text.split(/\n{2,}/)
</script>

<template>
  <Stepper as="ol" orientation="vertical" size="sm" :model-value="1" class="flex flex-col gap-8">
    <StepperItem
      v-for="(release, index) in props.releases"
      :key="`${release.package}@${release.version}`"
      as="li"
      :step="index + 1"
      class="relative flex items-start gap-4"
    >
      <StepperSeparator v-if="index < props.releases.length - 1" class="absolute start-3.5 top-8 -bottom-8 w-px" />
      <StepperIndicator>
        <Tag />
      </StepperIndicator>
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <StepperTitle class="flex items-center justify-between gap-2">
          <Badge variant="soft" :color="release.package === 'registry' ? 'primary' : 'neutral'">
            {{ release.package }} {{ release.version }}
          </Badge>
          <time :datetime="release.date" class="text-body-sm font-normal text-muted-foreground">
            {{ format.format(new Date(release.date)) }}
          </time>
        </StepperTitle>
        <StepperDescription as="div" class="flex flex-col gap-3 text-body-md text-foreground">
          <div v-for="(entry, index) in release.entries" :key="entry.hash ?? index" class="flex flex-col gap-1.5">
            <p v-for="(paragraph, at) in paragraphs(entry.text)" :key="at">
              <template v-if="at === 0 && entry.hash">
                <a
                  :href="entry.url"
                  target="_blank"
                  rel="noreferrer"
                  class="rounded-sm font-mono text-body-sm text-primary hover:underline focus-visible:focus-ring"
                >
                  {{ entry.hash }}
                </a>
                —
              </template>
              <InlineText :text="paragraph" />
            </p>
          </div>
        </StepperDescription>
      </div>
    </StepperItem>
  </Stepper>
</template>
