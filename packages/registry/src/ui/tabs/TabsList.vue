<script setup lang="ts">
import { TabsIndicator, TabsList, type TabsListProps } from "@delta-ui/core/tabs";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type TabsListVariants, tabsIndicatorVariants, tabsListVariants } from ".";

const props = withDefaults(
  defineProps<
    TabsListProps & {
      variant?: NonNullable<TabsListVariants["variant"]>;
      size?: NonNullable<TabsListVariants["size"]>;
      class?: HTMLAttributes["class"];
    }
  >(),
  { loop: true, variant: "pill", size: "md" },
);

const delegated = computed(() => {
  const { class: _, variant: __, size: ___, ...rest } = props;
  return rest;
});
</script>

<template>
  <TabsList
    v-bind="delegated"
    data-slot="tabs-list"
    :data-variant="props.variant"
    :data-size="props.size"
    :class="cn(tabsListVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
    <TabsIndicator
      data-slot="tabs-indicator"
      :class="tabsIndicatorVariants({ variant: props.variant, size: props.size })"
    />
  </TabsList>
</template>
