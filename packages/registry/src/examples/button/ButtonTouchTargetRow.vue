<script setup lang="ts">
import { Bold, Italic, Underline } from "@lucide/vue";

import { Button } from "@/ui/button";

const targets = ["none", "expand", "wrapper"] as const;
const actions = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Underline", icon: Underline },
];
</script>

<template>
  <div
    class="grid grid-cols-[auto_auto] items-center justify-center gap-x-6 gap-y-6 [&_button::after]:bg-pink-500/15 [&_button::after]:outline [&_button::after]:outline-dashed [&_button::after]:outline-pink-500/70"
  >
    <template v-for="target in targets" :key="target">
      <span class="font-mono text-label-md text-muted-foreground">{{ target }}</span>
      <div class="flex items-center gap-1">
        <Button
          v-for="action in actions"
          :key="action.label"
          size="icon-sm"
          variant="outline"
          color="neutral"
          :touch-target="target"
          :aria-label="action.label"
        >
          <component :is="action.icon" />
        </Button>
      </div>
    </template>
  </div>
</template>
