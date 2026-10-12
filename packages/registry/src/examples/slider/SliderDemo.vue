<script setup lang="ts">
import { Slider } from "@/ui/slider";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Slider v-bind="$attrs" :default-value="50" aria-label="Volume" class="max-w-xs" />
</template>
