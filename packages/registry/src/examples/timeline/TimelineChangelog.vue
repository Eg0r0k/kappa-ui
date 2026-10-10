<script setup lang="ts">
import { Bug, GitCommit, Tag } from "@lucide/vue";

import { Badge } from "@/ui/badge";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/ui/timeline";
</script>

<template>
  <Timeline size="sm" class="w-full max-w-md" aria-label="Changelog">
    <TimelineItem value="0.15.0">
      <TimelineIndicator><Tag /></TimelineIndicator>
      <TimelineSeparator />
      <TimelineContent class="gap-2">
        <div class="flex items-center justify-between gap-2">
          <TimelineTitle><Badge variant="soft">registry 0.15.0</Badge></TimelineTitle>
          <TimelineDate datetime="2026-10-09">Oct 9, 2026</TimelineDate>
        </div>
        <TimelineDescription as="div" class="flex flex-col gap-2 text-body-md text-foreground">
          <p>Timeline: eight parts for a record of events, with a current one, in five sizes and six colours.</p>
          <p>Marquee: content that scrolls forever, with a pause on hover and a fade at the edges.</p>
        </TimelineDescription>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem value="incident">
      <TimelineIndicator color="destructive"><Bug /></TimelineIndicator>
      <TimelineSeparator />
      <TimelineContent class="gap-2">
        <div class="flex items-center justify-between gap-2">
          <TimelineTitle>Regression in Select</TimelineTitle>
          <TimelineDate datetime="2026-10-07">Oct 7, 2026</TimelineDate>
        </div>
        <TimelineDescription>The list opened under a sticky header. Fixed in 0.14.1 the same day.</TimelineDescription>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem value="0.14.0">
      <TimelineIndicator><GitCommit /></TimelineIndicator>
      <TimelineSeparator />
      <TimelineContent class="gap-2">
        <div class="flex items-center justify-between gap-2">
          <TimelineTitle><Badge variant="soft" color="neutral">core 0.14.0</Badge></TimelineTitle>
          <TimelineDate datetime="2026-10-06">Oct 6, 2026</TimelineDate>
        </div>
        <TimelineDescription>Radius roles and the swipe-snap pager.</TimelineDescription>
      </TimelineContent>
    </TimelineItem>
  </Timeline>
</template>
