<script setup lang="ts">
import { Check } from "@lucide/vue";
import {
  MenubarCheckboxItem,
  type MenubarCheckboxItemEmits,
  type MenubarCheckboxItemProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { menuIndicatorItem } from "@/ui/menu";
import MenubarItemIndicator from "./MenubarItemIndicator.vue";

const props = defineProps<MenubarCheckboxItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<MenubarCheckboxItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarCheckboxItem
    v-ripple
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="menubar-checkbox-item"
    :class="cn(menuIndicatorItem, props.class)"
  >
    <MenubarItemIndicator>
      <slot name="indicator-icon">
        <Check stroke-width="2.5" />
      </slot>
    </MenubarItemIndicator>
    <slot v-bind="slotProps" />
  </MenubarCheckboxItem>
</template>
