<script setup lang="ts">
import { CircleCheck, CircleDashed, CircleDot } from "@lucide/vue";
import { computed, ref } from "vue";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const statuses = [
  { value: "backlog", label: "Backlog", icon: CircleDashed },
  { value: "progress", label: "In progress", icon: CircleDot },
  { value: "done", label: "Done", icon: CircleCheck },
];
const status = ref("progress");
const selected = computed(() => statuses.find((item) => item.value === status.value));
</script>

<template>
  <Select v-model="status">
    <SelectTrigger class="w-48" aria-label="Status">
      <SelectValue class="flex items-center gap-2">
        <component :is="selected.icon" v-if="selected" class="text-muted-foreground" />
        {{ selected?.label }}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="item in statuses" :key="item.value" :value="item.value">
        <component :is="item.icon" class="text-muted-foreground" />
        {{ item.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
