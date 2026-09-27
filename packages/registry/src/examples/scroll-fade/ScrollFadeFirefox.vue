<script setup lang="ts">
import { vScrollFade } from "@kappa-ui/core/scroll-fade";
</script>

<template>
  <div class="grid w-full max-w-lg gap-4 sm:grid-cols-2">
    <figure class="grid gap-2">
      <figcaption class="text-label-md text-muted-foreground">Without v-scroll-fade</figcaption>
      <div class="scroll-fade h-48 overflow-y-auto rounded-lg border">
        <p v-for="index in 20" :key="index" class="border-b px-4 py-2 text-body-md last:border-b-0">
          Message {{ index }}
        </p>
      </div>
    </figure>
    <figure class="grid gap-2">
      <figcaption class="text-label-md text-muted-foreground">With v-scroll-fade</figcaption>
      <div v-scroll-fade class="scroll-fade h-48 overflow-y-auto rounded-lg border">
        <p v-for="index in 20" :key="index" class="border-b px-4 py-2 text-body-md last:border-b-0">
          Message {{ index }}
        </p>
      </div>
    </figure>
  </div>
</template>
