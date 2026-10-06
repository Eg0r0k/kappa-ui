<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { CalendarDays } from "@lucide/vue";
import type { DateRange } from "reka-ui";
import { computed, ref, shallowRef } from "vue";

import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { RangeCalendar } from "@/ui/range-calendar";

const open = ref(false);
const trip = shallowRef<DateRange | null>({
  start: new CalendarDate(2026, 10, 6),
  end: new CalendarDate(2026, 10, 12),
});

const formatter = new DateFormatter("en-US", { month: "short", day: "numeric", year: "numeric" });
const label = computed(() => {
  const { start, end } = trip.value ?? {};
  if (!start) return "Pick your dates";
  const from = start.toDate(getLocalTimeZone());
  return end ? formatter.formatRange(from, end.toDate(getLocalTimeZone())) : `${formatter.format(from)} – …`;
});
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" color="neutral" class="min-w-64 justify-start">
        <CalendarDays data-icon="inline-start" />
        {{ label }}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-auto p-3">
      <!-- Closes only on a finished range; Escape mid-pick restores the last one, and closes too. -->
      <RangeCalendar
        v-model="trip"
        :number-of-months="2"
        paged-navigation
        initial-focus
        calendar-label="Trip"
        @update:valid-model-value="open = false"
      />
    </PopoverContent>
  </Popover>
</template>
