<script setup lang="ts">
import { Info } from "@lucide/vue";

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="grid w-full max-w-xl gap-4">
    <Alert v-for="size in sizes" :key="size" :size="size" variant="outline" color="neutral">
      <Info />
      <AlertTitle>Size {{ size }}</AlertTitle>
      <AlertDescription>Padding, gaps, type and the icon grow together.</AlertDescription>
    </Alert>
  </div>
</template>
