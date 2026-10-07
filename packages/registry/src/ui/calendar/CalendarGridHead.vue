<script setup lang="ts">
import { CalendarGridHead, type CalendarGridHeadProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<CalendarGridHeadProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarGridHead v-bind="delegated" data-slot="calendar-grid-head" :class="cn(props.class)">
    <slot />
  </CalendarGridHead>
</template>
