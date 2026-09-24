<script setup lang="ts">
import { Archive, Pencil, Share2, Trash2 } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Menu, MenuItem, MenuSeparator, MenuShortcut } from "@/ui/menu";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <Button v-for="size in sizes" :key="size" variant="outline" color="neutral">
      {{ size }}
      <Menu :size="size" auto-close>
        <MenuItem>
          <Pencil />
          Rename
          <MenuShortcut>F2</MenuShortcut>
        </MenuItem>
        <MenuItem>
          <Share2 />
          Share
        </MenuItem>
        <MenuItem>
          <Archive />
          Archive
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive">
          <Trash2 />
          Delete
        </MenuItem>
      </Menu>
    </Button>
  </div>
</template>
