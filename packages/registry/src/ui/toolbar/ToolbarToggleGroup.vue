<script setup lang="ts">
import {
  type ToggleGroupRootEmits,
  ToolbarToggleGroup,
  type ToolbarToggleGroupProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type ToggleGroupStyle, provideToggleGroupStyle } from "@/ui/toggle-group";

const props = withDefaults(
  defineProps<ToolbarToggleGroupProps & ToggleGroupStyle & { class?: HTMLAttributes["class"] }>(),
  { variant: "ghost", activeVariant: "soft", color: "neutral", size: "sm" },
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
  <ToolbarToggleGroup
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="toolbar-toggle-group"
    :class="
      cn(
        'flex items-center gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        props.class,
      )
    "
  >
    <slot v-bind="slotProps" />
  </ToolbarToggleGroup>
</template>
