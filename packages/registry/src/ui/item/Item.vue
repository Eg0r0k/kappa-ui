<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "@kappa-ui/core/primitive";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type ItemVariants, injectItemGroupContext, itemVariants } from ".";

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      variant?: NonNullable<ItemVariants["variant"]>;
      size?: NonNullable<ItemVariants["size"]>;
      class?: HTMLAttributes["class"];
    }
  >(),
  { as: "div", variant: "ghost", size: "md" },
);

const group = injectItemGroupContext(null);

const role = computed(() =>
  group?.list.value && !props.asChild && props.as !== "a" && props.as !== "button" ? "listitem" : undefined,
);
</script>

<template>
  <Primitive
    data-slot="item"
    :data-variant="props.variant"
    :data-size="props.size"
    :role="role"
    :as="as"
    :as-child="asChild"
    :class="cn(itemVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
