<script setup lang="ts">
import { HoverCardTrigger, type HoverCardTriggerProps } from "@kappa-ui/core/hover-card";

const props = defineProps<HoverCardTriggerProps>();
</script>

<template>
  <HoverCardTrigger data-slot="hover-card-trigger" v-bind="props">
    <slot />
  </HoverCardTrigger>
</template>
