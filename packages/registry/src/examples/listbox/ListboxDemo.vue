<script setup lang="ts">
import { ref } from "vue";

import { Listbox, ListboxItem } from "@/ui/listbox";

defineOptions({ inheritAttrs: false });

const frameworks = ["Nuxt", "Vite", "Astro", "Laravel", "Remix"];
const framework = ref("Nuxt");
</script>

<template>
  <Listbox v-model="framework" aria-label="Framework" class="w-56" v-bind="$attrs">
    <ListboxItem v-for="item in frameworks" :key="item" :value="item">{{ item }}</ListboxItem>
  </Listbox>
</template>
