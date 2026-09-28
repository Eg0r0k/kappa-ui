<script setup lang="ts">
import { PaginationListItem, type PaginationListItemProps, injectPaginationRootContext } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/button";
import {
  type PaginationColor,
  type PaginationSize,
  type PaginationVariant,
  injectPaginationLook,
  paginationButtonSize,
  paginationPageSize,
} from ".";

const props = defineProps<
  PaginationListItemProps & {
    variant?: PaginationVariant;
    activeVariant?: PaginationVariant;
    color?: PaginationColor;
    activeColor?: PaginationColor;
    size?: PaginationSize;
    class?: HTMLAttributes["class"];
  }
>();

const root = injectPaginationRootContext();
const look = injectPaginationLook();

const active = computed(() => root.page.value === props.value);
const variant = computed(() =>
  active.value ? (props.activeVariant ?? look.value.activeVariant) : (props.variant ?? look.value.variant),
);
const color = computed(() =>
  active.value ? (props.activeColor ?? look.value.activeColor) : (props.color ?? look.value.color),
);
const size = computed(() => props.size ?? look.value.size);

const delegated = computed(() => {
  const { class: _, variant: __, activeVariant: ___, color: ____, activeColor: _____, size: ______, ...rest } = props;
  return rest;
});
</script>

<template>
  <PaginationListItem
    v-bind="delegated"
    data-slot="pagination-link"
    :data-variant="variant"
    :data-color="color"
    :data-size="size"
    :class="cn(buttonVariants({ variant, size: paginationButtonSize[size] }), paginationPageSize[size], props.class)"
  >
    <slot>{{ props.value }}</slot>
  </PaginationListItem>
</template>
