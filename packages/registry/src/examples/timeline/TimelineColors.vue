<script setup lang="ts">
import { TriangleAlert } from "@lucide/vue";

import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/ui/timeline";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;

const steps = [
  { value: "ordered", title: "Ordered" },
  { value: "paid", title: "Paid" },
  { value: "shipped", title: "Shipped" },
];
</script>

<template>
  <div class="flex w-full flex-col gap-10">
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Timeline v-for="color in colors" :key="color" :color="color" size="sm" default-value="paid" :aria-label="color">
        <TimelineItem v-for="step in steps" :key="step.value" :value="step.value">
          <TimelineIndicator />
          <TimelineSeparator />
          <TimelineContent>
            <TimelineTitle>{{ step.title }}</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
    <Timeline size="sm" class="max-w-sm" aria-label="Deploy log">
      <TimelineItem value="build">
        <TimelineIndicator />
        <TimelineSeparator />
        <TimelineContent>
          <TimelineTitle>Build passed</TimelineTitle>
          <TimelineDescription>All 212 tests green.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem value="deploy">
        <TimelineIndicator color="destructive"><TriangleAlert /></TimelineIndicator>
        <TimelineSeparator />
        <TimelineContent>
          <TimelineTitle>Deploy failed</TimelineTitle>
          <TimelineDescription>Health check timed out after 30s.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem value="rollback">
        <TimelineIndicator />
        <TimelineSeparator />
        <TimelineContent>
          <TimelineTitle>Rolled back</TimelineTitle>
          <TimelineDescription>Previous release restored.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  </div>
</template>
