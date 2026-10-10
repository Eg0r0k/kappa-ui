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
  <Timeline default-value="build" class="w-full max-w-lg">
    <TimelineItem
      v-for="(milestone, index) in milestones"
      :key="milestone.value"
      :value="milestone.value"
      class="grid-cols-[1fr_auto_1fr]"
    >
      <TimelineIndicator class="col-start-2"><component :is="milestone.icon" /></TimelineIndicator>
      <TimelineSeparator class="col-start-2" />
      <TimelineContent :class="index % 2 ? 'col-start-3' : 'col-start-1 text-end'">
        <TimelineDate :datetime="milestone.datetime">{{ milestone.date }}</TimelineDate>
        <TimelineTitle>{{ milestone.title }}</TimelineTitle>
        <TimelineDescription>{{ milestone.description }}</TimelineDescription>
      </TimelineContent>
    </TimelineItem>
  </Timeline>
</template>
