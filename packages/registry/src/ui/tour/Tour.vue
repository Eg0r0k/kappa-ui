<script setup lang="ts" generic="T extends TourStep">
import type { TourStep, UseTourReturn } from "@kappa-ui/core/tour";
import { PopoverAnchor, PopoverRoot, useId } from "reka-ui";
import { watch } from "vue";

import { provideTourContext } from ".";

const props = defineProps<{ tour: UseTourReturn<T> }>();

defineSlots<{
  default?: (props: { step: T; index: number; total: number; hasNext: boolean; hasPrev: boolean }) => unknown;
}>();

let opener: HTMLElement | null = null;

watch(
  () => props.tour.open.value,
  (open) => {
    if (open) opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  },
  { immediate: true },
);

const restoreFocus = () => {
  if (opener?.isConnected) opener.focus();
  opener = null;
};

provideTourContext({
  tour: props.tour,
  titleId: useId(undefined, "kappa-tour-title"),
  descriptionId: useId(undefined, "kappa-tour-description"),
  restoreFocus,
});

const onOpenChange = (open: boolean) => {
  if (!open) props.tour.finish();
};
</script>

<template>
  <PopoverRoot :open="tour.open.value" @update:open="onOpenChange">
    <PopoverAnchor :reference="tour.reference.value" data-slot="tour-anchor" hidden />
    <slot
      v-if="tour.current.value"
      v-bind="{
        step: tour.current.value,
        index: tour.index.value,
        total: tour.total.value,
        hasNext: tour.hasNext.value,
        hasPrev: tour.hasPrev.value,
      }"
    />
  </PopoverRoot>
</template>
