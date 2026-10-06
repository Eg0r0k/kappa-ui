<script setup lang="ts">
import { TabsIndicator, TabsList, type TabsListProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type TabsColor, type TabsListVariants, tabsIndicatorVariants, tabsListVariants } from ".";

const props = withDefaults(
  defineProps<
    TabsListProps & {
      variant?: NonNullable<TabsListVariants["variant"]>;
      /** The tone of the `line` indicator. The `pill` indicator is a surface and ignores it. */
      color?: TabsColor | (string & {});
      size?: NonNullable<TabsListVariants["size"]>;
      class?: HTMLAttributes["class"];
    }
  >(),
  { loop: true, variant: "pill", color: "primary", size: "md" },
);

const delegated = computed(() => {
  const { class: _, variant: __, size: ___, color: ____, ...rest } = props;
  return rest;
});
</script>

<template>
  <TabsList
    v-bind="delegated"
    data-slot="tabs-list"
    :data-variant="props.variant"
    :data-color="props.color"
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
