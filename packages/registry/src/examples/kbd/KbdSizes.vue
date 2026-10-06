<script setup lang="ts">
import { Kbd, KbdGroup } from "@/ui/kbd";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <KbdGroup v-for="size in sizes" :key="size">
      <Kbd :size="size">⌘</Kbd>
      <Kbd :size="size">K</Kbd>
    </KbdGroup>
  </div>
</template>
