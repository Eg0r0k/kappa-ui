<script setup lang="ts">
import { ref } from "vue";

import { Listbox, ListboxItem } from "@/ui/listbox";
import { ScrollArea } from "@/ui/scroll-area";

const languages = [
  "Arabic",
  "Bengali",
  "Chinese",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Norwegian",
  "Polish",
  "Portuguese",
  "Russian",
  "Spanish",
  "Swedish",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
];
const language = ref("English");
</script>

<template>
  <ScrollArea class="h-64 w-56 rounded-xl border bg-card">
    <Listbox v-model="language" variant="ghost" aria-label="Language" class="p-1">
      <ListboxItem v-for="item in languages" :key="item" :value="item">{{ item }}</ListboxItem>
    </Listbox>
  </ScrollArea>
</template>
