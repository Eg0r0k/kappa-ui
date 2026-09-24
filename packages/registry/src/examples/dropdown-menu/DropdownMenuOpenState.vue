<script setup lang="ts">
import { Copy, Ellipsis, Pencil, Trash2 } from "@lucide/vue";

import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";

const files = ["Quarterly report.pdf", "Roadmap.fig", "Invoices.xlsx"];
</script>

<template>
  <ul class="flex w-full max-w-sm flex-col rounded-xl border p-1">
    <li
      v-for="file in files"
      :key="file"
      class="flex items-center justify-between gap-2 rounded-lg py-1 ps-3 pe-1 text-body-md transition-colors has-data-[state=open]:bg-muted"
    >
      {{ file }}
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            color="neutral"
            size="icon-sm"
            :aria-label="`Actions for ${file}`"
            class="data-[state=open]:bg-foreground/(--state-pressed)"
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" size="sm">
          <DropdownMenuItem>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  </ul>
</template>
