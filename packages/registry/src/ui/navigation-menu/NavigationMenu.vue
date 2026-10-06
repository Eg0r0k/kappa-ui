<script setup lang="ts">
import { NavigationMenuRoot, type NavigationMenuRootProps, useDirection } from "reka-ui";
import { type HTMLAttributes, computed, toRef } from "vue";

import { cn } from "@/lib/utils";
import {
  type NavigationMenuSize,
  type NavigationMenuVariant,
  decodeValue,
  encodeValue,
  navigationMenuVariants,
  provideNavigationMenuContext,
} from ".";
import NavigationMenuViewport from "./NavigationMenuViewport.vue";

const props = withDefaults(
  defineProps<
    NavigationMenuRootProps & {
      size?: NavigationMenuSize;
      variant?: NavigationMenuVariant;
      /** Renders the shared panel under the list. Without it, each panel opens under its own trigger. */
      viewport?: boolean;
      /** Where the panel lines up with its trigger: `start` and `end` follow the reading direction. */
      align?: "start" | "center" | "end";
      class?: HTMLAttributes["class"];
    }
  >(),
  {
    modelValue: undefined,
    as: "nav",
    orientation: "horizontal",
    delayDuration: 200,
    skipDelayDuration: 300,
    unmountOnHide: true,
    size: "md",
    variant: "ghost",
    viewport: true,
    align: "center",
  },
);
const emits = defineEmits<{ "update:modelValue": [value: string] }>();

const dir = useDirection(toRef(props, "dir"));

provideNavigationMenuContext({
  size: toRef(props, "size"),
  variant: toRef(props, "variant"),
  viewport: toRef(props, "viewport"),
  dir,
});

const forwarded = computed(() => {
  const { class: _, size: __, variant: ___, viewport: ____, align: _____, modelValue, defaultValue, ...rest } = props;
  return {
    ...rest,
    modelValue: modelValue === undefined ? undefined : encodeValue(modelValue),
    defaultValue: encodeValue(defaultValue),
  };
});
</script>

<template>
  <!-- Reka reads `orientation` once, so a change remounts the menu (and closes it). -->
  <NavigationMenuRoot
    :key="props.orientation"
    v-slot="{ modelValue }"
    v-bind="forwarded"
    data-slot="navigation-menu"
    :data-size="props.size"
    :data-variant="props.variant"
    :data-viewport="String(props.viewport)"
    :class="cn(navigationMenuVariants({ size: props.size, variant: props.variant }), props.class)"
    @update:model-value="emits('update:modelValue', decodeValue($event))"
  >
    <slot :model-value="decodeValue(modelValue)" />
    <NavigationMenuViewport v-if="props.viewport" :align="props.align" />
  </NavigationMenuRoot>
</template>
