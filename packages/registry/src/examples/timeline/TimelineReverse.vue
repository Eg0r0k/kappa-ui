<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
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

const releases = [
  { value: "2.0", date: "Oct 2026", datetime: "2026-10", title: "2.0", description: "New theme and radius roles." },
  { value: "1.5", date: "Jul 2026", datetime: "2026-07", title: "1.5", description: "Swipe views and drawers." },
  { value: "1.0", date: "Mar 2026", datetime: "2026-03", title: "1.0", description: "First stable release." },
  { value: "0.1", date: "Jan 2026", datetime: "2026-01", title: "0.1", description: "Buttons, inputs and a theme." },
];

const current = ref("1.5");
const index = () => releases.findIndex((release) => release.value === current.value);
const later = () => (current.value = releases[Math.max(0, index() - 1)]!.value);
const earlier = () => (current.value = releases[Math.min(releases.length - 1, index() + 1)]!.value);
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-6">
    <div class="flex gap-2">
      <Button variant="outline" size="sm" :disabled="index() === releases.length - 1" @click="earlier">Earlier</Button>
      <Button variant="outline" size="sm" :disabled="index() === 0" @click="later">Later</Button>
    </div>
    <Timeline v-model="current" reverse aria-label="Releases, newest first">
      <TimelineItem v-for="release in releases" :key="release.value" :value="release.value">
        <TimelineIndicator>{{ release.value }}</TimelineIndicator>
        <TimelineSeparator />
        <TimelineContent>
          <TimelineDate :datetime="release.datetime">{{ release.date }}</TimelineDate>
          <TimelineTitle>Version {{ release.title }}</TimelineTitle>
          <TimelineDescription>{{ release.description }}</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  </div>
</template>
