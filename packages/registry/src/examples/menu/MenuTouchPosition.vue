<script setup lang="ts">
import { ref } from "vue";

import { Menu, MenuItem } from "@/ui/menu";

const colors = ["Red", "Amber", "Green", "Blue", "Violet"];
const color = ref("Blue");
</script>

<template>
  <div
    class="flex h-40 w-full max-w-xs cursor-pointer items-center justify-center rounded-xl border text-body-md text-muted-foreground select-none"
  >
    Click anywhere · {{ color }}
    <Menu touch-position class="w-36">
      <MenuItem v-for="item in colors" :key="item" @select="color = item">{{ item }}</MenuItem>
    </Menu>
  </div>
</template>
