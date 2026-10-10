<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { timelineDescription } from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "div" });
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="timeline-description"
    :class="cn(timelineDescription, props.class)"
  >
    <slot />
  </Primitive>
</template>
