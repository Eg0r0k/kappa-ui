<script setup lang="ts">
import { Switch } from "@/ui/switch";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-6">
    <Switch v-for="color in colors" :key="color" :color="color" :default-value="true" :aria-label="color" />
  </div>
</template>
