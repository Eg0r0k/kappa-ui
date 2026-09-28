<script setup lang="ts">
import { Bookmark } from "@lucide/vue";

import { Toggle } from "@/ui/toggle";

const variants = ["solid", "soft", "subtle", "outline", "ghost", "link"] as const;
</script>

<template>
  <div class="grid grid-cols-[auto_auto_auto] items-center justify-start gap-x-4 gap-y-2">
    <template v-for="variant in variants" :key="variant">
      <span class="text-body-sm text-muted-foreground">{{ variant }}</span>
      <Toggle variant="outline" :active-variant="variant" active-color="primary">
        <Bookmark data-icon="inline-start" />
        Off
      </Toggle>
      <Toggle variant="outline" :active-variant="variant" active-color="primary" :default-value="true">
        <Bookmark data-icon="inline-start" />
        On
      </Toggle>
    </template>
  </div>
</template>
