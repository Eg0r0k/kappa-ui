<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { timelineDate } from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "time" });
</script>

<template>
  <Primitive :as="props.as" :as-child="props.asChild" data-slot="timeline-date" :class="cn(timelineDate, props.class)">
    <slot />
  </Primitive>
</template>
