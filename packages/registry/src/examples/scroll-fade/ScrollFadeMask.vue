<script setup lang="ts">
import { vScrollFade } from "@kappa-ui/core/scroll-fade";
</script>

<template>
  <div v-scroll-fade class="scroll-fade h-56 w-full max-w-xs overflow-y-auto rounded-lg border">
    <p v-for="index in 30" :key="index" class="border-b px-4 py-2 text-body-md last:border-b-0">Message {{ index }}</p>
  </div>
</template>
