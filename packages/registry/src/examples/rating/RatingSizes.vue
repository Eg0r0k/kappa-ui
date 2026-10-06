<script setup lang="ts">
import { Button } from "@/ui/button";
import { Rating } from "@/ui/rating";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-3">
      <Rating :size="size" :default-value="3" :aria-label="`Rating, ${size}`" />
      <Button :size="size" variant="outline" color="neutral">Post review</Button>
    </div>
  </div>
</template>
