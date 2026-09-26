<script setup lang="ts">
import { Plus } from "@lucide/vue";

import { Button } from "@/ui/button";
import { ButtonGroup } from "@/ui/button-group";

const sizes = [
  { text: "sm", icon: "icon-sm" },
  { text: "default", icon: "icon" },
  { text: "lg", icon: "icon-lg" },
  { text: "xl", icon: "icon-xl" },
] as const;
</script>

<template>
  <div class="grid justify-items-start gap-4">
    <ButtonGroup v-for="size in sizes" :key="size.text" :aria-label="`Size ${size.text}`">
      <Button variant="outline" color="neutral" :size="size.text">{{ size.text }}</Button>
      <Button variant="outline" color="neutral" :size="size.text">Button</Button>
      <Button variant="outline" color="neutral" :size="size.icon" aria-label="Add"><Plus /></Button>
    </ButtonGroup>
  </div>
</template>
