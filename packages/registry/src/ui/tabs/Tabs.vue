<script setup lang="ts">
import { TabsRoot, type TabsRootEmits, type TabsRootProps } from "@kappa-ui/core/tabs";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<TabsRootProps & { class?: HTMLAttributes["class"] }>(), {
  orientation: "horizontal",
  activationMode: "automatic",
  unmountOnHide: true,
});
const emits = defineEmits<TabsRootEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <TabsRoot
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="tabs"
    :class="cn('flex gap-2 data-[orientation=horizontal]:flex-col', props.class)"
  >
    <slot v-bind="slotProps" />
  </TabsRoot>
</template>
