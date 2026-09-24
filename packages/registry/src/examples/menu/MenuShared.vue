<script setup lang="ts">
import { File } from "@lucide/vue";
import { ref } from "vue";

import { Menu, MenuItem, MenuLabel, MenuSeparator, MenuShortcut } from "@/ui/menu";

const actions = [
  { label: "Open", shortcut: "↵" },
  { label: "Rename", shortcut: "F2" },
  { label: "Duplicate", shortcut: "⌘D" },
];
const last = ref("nothing yet");
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-2">
    <button
      type="button"
      class="flex items-center gap-3 rounded-xl border p-3 text-start outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <File class="size-5" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-label-lg">quarterly-report.pdf</span>
        <span class="block text-body-sm text-muted-foreground">Click or right-click</span>
      </span>
      <Menu
        v-for="contextMenu in [false, true]"
        :key="String(contextMenu)"
        :context-menu="contextMenu"
        :fit="!contextMenu"
      >
        <MenuLabel>{{ contextMenu ? "Right-click menu" : "Click menu" }}</MenuLabel>
        <MenuSeparator />
        <MenuItem v-for="action in actions" :key="action.label" @select="last = `${action.label}, from the ${contextMenu ? 'right-click' : 'click'} menu`">
          {{ action.label }}
          <MenuShortcut>{{ action.shortcut }}</MenuShortcut>
        </MenuItem>
      </Menu>
    </button>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">Last action: {{ last }}</p>
  </div>
</template>
