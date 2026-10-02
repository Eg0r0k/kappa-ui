<script setup lang="ts">
import { ref } from "vue";

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

const frameworks = ["Astro", "Next.js", "Nuxt", "Remix", "SolidStart", "SvelteKit"];
const framework = ref<string>();
</script>

<template>
  <Combobox v-model="framework">
    <ComboboxAnchor class="w-56">
      <ComboboxInput placeholder="Select a framework" aria-label="Framework" />
      <ComboboxTrigger />
    </ComboboxAnchor>
    <ComboboxList>
      <ComboboxViewport>
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        <ComboboxItem v-for="item in frameworks" :key="item" :value="item">{{ item }}</ComboboxItem>
      </ComboboxViewport>
    </ComboboxList>
  </Combobox>
</template>
