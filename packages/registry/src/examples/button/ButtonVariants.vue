<script setup lang="ts">
import { Button } from "@/ui/button";

const variants = ["solid", "soft", "subtle", "outline", "ghost", "link"] as const;
const colors = ["primary", "neutral", "destructive", "success", "warning"] as const;
</script>

<template>
  <div class="grid grid-cols-[auto_repeat(6,auto)] items-center gap-x-2 gap-y-3 overflow-x-auto">
    <span />
    <span v-for="variant in variants" :key="variant" class="text-center text-label-sm text-muted-foreground">
      {{ variant }}
    </span>
    <template v-for="color in colors" :key="color">
      <span class="pr-2 text-label-sm text-muted-foreground">{{ color }}</span>
      <Button v-for="variant in variants" :key="variant" :variant="variant" :color="color"> Button </Button>
    </template>
  </div>
</template>
