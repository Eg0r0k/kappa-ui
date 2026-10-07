<script setup lang="ts">
import {
  MenubarRadioItem,
  type MenubarRadioItemEmits,
  type MenubarRadioItemProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuIndicatorItem, menuRadioDot } from "@/ui/menu";
import MenubarItemIndicator from "./MenubarItemIndicator.vue";

const props = defineProps<MenubarRadioItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<MenubarRadioItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarRadioItem
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="menubar-radio-item"
    :class="cn(menuIndicatorItem, props.class)"
  >
    <MenubarItemIndicator>
      <slot name="indicator-icon">
        <span :class="menuRadioDot" />
      </slot>
    </MenubarItemIndicator>
    <slot v-bind="slotProps" />
  </MenubarRadioItem>
</template>
