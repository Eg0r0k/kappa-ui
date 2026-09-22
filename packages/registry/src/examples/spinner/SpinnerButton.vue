<script setup lang="ts">
import { Button } from "@/ui/button";
import { Spinner } from "@/ui/spinner";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button disabled>
      <Spinner />
      Saving
    </Button>
    <Button variant="outline" disabled>
      <Spinner />
      Downloading
    </Button>
    <Button size="icon" disabled aria-label="Saving">
      <Spinner />
    </Button>
  </div>
</template>
