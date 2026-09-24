<script setup lang="ts">
import { CircleCheck } from "@lucide/vue";
import { ref } from "vue";

import { Listbox, ListboxContent, ListboxDescription, ListboxItem, ListboxTitle } from "@/ui/listbox";

const plans = [
  { value: "hobby", title: "Hobby", description: "1 project, community support" },
  { value: "pro", title: "Pro", description: "Unlimited projects, email support" },
  { value: "team", title: "Team", description: "Shared workspaces and SSO" },
];
const plan = ref("pro");
</script>

<template>
  <Listbox v-model="plan" selection-behavior="replace" aria-label="Plan" class="w-full max-w-sm">
    <ListboxItem v-for="item in plans" :key="item.value" :value="item.value">
      <ListboxContent>
        <ListboxTitle>{{ item.title }}</ListboxTitle>
        <ListboxDescription>{{ item.description }}</ListboxDescription>
      </ListboxContent>
      <template #indicator-icon>
        <CircleCheck class="size-5" />
      </template>
    </ListboxItem>
  </Listbox>
</template>
