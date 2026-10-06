<script setup lang="ts">
import { CalendarDate, PersianCalendar, toCalendar } from "@internationalized/date";
import { ConfigProvider, type DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Calendar } from "@/ui/calendar";

const cairo = shallowRef<DateValue | undefined>(new CalendarDate(2026, 10, 6));
// A date in the Persian calendar, so the grid pages by Persian months.
const tehran = shallowRef<DateValue | undefined>(toCalendar(new CalendarDate(2026, 10, 6), new PersianCalendar()));
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-6">
    <ConfigProvider locale="ar-EG" dir="rtl">
      <div class="flex flex-col items-center gap-2">
        <Calendar v-model="cairo" calendar-label="التاريخ" />
        <span class="text-label-md text-muted-foreground" dir="ltr">ar-EG</span>
      </div>
    </ConfigProvider>
    <ConfigProvider locale="fa-IR" dir="rtl">
      <div class="flex flex-col items-center gap-2">
        <Calendar v-model="tehran" calendar-label="تاریخ" />
        <span class="text-label-md text-muted-foreground" dir="ltr">fa-IR, Persian calendar</span>
      </div>
    </ConfigProvider>
  </div>
</template>
