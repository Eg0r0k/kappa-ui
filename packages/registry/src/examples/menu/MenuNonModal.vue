<script setup lang="ts">
import { Copy, Ellipsis, Pencil, Trash2 } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Menu, MenuItem, MenuSeparator } from "@/ui/menu";

const files = [
  "Quarterly report.pdf",
  "Roadmap.fig",
  "Invoices.xlsx",
  "Brand guide.pdf",
  "Onboarding.docx",
  "Budget 2027.xlsx",
  "Release notes.md",
  "Interview notes.docx",
  "Pitch deck.key",
  "Research.pdf",
  "Contracts.zip",
  "Wireframes.fig",
];
</script>

<template>
  <ul class="flex h-56 w-full max-w-sm flex-col overflow-y-auto rounded-xl border p-1">
    <li
      v-for="file in files"
      :key="file"
      class="flex shrink-0 items-center justify-between gap-2 rounded-lg py-1 ps-3 pe-1 text-body-md transition-colors duration-short-3 ease-standard has-aria-expanded:bg-muted"
    >
      {{ file }}
      <Button variant="ghost" color="neutral" size="icon-sm" :aria-label="`Actions for ${file}`">
        <Ellipsis />
        <Menu :modal="false" anchor="bottom end" self="top end" size="sm">
          <MenuItem>
            <Pencil />
            Rename
          </MenuItem>
          <MenuItem>
            <Copy />
            Duplicate
          </MenuItem>
          <MenuSeparator />
          <MenuItem variant="destructive">
            <Trash2 />
            Delete
          </MenuItem>
        </Menu>
      </Button>
    </li>
  </ul>
</template>
