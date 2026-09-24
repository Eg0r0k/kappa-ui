<script setup lang="ts">
import { Separator } from "@/ui/separator";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-6">
    <Separator v-for="size in sizes" :key="size" :size="size" :label="size" />
  </div>
</template>
