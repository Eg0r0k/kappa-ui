<script setup lang="ts">
import { ToggleGroupRoot, type ToggleGroupRootEmits, type ToggleGroupRootProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { buttonGroupVariants } from "@/ui/button-group";
import { type ToggleGroupStyle, provideToggleGroupStyle } from ".";

const props = withDefaults(
  defineProps<ToggleGroupRootProps & ToggleGroupStyle & { class?: HTMLAttributes["class"] }>(),
  { orientation: "horizontal", variant: "ghost", activeVariant: "soft", color: "neutral" },
);
const emits = defineEmits<ToggleGroupRootEmits>();

provideToggleGroupStyle(
  computed(() => ({
    variant: props.variant,
    activeVariant: props.activeVariant,
    color: props.color,
    activeColor: props.activeColor,
    size: props.size,
  })),
);

const delegated = computed(() => {
  const {
    class: _,
    variant: _variant,
    activeVariant: _activeVariant,
    color: _color,
    activeColor: _activeColor,
    size: _size,
    ...rest
  } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ToggleGroupRoot
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="toggle-group"
    :data-orientation="props.orientation"
    :class="cn(buttonGroupVariants({ orientation: props.orientation }), props.class)"
  >
    <slot v-bind="slotProps" />
  </ToggleGroupRoot>
</template>
