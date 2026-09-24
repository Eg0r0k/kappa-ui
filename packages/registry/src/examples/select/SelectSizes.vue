<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <Select v-for="size in sizes" :key="size" default-value="en">
      <SelectTrigger :size="size" :aria-label="`Language, ${size}`">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="de">Deutsch</SelectItem>
        <SelectItem value="fi">Suomi</SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
