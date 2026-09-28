<script setup lang="ts">
import { Alert, AlertTitle } from "@/ui/alert";

const variants = ["solid", "soft", "subtle", "outline", "ghost", "link"] as const;
const colors = ["primary", "neutral", "destructive", "success", "warning", "info"] as const;
</script>

<template>
  <div class="grid w-full grid-cols-[auto_repeat(6,minmax(0,1fr))] items-center gap-2 overflow-x-auto">
    <span />
    <span v-for="variant in variants" :key="variant" class="text-center text-label-sm text-muted-foreground">
      {{ variant }}
    </span>
    <template v-for="color in colors" :key="color">
      <span class="pr-2 text-label-sm text-muted-foreground">{{ color }}</span>
      <Alert v-for="variant in variants" :key="variant" :variant="variant" :color="color" size="xs">
        <AlertTitle>Alert</AlertTitle>
      </Alert>
    </template>
  </div>
</template>
