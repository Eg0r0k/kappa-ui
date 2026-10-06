<script setup lang="ts">
import { ChevronLeft } from "@lucide/vue";
import { CalendarPrev, type CalendarPrevProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/button";
import { calendarNavButton } from ".";

const props = defineProps<CalendarPrevProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarPrev
    v-bind="delegated"
    data-slot="calendar-prev-button"
    data-color="neutral"
    :class="cn(buttonVariants({ variant: 'ghost', size: null }), calendarNavButton, props.class)"
  >
    <slot>
      <ChevronLeft class="rtl:rotate-180" />
    </slot>
  </CalendarPrev>
</template>
