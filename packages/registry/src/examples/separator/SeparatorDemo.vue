<script setup lang="ts">
import { Separator } from "@/ui/separator";
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="flex flex-col gap-1">
      <h4 class="text-title-sm">kappa-ui</h4>
      <p class="text-body-md text-muted-foreground">Vue components you copy into your project.</p>
    </div>
    <Separator class="my-4" />
    <div class="flex h-5 items-center gap-4 text-body-md">
      <div>Blog</div>
      <Separator orientation="vertical" />
      <div>Docs</div>
      <Separator orientation="vertical" />
      <div>Source</div>
    </div>
  </div>
</template>
