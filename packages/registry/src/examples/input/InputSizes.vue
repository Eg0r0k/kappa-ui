<script setup lang="ts">
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { InputFloating } from "@/ui/input-floating";

const sizes = [
  { input: "xs" },
  { input: "sm", button: "sm" },
  { input: "md", button: "default" },
  { input: "lg", button: "lg" },
  { input: "xl", button: "xl" },
] as const;
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-3">
    <div v-for="size in sizes" :key="size.input" class="flex gap-2">
      <Input :size="size.input" placeholder="Search" :aria-label="`Search, ${size.input}`" />
      <InputFloating :size="size.input" label="City" />
      <Button v-if="'button' in size" :size="size.button" variant="outline" color="neutral">Go</Button>
    </div>
  </div>
</template>
