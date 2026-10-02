<script setup lang="ts">
import { ChevronsUpDown } from "@lucide/vue";
import { ref } from "vue";

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

const frameworks = [
  { value: "astro", label: "Astro" },
  { value: "next", label: "Next.js" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "solid-start", label: "SolidStart" },
  { value: "sveltekit", label: "SvelteKit" },
];
const framework = ref<(typeof frameworks)[number]>();
</script>

<template>
  <Combobox v-model="framework" by="value">
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <Button variant="outline" color="neutral" class="w-56 justify-between">
          {{ framework?.label ?? "Select a framework" }}
          <ChevronsUpDown data-icon="inline-end" class="text-muted-foreground" />
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList>
      <ComboboxInput placeholder="Search frameworks" aria-label="Search frameworks" />
      <ComboboxViewport>
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        <ComboboxItem v-for="item in frameworks" :key="item.value" :value="item">{{ item.label }}</ComboboxItem>
      </ComboboxViewport>
    </ComboboxList>
  </Combobox>
</template>
