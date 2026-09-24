<script setup lang="ts">
import { Plus } from "@lucide/vue";

import { Button } from "@/ui/button";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button>Label only</Button>
    <Button>
      <Plus data-icon="inline-start" />
      Leading icon
    </Button>
    <Button>
      Trailing icon
      <Plus data-icon="inline-end" />
    </Button>
  </div>
</template>
