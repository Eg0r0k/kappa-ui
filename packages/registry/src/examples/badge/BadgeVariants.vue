<script setup lang="ts">
import { Badge } from "@/ui/badge";

const variants = ["solid", "soft", "subtle", "outline", "ghost", "link"] as const;
const colors = ["primary", "neutral", "destructive", "success", "warning", "info"] as const;
</script>

<template>
  <div class="grid grid-cols-[auto_repeat(6,auto)] items-center justify-items-center gap-3 overflow-x-auto">
    <span />
    <span v-for="variant in variants" :key="variant" class="text-label-sm text-muted-foreground">{{ variant }}</span>
    <template v-for="color in colors" :key="color">
      <span class="justify-self-start pr-2 text-label-sm text-muted-foreground">{{ color }}</span>
      <Badge v-for="variant in variants" :key="variant" :variant="variant" :color="color">Badge</Badge>
    </template>
  </div>
</template>
