<script setup lang="ts">
import { Toggle, type ToggleEmits, type ToggleProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type ButtonColor, type ButtonVariants, buttonVariants } from "@/ui/button";
import { type ToggleVariants, toggleVariants } from ".";

const props = withDefaults(
  defineProps<
    ToggleProps & {
      variant?: ButtonVariants["variant"];
      activeVariant?: ToggleVariants["activeVariant"];
      color?: ButtonColor | (string & {});
      activeColor?: ButtonColor | (string & {});
      size?: ButtonVariants["size"];
      class?: HTMLAttributes["class"];
    }
  >(),
  { variant: "ghost", activeVariant: "soft", color: "neutral", size: "md", disabled: false },
);
const emits = defineEmits<ToggleEmits>();

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
  <Toggle
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="toggle"
    :data-variant="props.variant"
    :data-color="props.color"
    :data-active-color="props.activeColor"
    :data-size="props.size"
    :class="
      cn(
        buttonVariants({ variant: props.variant, size: props.size }),
        toggleVariants({ activeVariant: props.activeVariant }),
        props.class,
      )
    "
  >
    <slot v-bind="slotProps" />
  </Toggle>
</template>
