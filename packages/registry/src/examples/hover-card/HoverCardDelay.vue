<script setup lang="ts">
import { Button } from "@/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/ui/hover-card";

const cards = [
  { label: "Instant", openDelay: 0, closeDelay: 0 },
  { label: "Default", openDelay: 700, closeDelay: 300 },
  { label: "Slow", openDelay: 1000, closeDelay: 500 },
];
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <HoverCard v-for="card in cards" :key="card.label" :open-delay="card.openDelay" :close-delay="card.closeDelay">
      <HoverCardTrigger as-child>
        <Button variant="link">{{ card.label }}</Button>
      </HoverCardTrigger>
      <HoverCardContent class="w-auto text-body-md">
        Opens after {{ card.openDelay }} ms, closes {{ card.closeDelay }} ms after the pointer leaves.
      </HoverCardContent>
    </HoverCard>
  </div>
</template>
