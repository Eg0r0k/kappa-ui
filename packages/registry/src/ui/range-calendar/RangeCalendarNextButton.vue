<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import { RangeCalendarNext, type RangeCalendarNextProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/button";
import { calendarNavButton } from "@/ui/calendar";

const props = defineProps<RangeCalendarNextProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarNext
    v-bind="delegated"
    data-slot="range-calendar-next-button"
    data-color="neutral"
    :class="cn(buttonVariants({ variant: 'ghost', size: null }), calendarNavButton, props.class)"
  >
    <slot>
      <ChevronRight class="rtl:rotate-180" />
    </slot>
  </RangeCalendarNext>
</template>
