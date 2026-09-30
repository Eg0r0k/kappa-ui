<script setup lang="ts">
import { SplitterPanel, type SplitterPanelEmits, type SplitterPanelProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed, onBeforeUnmount, onMounted, ref } from "vue";

import { cn } from "@/lib/utils";
import { injectSplitterResets } from ".";

const props = defineProps<SplitterPanelProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<SplitterPanelEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const panel = ref<InstanceType<typeof SplitterPanel>>();
const resets = injectSplitterResets();

let initialSize: number | undefined;
const onResize = (size: number, prevSize: number | undefined) => {
  if (prevSize === undefined) initialSize = size;
};
const reset = () => {
  if (initialSize !== undefined) panel.value?.resize(initialSize);
};

const element = () => (panel.value?.$el instanceof HTMLElement ? panel.value.$el : undefined);
onMounted(() => {
  const el = element();
  if (el) resets.set(el, reset);
});
onBeforeUnmount(() => {
  const el = element();
  if (el) resets.delete(el);
});

defineExpose({
  collapse: () => panel.value?.collapse(),
  expand: () => panel.value?.expand(),
  resize: (size: number) => panel.value?.resize(size),
  getSize: () => panel.value?.getSize() ?? 0,
  isCollapsed: computed(() => panel.value?.isCollapsed ?? false),
  isExpanded: computed(() => panel.value?.isExpanded ?? true),
});
</script>

<template>
  <SplitterPanel
    ref="panel"
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="splitter-panel"
    :class="cn(props.class)"
    @resize="onResize"
  >
    <slot v-bind="slotProps" />
  </SplitterPanel>
</template>
