<script setup lang="ts">
import { PaginationRoot, type PaginationRootEmits, type PaginationRootProps } from "@kappa-ui/core/pagination";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type PaginationColor, type PaginationSize, type PaginationVariant, providePaginationLook } from ".";

const props = withDefaults(
  defineProps<
    PaginationRootProps & {
      variant?: PaginationVariant;
      activeVariant?: PaginationVariant;
      color?: PaginationColor;
      activeColor?: PaginationColor;
      size?: PaginationSize;
      class?: HTMLAttributes["class"];
    }
  >(),
  { variant: "ghost", activeVariant: "solid", color: "neutral", activeColor: "primary", size: "md" },
);
const emits = defineEmits<PaginationRootEmits>();

const delegated = computed(() => {
  const { class: _, variant: __, activeVariant: ___, color: ____, activeColor: _____, size: ______, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

providePaginationLook(
  computed(() => ({
    variant: props.variant,
    activeVariant: props.activeVariant,
    color: props.color,
    activeColor: props.activeColor,
    size: props.size,
  })),
);
</script>

<template>
  <PaginationRoot
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="pagination"
    :data-size="props.size"
    aria-label="Pagination"
    :class="cn('mx-auto flex w-full justify-center', props.class)"
  >
    <slot v-bind="slotProps" />
  </PaginationRoot>
</template>
