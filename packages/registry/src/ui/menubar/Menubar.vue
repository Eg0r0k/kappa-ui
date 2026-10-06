<script setup lang="ts">
import { type Direction, MenubarRoot, useForwardProps } from "reka-ui";
import { type HTMLAttributes, computed, toRef } from "vue";

import { cn } from "@/lib/utils";
import { type MenubarSize, type MenubarVariants, menubarVariants, provideMenubarSize } from ".";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultValue?: string;
    dir?: Direction;
    loop?: boolean;
    size?: MenubarSize;
    variant?: NonNullable<MenubarVariants["variant"]>;
    class?: HTMLAttributes["class"];
  }>(),
  { loop: true },
);
const emits = defineEmits<{ "update:modelValue": [value: string] }>();

const delegated = computed(() => {
  const { class: _, size: __, variant: ___, modelValue: ____, ...rest } = props;
  return rest;
});
const forwarded = useForwardProps(delegated);
// Reka's MenubarRootEmits types this as boolean; the value is the open menu's value, "" when none is open
const onUpdate = (value: unknown) => emits("update:modelValue", value as string);

const size = toRef(() => props.size ?? "md");
const variant = toRef(() => props.variant ?? "outline");
provideMenubarSize(size);
</script>

<template>
  <MenubarRoot
    v-slot="slotProps"
    v-bind="forwarded"
    :model-value="props.modelValue"
    data-slot="menubar"
    :data-size="size"
    :data-variant="variant"
    :class="cn(menubarVariants({ variant, size }), props.class)"
    @update:model-value="onUpdate"
  >
    <slot v-bind="slotProps" />
  </MenubarRoot>
</template>
