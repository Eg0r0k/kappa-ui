<script setup lang="ts">
import { Image } from "@lucide/vue";
import { shallowRef } from "vue";

import { Tree } from "@/ui/tree";

type Photo = { id: string; label: string; icon?: typeof Image; children?: Photo[] };

const album = (name: string, count: number): Photo => ({
  id: name.toLowerCase(),
  label: name,
  children: Array.from({ length: count }, (_, i) => ({
    id: `${name.toLowerCase()}-${i + 1}`,
    label: `IMG_${String(4200 + i * 7)}.jpg`,
    icon: Image,
  })),
});

const albums = [album("Lisbon", 4), album("Porto", 3), album("Sintra", 2)];

const picked = shallowRef<Photo[]>([]);
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <Tree
      v-model="picked"
      :items="albums"
      :default-expanded="['lisbon', 'porto']"
      multiple
      selection-behavior="replace"
      variant="outline"
      aria-label="Photos"
    />
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      {{ picked.length }} selected. Click to pick one, Ctrl or ⌘-click to add, Shift-click or Shift + arrows for a
      range.
    </p>
  </div>
</template>
