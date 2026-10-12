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

defineOptions({ inheritAttrs: false });

const milestones = [
  {
    value: "kickoff",
    datetime: "2026-03-15",
    date: "Mar 15, 2026",
    title: "Project kickoff",
    description: "Aligned the team, set the milestones and allocated resources.",
    icon: Rocket,
  },
  {
    value: "design",
    datetime: "2026-03-22",
    date: "Mar 22, 2026",
    title: "Design phase",
    description: "User research, wireframes and prototypes for testing.",
    icon: Palette,
  },
  {
    value: "build",
    datetime: "2026-03-29",
    date: "Mar 29, 2026",
    title: "Development sprint",
    description: "Core features, API integration and the first internal build.",
    icon: Code,
  },
  {
    value: "release",
    datetime: "2026-04-05",
    date: "Apr 5, 2026",
    title: "Testing and release",
    description: "QA, performance work and the production deploy.",
    icon: CircleCheck,
  },
];
</script>

<template>
  <Timeline default-value="design" class="w-full max-w-sm" v-bind="$attrs">
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
</template>
