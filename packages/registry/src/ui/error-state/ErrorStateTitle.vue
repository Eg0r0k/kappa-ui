<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { EmptyTitle } from "@/ui/empty";

interface Props extends PrimitiveProps {
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), { as: "h3" });
</script>

<template>
  <EmptyTitle data-slot="error-state-title" :as="props.as" :as-child="props.asChild" :class="props.class">
    <slot />
  </EmptyTitle>
</template>
