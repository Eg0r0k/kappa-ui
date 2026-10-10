<script setup lang="ts">
import { Tag } from '@lucide/vue'

import { Badge } from '@/ui/badge'
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/ui/timeline'
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
  <Timeline size="sm" aria-label="Releases">
    <TimelineItem v-for="release in props.releases" :key="`${release.package}@${release.version}`">
      <TimelineIndicator>
        <Tag />
      </TimelineIndicator>
      <TimelineSeparator />
      <TimelineContent class="gap-2">
        <div class="flex items-center justify-between gap-2">
          <TimelineTitle>
            <Badge variant="soft" :color="release.package === 'registry' ? 'primary' : 'neutral'">
              {{ release.package }} {{ release.version }}
            </Badge>
          </TimelineTitle>
          <TimelineDate :datetime="release.date">{{ format.format(new Date(release.date)) }}</TimelineDate>
        </div>
        <TimelineDescription as="div" class="flex flex-col gap-3 text-body-md text-foreground">
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
        </TimelineDescription>
      </TimelineContent>
    </TimelineItem>
  </Timeline>
</template>
