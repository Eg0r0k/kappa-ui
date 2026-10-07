<script setup lang="ts">
import { Primitive, ToggleGroupItem, type ToggleGroupItemProps, useForwardProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/button";
import { toggleVariants } from "@/ui/toggle";
import { type ToggleGroupStyle, injectToggleGroupStyle } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<ToggleGroupItemProps & ToggleGroupStyle & { class?: HTMLAttributes["class"] }>(),
  { as: "button" },
);

const group = injectToggleGroupStyle();
const style = computed(() => ({
  variant: props.variant ?? group.value.variant,
  activeVariant: props.activeVariant ?? group.value.activeVariant,
  color: props.color ?? group.value.color,
  activeColor: props.activeColor ?? group.value.activeColor,
  size: props.size ?? group.value.size ?? "md",
}));

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
const forwarded = useForwardProps(delegated);
</script>

<template>
  <ToggleGroupItem v-slot="slotProps" v-bind="forwarded" as-child>
    <Primitive
      v-ripple
      :as="props.as"
      :as-child="props.asChild"
      data-slot="toggle-group-item"
      :data-variant="style.variant"
      :data-color="style.color"
      :data-active-color="style.activeColor"
      :data-size="style.size"
      :class="
        cn(
          buttonVariants({ variant: style.variant, size: style.size }),
          toggleVariants({ activeVariant: style.activeVariant }),
          props.class,
        )
      "
      v-bind="$attrs"
    >
      <slot v-bind="slotProps" />
    </Primitive>
  </ToggleGroupItem>
</template>
