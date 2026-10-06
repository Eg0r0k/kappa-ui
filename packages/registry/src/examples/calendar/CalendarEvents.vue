<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { computed, shallowRef, useId } from "vue";

import { Calendar } from "@/ui/calendar";

const events: Record<string, string[]> = {
  "2026-10-06": ["Design review"],
  "2026-10-09": ["Release 0.13"],
  "2026-10-14": ["Team lunch", "1:1 with Sam"],
  "2026-10-22": ["Retro"],
};

const date = shallowRef<DateValue | undefined>(new CalendarDate(2026, 10, 14));
const summaryId = useId();

const formatter = new DateFormatter("en-US", { month: "long", day: "numeric" });
const agenda = computed(() => (date.value ? (events[date.value.toString()] ?? []) : []));
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-6">
    <!-- The dots are only drawn; the summary below says the same in words. -->
    <Calendar
      v-model="date"
      calendar-label="Team calendar"
      :aria-describedby="summaryId"
      class="rounded-xl border border-border p-3"
    >
      <template #day="{ day, dayValue, selected }">
        <span class="relative">
          {{ dayValue }}
          <span
            v-if="events[day.toString()]"
            aria-hidden="true"
            class="absolute inset-x-0 -bottom-1.5 mx-auto size-1 rounded-full"
            :class="selected ? 'bg-tone-foreground' : 'bg-tone'"
          />
        </span>
      </template>
    </Calendar>
    <div class="flex w-48 flex-col gap-2">
      <p :id="summaryId" class="sr-only">Events on October 6, 9, 14 and 22.</p>
      <p class="text-title-sm">{{ date ? formatter.format(date.toDate(getLocalTimeZone())) : "Pick a day" }}</p>
      <ul class="flex flex-col gap-1 text-body-md" aria-live="polite">
        <li v-for="event in agenda" :key="event">{{ event }}</li>
        <li v-if="date && agenda.length === 0" class="text-muted-foreground">Nothing planned.</li>
      </ul>
    </div>
  </div>
</template>
