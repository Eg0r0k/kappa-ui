<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Menu, MenuItem } from "@/ui/menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const count = ref(0);
</script>

<template>
  <div class="relative flex h-56 w-full max-w-md flex-col gap-3 rounded-xl border p-4">
    <div class="flex gap-3">
      <Select default-value="grid">
        <SelectTrigger class="w-36" aria-label="Layout">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="grid">Grid</SelectItem>
          <SelectItem value="list">List</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" color="neutral">
        Actions
        <Menu>
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </Menu>
      </Button>
    </div>
    <div class="pointer-events-none absolute inset-x-4 bottom-4 flex justify-end">
      <Button class="pointer-events-auto" @click="count += 1">Clicked {{ count }} times</Button>
    </div>
  </div>
</template>
