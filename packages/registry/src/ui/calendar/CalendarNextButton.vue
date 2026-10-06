<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import { CalendarNext, type CalendarNextProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/button";
import { calendarNavButton } from ".";

const props = defineProps<CalendarNextProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarNext
    v-bind="delegated"
    data-slot="calendar-next-button"
    data-color="neutral"
    :class="cn(buttonVariants({ variant: 'ghost', size: null }), calendarNavButton, props.class)"
  >
    <slot>
      <ChevronRight class="rtl:rotate-180" />
    </slot>
  </CalendarNext>
</template>
