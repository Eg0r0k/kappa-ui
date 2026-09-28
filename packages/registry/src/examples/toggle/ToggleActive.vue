<script setup lang="ts">
import { Star } from "@lucide/vue";

import { Toggle } from "@/ui/toggle";
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Toggle variant="outline" active-variant="solid" active-color="primary">
      <Star data-icon="inline-start" />
      Star
    </Toggle>
    <Toggle variant="outline" active-variant="soft" active-color="warning" :default-value="true">
      <Star data-icon="inline-start" />
      Favourite
    </Toggle>
  </div>
</template>
