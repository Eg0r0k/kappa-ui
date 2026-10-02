<script setup lang="ts">
import { ComboboxAnchor, type ComboboxAnchorProps, useForwardProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import type { TextControlSize, TextControlVariant } from "@/ui/input";
import { comboboxAnchorVariants, provideComboboxAnchorContext } from ".";

const props = withDefaults(
  defineProps<
    ComboboxAnchorProps & {
      variant?: TextControlVariant;
      size?: TextControlSize;
      class?: HTMLAttributes["class"];
    }
  >(),
  { variant: "outline", size: "md" },
);

const delegated = computed(() => {
  const { class: _, variant: __, size: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardProps(delegated);

provideComboboxAnchorContext(computed(() => ({ size: props.size })));
</script>

<template>
  <ComboboxAnchor
    v-bind="forwarded"
    data-slot="combobox-anchor"
    :class="cn(!props.asChild && comboboxAnchorVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </ComboboxAnchor>
</template>
