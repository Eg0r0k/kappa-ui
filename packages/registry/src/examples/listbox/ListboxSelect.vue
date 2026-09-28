<script setup lang="ts">
import { File } from "@lucide/vue";
import { type ListboxItemSelectEvent } from "reka-ui";
import { ref } from "vue";

import { Listbox, ListboxContent, ListboxDescription, ListboxIcon, ListboxItem, ListboxTitle } from "@/ui/listbox";

const files = [
  { name: "roadmap.md", edited: "Edited 2 minutes ago" },
  { name: "invoice-0142.pdf", edited: "Edited yesterday" },
  { name: "brand-colors.json", edited: "Edited last week" },
];
const opened = ref<string>();

const open = (event: ListboxItemSelectEvent<unknown>) => {
  event.preventDefault();
  opened.value = String(event.detail.value);
};
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-2">
    <Listbox aria-label="Recent files">
      <ListboxItem v-for="file in files" :key="file.name" :value="file.name" @select="open">
        <ListboxIcon>
          <File />
        </ListboxIcon>
        <ListboxContent>
          <ListboxTitle>{{ file.name }}</ListboxTitle>
          <ListboxDescription>{{ file.edited }}</ListboxDescription>
        </ListboxContent>
      </ListboxItem>
    </Listbox>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      {{ opened ? `Opened ${opened}` : "Nothing opened yet" }}
    </p>
  </div>
</template>
