<script setup lang="ts" generic="T extends object = TreeNode">
import { type FlattenedItem, TreeVirtualizer as TreeVirtualizerPrimitive } from "reka-ui";
import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { type TreeNode, type TreeRowVirtualizer, fields, injectTreeContext, warnOnce } from ".";

const props = withDefaults(
  defineProps<{
    /** Rows rendered past each edge of the view. */
    overscan?: number;
    /** Row height in pixels. Measured from `--tree-item-height` by default. */
    estimateSize?: number;
    /** The text typeahead matches for a node. Its `label` by default. */
    textContent?: (item: T) => string;
  }>(),
  { overscan: 12, estimateSize: undefined, textContent: undefined },
);
const slots = defineSlots<{ default?: (props: { item: FlattenedItem<T> }) => unknown }>();

const tree = injectTreeContext();

const probe = ref<HTMLElement>();
const rowSize = ref(0);
// Registered at once, so the tree is a scroll container before the first row is placed
let instance: TreeRowVirtualizer | undefined;
const unregister = tree.registerVirtualizer({
  scrollToIndex: (index, options) => instance?.scrollToIndex(index, options),
});
const remember = (next: TreeRowVirtualizer, item: FlattenedItem<T>) => {
  instance = next;
  return item;
};

const checkScroller = () => {
  const el = tree.rootEl();
  if (!el || el.querySelectorAll("[role=treeitem]").length < 50) return;
  if (el.clientHeight > 0 && el.scrollHeight <= el.clientHeight + 1) {
    warnOnce(
      "virtualize-height",
      'TreeVirtualizer needs a height on the tree, such as class="h-80"; rendering every row.',
    );
  }
};

// Reka's TreeVirtualizer has no measureElement: rows get a fixed height, read here from --tree-item-height.
const measure = () => {
  rowSize.value = props.estimateSize ?? (probe.value?.offsetHeight || 36);
  nextTick(() => requestAnimationFrame(checkScroller));
};
onMounted(measure);
watch(
  () => [props.estimateSize, tree.size.value],
  () => nextTick(measure),
);

// A tree that mounts hidden measures 0; measure again once the probe has a size, or when tokens change.
let probeObserver: ResizeObserver | undefined;
watch(probe, (el, old) => {
  if (typeof ResizeObserver === "undefined") return;
  probeObserver ??= new ResizeObserver(() => {
    const height = probe.value?.offsetHeight;
    if (height && height !== rowSize.value && props.estimateSize === undefined) measure();
  });
  if (old) probeObserver.unobserve(old);
  if (el) probeObserver.observe(el);
});

onBeforeUnmount(() => {
  probeObserver?.disconnect();
  unregister();
});

const textOf = (node: object) => (props.textContent ? props.textContent(node as T) : (fields(node).label ?? ""));

// Reka places a row by cloning the first vnode its slot returns, so the row goes to it as is, not inside a slot fragment
const Rows = defineComponent(
  () => () =>
    h(
      TreeVirtualizerPrimitive,
      { estimateSize: rowSize.value, overscan: props.overscan, textContent: textOf },
      {
        default: (scope: { item: FlattenedItem<T>; virtualizer: TreeRowVirtualizer }) =>
          slots.default?.({ item: remember(scope.virtualizer, scope.item) }),
      },
    ),
);
</script>

<template>
  <div
    ref="probe"
    aria-hidden="true"
    data-slot="tree-probe"
    class="pointer-events-none invisible absolute h-(--tree-item-height)"
  />
  <Rows v-if="rowSize > 0" :key="rowSize" />
</template>
