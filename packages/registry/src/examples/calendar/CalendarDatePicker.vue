<script setup lang="ts">
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { CalendarDays } from "@lucide/vue";
import type { DateValue } from "reka-ui";
import { ref, shallowRef } from "vue";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

const open = ref(false);
const date = shallowRef<DateValue | undefined>();

const formatter = new DateFormatter("en-US", { dateStyle: "medium" });

const pick = (value: DateValue | undefined) => {
  date.value = value;
  if (value) open.value = false;
};
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" color="neutral" class="w-56 justify-start">
        <CalendarDays data-icon="inline-start" />
        <span :class="date ? '' : 'text-muted-foreground'">
          {{ date ? formatter.format(date.toDate(getLocalTimeZone())) : "Pick a date" }}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-auto p-3">
      <Calendar :model-value="date" initial-focus calendar-label="Date" @update:model-value="pick" />
    </PopoverContent>
  </Popover>
</template>
