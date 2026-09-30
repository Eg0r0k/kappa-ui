<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type ChoiceGroupVariants, choiceGroupVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: ChoiceGroupVariants["variant"];
  orientation?: ChoiceGroupVariants["orientation"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), { as: "div" });
</script>

<template>
  <Primitive
    data-slot="choice-group"
    :as="props.as"
    :as-child="props.asChild"
    :data-variant="props.variant ?? 'default'"
    :data-orientation="props.orientation ?? 'vertical'"
    :class="cn(choiceGroupVariants({ variant: props.variant, orientation: props.orientation }), props.class)"
  >
    <slot />
  </Primitive>
</template>
