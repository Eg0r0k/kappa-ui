<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";

const easings = [
  { name: "standard", class: "ease-standard" },
  { name: "standard-decelerate", class: "ease-standard-decelerate" },
  { name: "standard-accelerate", class: "ease-standard-accelerate" },
  { name: "emphasized-decelerate", class: "ease-emphasized-decelerate" },
  { name: "emphasized-accelerate", class: "ease-emphasized-accelerate" },
] as const;

const moved = ref(false);
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-4">
    <div v-for="easing in easings" :key="easing.name" class="grid gap-1.5">
      <span class="font-mono text-label-sm text-muted-foreground">ease-{{ easing.name }}</span>
      <div class="@container rounded-full bg-muted p-1">
        <div
          :class="[
            'size-3 rounded-full bg-primary transition-transform duration-long-2 motion-reduce:transition-none',
            easing.class,
            moved && 'translate-x-[calc(100cqw-100%)] rtl:-translate-x-[calc(100cqw-100%)]',
          ]"
        />
      </div>
    </div>
    <Button class="self-start" size="sm" @click="moved = !moved">
      {{ moved ? "Back" : "Play" }}
    </Button>
  </div>
</template>
