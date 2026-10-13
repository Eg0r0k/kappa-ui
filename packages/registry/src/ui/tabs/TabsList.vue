<script setup lang="ts">
import { TabsIndicator, TabsList, type TabsListProps } from "reka-ui";
import { type HTMLAttributes, computed, onBeforeUnmount, onMounted, useTemplateRef } from "vue";

import { cn } from "@/lib/utils";
import { type TabsColor, type TabsListVariants, type TabsSize, tabsIndicatorVariants, tabsListVariants } from ".";

const props = withDefaults(
  defineProps<
    TabsListProps & {
      variant?: NonNullable<TabsListVariants["variant"]>;
      /** The tone of the `line` indicator. The `pill` indicator is a surface and ignores it. */
      color?: TabsColor | (string & {});
      size?: TabsSize;
      class?: HTMLAttributes["class"];
    }
  >(),
  { loop: true, variant: "pill", color: "primary", size: "md" },
);

const delegated = computed(() => {
  const { class: _, variant: __, size: ___, color: ____, ...rest } = props;
  return rest;
});

const list = useTemplateRef<InstanceType<typeof TabsList>>("list");
const indicator = useTemplateRef<InstanceType<typeof TabsIndicator>>("indicator");
let observer: MutationObserver | undefined;

onMounted(() => {
  observer = new MutationObserver(() => indicator.value?.updateIndicatorStyle());
  observer.observe(list.value!.$el, { childList: true, subtree: true });
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <TabsList
    ref="list"
    v-bind="delegated"
    data-slot="tabs-list"
    :data-variant="props.variant"
    :data-color="props.color"
    :data-size="props.size"
    :class="cn(tabsListVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
    <TabsIndicator
      ref="indicator"
      data-slot="tabs-indicator"
      :class="tabsIndicatorVariants({ variant: props.variant })"
    />
  </TabsList>
</template>
