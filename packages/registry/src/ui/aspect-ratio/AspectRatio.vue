<script setup lang="ts">
import { AspectRatio, type AspectRatioProps } from "@delta-ui/core/aspect-ratio";

const props = defineProps<AspectRatioProps>();
</script>

<template>
  <AspectRatio v-slot="slotProps" data-slot="aspect-ratio" v-bind="props">
    <slot v-bind="slotProps" />
  </AspectRatio>
</template>
