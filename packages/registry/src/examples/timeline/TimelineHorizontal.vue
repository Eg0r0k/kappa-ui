<script setup lang="ts">
import { CircleCheck, Code, Palette, Rocket } from "@lucide/vue";

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

const milestones = [
  {
    value: "kickoff",
    date: "Mar 15",
    datetime: "2026-03-15",
    title: "Kickoff",
    description: "Team alignment.",
    icon: Rocket,
  },
  {
    value: "design",
    date: "Mar 22",
    datetime: "2026-03-22",
    title: "Design",
    description: "Wireframes and prototypes.",
    icon: Palette,
  },
  {
    value: "build",
    date: "Mar 29",
    datetime: "2026-03-29",
    title: "Build",
    description: "Features and APIs.",
    icon: Code,
  },
  {
    value: "release",
    date: "Apr 5",
    datetime: "2026-04-05",
    title: "Release",
    description: "QA and deploy.",
    icon: CircleCheck,
  },
];
</script>

<template>
  <div class="w-full overflow-x-auto">
    <Timeline orientation="horizontal" default-value="build" class="min-w-[36rem]">
      <TimelineItem v-for="milestone in milestones" :key="milestone.value" :value="milestone.value">
        <TimelineIndicator><component :is="milestone.icon" /></TimelineIndicator>
        <TimelineSeparator />
        <TimelineContent>
          <TimelineDate :datetime="milestone.datetime">{{ milestone.date }}</TimelineDate>
          <TimelineTitle>{{ milestone.title }}</TimelineTitle>
          <TimelineDescription>{{ milestone.description }}</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  </div>
</template>
