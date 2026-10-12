<script setup lang="ts">
import { Kbd, KbdGroup } from "@/ui/kbd";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <KbdGroup>
      <Kbd v-for="key in ['⌘', '⇧', '⌥', '⌃']" :key="key" v-bind="$attrs">{{ key }}</Kbd>
    </KbdGroup>
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <span>+</span>
      <Kbd>B</Kbd>
    </KbdGroup>
    <p class="text-body-md text-muted-foreground">Press <Kbd>/</Kbd> to search, or <Kbd>Esc</Kbd> to close.</p>
  </div>
</template>
