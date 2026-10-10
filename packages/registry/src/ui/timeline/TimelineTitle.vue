<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { timelineTitle } from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "div" });
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="timeline-title"
    :class="cn(timelineTitle, props.class)"
  >
    <slot />
  </Primitive>
</template>
