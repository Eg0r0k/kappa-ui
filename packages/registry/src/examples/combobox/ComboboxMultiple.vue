<script setup lang="ts">
import { ChevronsUpDown } from "@lucide/vue";
import { computed, ref } from "vue";

import { Button } from "@/ui/button";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from "@/ui/combobox";

const labels = ["Bug", "Docs", "Feature", "Performance", "Question", "Security"];
const selected = ref<string[]>(["Bug"]);
const summary = computed(() => (selected.value.length ? selected.value.join(", ") : "Select labels"));
</script>

<template>
  <Combobox v-model="selected" multiple>
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <Button variant="outline" color="neutral" class="w-64 justify-between">
          <span class="truncate">{{ summary }}</span>
          <ChevronsUpDown data-icon="inline-end" class="text-muted-foreground" />
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList>
      <ComboboxInput placeholder="Search labels" aria-label="Search labels" />
      <ComboboxViewport>
        <ComboboxEmpty>No label found.</ComboboxEmpty>
        <ComboboxItem v-for="label in labels" :key="label" :value="label">{{ label }}</ComboboxItem>
      </ComboboxViewport>
    </ComboboxList>
  </Combobox>
</template>
