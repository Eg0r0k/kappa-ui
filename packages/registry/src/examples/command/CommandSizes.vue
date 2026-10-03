<script setup lang="ts">
import { File, Folder } from "@lucide/vue";

import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/ui/command";
import type { MenuSize } from "@/ui/menu";

const sizes: MenuSize[] = ["xs", "md", "xl"];
</script>

<template>
  <div class="flex flex-wrap items-start gap-4">
    <Command v-for="size in sizes" :key="size" :size="size" class="w-56 border border-border">
      <CommandInput :placeholder="`Search (${size})`" />
      <CommandList>
        <CommandGroup>
          <CommandItem value="documents"><Folder /> Documents</CommandItem>
          <CommandItem value="readme"><File /> README.md</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </div>
</template>
