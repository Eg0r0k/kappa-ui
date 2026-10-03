<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "div" });
</script>

<template>
  <Primitive
    data-slot="avatar-group"
    :as="props.as"
    :as-child="props.asChild"
    :class="
      cn(
        `
          flex items-center -space-x-[calc(var(--avatar-size)/4)] [--avatar-ring:--theme(--color-background)]
          *:ring-2 *:ring-(--avatar-ring)
        `,
        props.class,
      )
    "
  >
    <slot />
  </Primitive>
</template>
