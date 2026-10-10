<script setup lang="ts">
import { Check, Package, Truck } from "@lucide/vue";

import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/ui/timeline";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

const steps = [
  { value: "packed", title: "Packed", description: "Left the warehouse", icon: Package },
  { value: "shipped", title: "Shipped", description: "On its way", icon: Truck },
  { value: "delivered", title: "Delivered", description: "Signed for", icon: Check },
];
</script>

<template>
  <div class="grid w-full gap-8 sm:grid-cols-2 lg:grid-cols-3">
    <Timeline v-for="size in sizes" :key="size" :size="size" default-value="shipped" :aria-label="`Size ${size}`">
      <TimelineItem v-for="step in steps" :key="step.value" :value="step.value">
        <TimelineIndicator><component :is="step.icon" /></TimelineIndicator>
        <TimelineSeparator />
        <TimelineContent>
          <TimelineTitle>{{ step.title }}</TimelineTitle>
          <TimelineDescription>{{ step.description }}</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  </div>
</template>
