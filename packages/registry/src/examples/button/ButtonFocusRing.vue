<script setup lang="ts">
import { Button } from "@/ui/button";
</script>

<template>
  <div class="flex flex-wrap gap-6">
    <div class="overflow-hidden rounded-lg border">
      <Button class="rounded-none">Outward, clipped</Button>
    </div>
    <div class="overflow-hidden rounded-lg border">
      <Button focus-ring="inward" class="rounded-none">Inward, visible</Button>
    </div>
  </div>
</template>
