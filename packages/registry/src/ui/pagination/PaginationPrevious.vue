<script setup lang="ts">
import { PaginationPrev, type PaginationPrevProps } from "@delta-ui/core/pagination";
import { ChevronLeft } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/button";
import {
  type PaginationColor,
  type PaginationSize,
  type PaginationVariant,
  injectPaginationLook,
  paginationButtonSize,
} from ".";

const props = defineProps<
  PaginationPrevProps & {
    variant?: PaginationVariant;
    color?: PaginationColor;
    size?: PaginationSize;
    class?: HTMLAttributes["class"];
  }
>();

const look = injectPaginationLook();

const variant = computed(() => props.variant ?? look.value.variant);
const color = computed(() => props.color ?? look.value.color);
const size = computed(() => props.size ?? look.value.size);

const delegated = computed(() => {
  const { class: _, variant: __, color: ___, size: ____, ...rest } = props;
  return rest;
});
</script>

<template>
  <PaginationPrev
    v-bind="delegated"
    data-slot="pagination-previous"
    :data-variant="variant"
    :data-color="color"
    :data-size="size"
    :class="cn(buttonVariants({ variant, color, size: paginationButtonSize[size] }), props.class)"
  >
    <slot>
      <ChevronLeft data-icon="inline-start" class="rtl:rotate-180" />
      Previous
    </slot>
  </PaginationPrev>
</template>
