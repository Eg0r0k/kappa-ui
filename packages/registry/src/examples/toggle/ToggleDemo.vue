<script setup lang="ts">
import { Bold } from "@lucide/vue";

import { Toggle } from "@/ui/toggle";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Toggle size="icon-md" aria-label="Bold" v-bind="$attrs">
    <Bold />
  </Toggle>
</template>
