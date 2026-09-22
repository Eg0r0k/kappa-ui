<script setup lang="ts">
import { Button } from "@/ui/button";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button>Label only</Button>
    <Button>
      <svg data-icon="inline-start" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5v14" />
      </svg>
      Leading icon
    </Button>
    <Button>
      Trailing icon
      <svg data-icon="inline-end" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5v14" />
      </svg>
    </Button>
  </div>
</template>
