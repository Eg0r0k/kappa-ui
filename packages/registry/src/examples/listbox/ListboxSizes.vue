<script setup lang="ts">
import { Archive, Inbox, Send } from "@lucide/vue";

import { Listbox, ListboxIcon, ListboxItem } from "@/ui/listbox";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-4">
    <Listbox
      v-for="size in sizes"
      :key="size"
      :size="size"
      default-value="inbox"
      :aria-label="`Folder, ${size}`"
      class="w-40"
    >
      <ListboxItem value="inbox">
        <ListboxIcon><Inbox /></ListboxIcon>
        Inbox
      </ListboxItem>
      <ListboxItem value="sent">
        <ListboxIcon><Send /></ListboxIcon>
        Sent
      </ListboxItem>
      <ListboxItem value="archive">
        <ListboxIcon><Archive /></ListboxIcon>
        Archive
      </ListboxItem>
    </Listbox>
  </div>
</template>
