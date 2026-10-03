<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "a" });
</script>

<template>
  <Primitive
    data-slot="breadcrumb-link"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        `
          rounded-xs transition-colors duration-short-3 ease-standard outline-none
          hover:text-foreground
          focus-visible:focus-ring
        `,
        props.class,
      )
    "
  >
    <slot />
  </Primitive>
</template>
