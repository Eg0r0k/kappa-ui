<script setup lang="ts" generic="T extends object = TreeNode">
import {
  type FlattenedItem,
  TreeItem as TreeItemPrimitive,
  type TreeItemSelectEvent,
  type TreeItemToggleEvent,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { type TreeItemSlotProps, type TreeNode, fields, injectTreeContext, provideTreeItemContext } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** A row from the tree's default slot. */
  item: FlattenedItem<T>;
  disabled?: boolean;
  as?: string;
  class?: HTMLAttributes["class"];
}>();

const emits = defineEmits<{
  select: [event: TreeItemSelectEvent<T>];
  toggle: [event: TreeItemToggleEvent<T>];
}>();

defineSlots<{ default?: (props: TreeItemSlotProps<T>) => unknown }>();

const tree = injectTreeContext();

const node = computed(() => props.item.value);
const key = computed(() => tree.keyOf(node.value));
const hasChildren = computed(() => tree.hasChildren(node.value));
const disabled = computed(() => props.disabled || tree.disabled.value || tree.isDisabled(node.value));
const expanded = computed(() => tree.isExpanded(key.value));
const checked = computed(() => tree.stateOf(key.value));
const selected = computed(() => checked.value === true);
const loading = computed(() => fields(node.value).loading === true);

provideTreeItemContext({ expanded, hasChildren, loading, disabled, selected, checked });

const slotProps = computed<TreeItemSlotProps<T>>(() => ({
  item: node.value,
  level: props.item.level,
  expanded: expanded.value,
  selected: selected.value,
  checked: checked.value,
  disabled: disabled.value,
  loading: loading.value,
  hasChildren: hasChildren.value,
  select: () => tree.select(node.value),
  toggle: () => tree.toggle(key.value),
}));

const position = computed(() => {
  const { value: _, level: __, ...rest } = props.item.bind;
  return rest;
});

// Reka UI renders aria-selected="false" on every row. In a single-select tree only the selected row
// carries it (APG); a checkbox tree uses aria-checked instead. The row's own attributes win over Reka's.
const ariaSelected = computed(() => {
  if (tree.checkbox.value) return undefined;
  if (tree.multiple.value) return String(selected.value);
  return selected.value ? "true" : undefined;
});
const ariaChecked = computed(() => {
  if (!tree.checkbox.value) return undefined;
  return checked.value === "indeterminate" ? "mixed" : String(checked.value);
});

const within = (event: Event, slot: string) =>
  event.target instanceof Element && event.target.closest(`[data-slot=${slot}]`) !== null;

const isClick = (event: Event): event is MouseEvent => event.type === "click";

// A leaf's chevron slot is empty space, so it counts as the row.
const partOf = (event: Event) => {
  if (within(event, "tree-item-checkbox")) return "checkbox";
  if (hasChildren.value && within(event, "tree-item-toggle")) return "chevron";
  return "row";
};

const clickSelects = (event: MouseEvent) => {
  // The second click of a double click opens the folder instead.
  if (!tree.toggleOnClick.value && event.detail > 1) return false;
  if (tree.checkbox.value) return partOf(event) === "checkbox";
  return partOf(event) !== "chevron";
};

const clickToggles = (event: MouseEvent) => {
  const part = partOf(event);
  if (part === "checkbox") return false;
  if (part === "chevron") return true;
  return tree.toggleOnClick.value;
};

// A Space in the middle of a typed name goes on with the search; it doesn't select.
const keySelects = (event: KeyboardEvent) => event.key !== " " || !tree.isTyping();

const selects = (event: Event) => (isClick(event) ? clickSelects(event) : keySelects(event as KeyboardEvent));
const toggles = (event: Event) => !isClick(event) || clickToggles(event);

const emitSelect = (event: TreeItemSelectEvent<T>) => {
  emits("select", event);
  if (!event.defaultPrevented) tree.onSelect(event, node.value);
};

const emitToggle = (event: TreeItemToggleEvent<T>) => {
  emits("toggle", event);
  if (!event.defaultPrevented) tree.onToggle(event, node.value);
};

const onSelect = (event: TreeItemSelectEvent<T>) => {
  if (selects(event.detail.originalEvent)) emitSelect(event);
  // The tree keeps the selection; Reka's stays empty.
  event.preventDefault();
};

const onToggle = (event: TreeItemToggleEvent<T>) => {
  if (toggles(event.detail.originalEvent)) emitToggle(event);
  else event.preventDefault();
};

const NAVIGATION = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"]);
const RANGE = new Set(["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]);
const UNTYPED = new Set(["Enter", "Shift", "Control", "Alt", "Meta", "*"]);

// Reka UI's TreeRoot adds every key to its typeahead for a second, so ArrowDown then "d" matches
// nothing. Keys that can't be typed stop at the row; Escape and Tab still bubble, and a
// virtualized tree needs the arrows at its root. A Space that selects stops too, or "d" typed
// after it would search for " d"; a Space typed mid-name goes on to the search.
const reachesRoot = (event: KeyboardEvent) => {
  if (event.key === " ") return tree.isTyping();
  if (UNTYPED.has(event.key)) return false;
  if (NAVIGATION.has(event.key)) return tree.virtual.value;
  return true;
};

const isCharacter = (event: KeyboardEvent) =>
  event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

const onKeydown = (event: KeyboardEvent) => {
  if (event.target !== event.currentTarget) return;
  if (event.key === "*") {
    event.preventDefault();
    tree.expandSiblings(key.value);
  }
  if (event.shiftKey && RANGE.has(event.key)) tree.extendOnFocus(key.value);
  if (!reachesRoot(event)) {
    event.stopPropagation();
    return;
  }
  if (event.key === " " || isCharacter(event)) tree.typed();
};

const onDblclick = (event: MouseEvent) => {
  if (tree.toggleOnClick.value || disabled.value || !hasChildren.value) return;
  if (partOf(event) === "row") tree.toggle(key.value);
};
</script>

<template>
  <TreeItemPrimitive
    v-bind="{ ...$attrs, ...position }"
    as-child
    :value="node"
    :level="props.item.level"
    :disabled="disabled"
    @select="onSelect"
    @toggle="onToggle"
  >
    <component
      v-ripple
      :is="props.as ?? (tree.virtual.value ? 'div' : 'li')"
      data-slot="tree-item"
      :data-key="key"
      :data-selected="(selected && !tree.checkbox.value) || undefined"
      :data-checked="(selected && tree.checkbox.value) || undefined"
      :data-indeterminate="checked === 'indeterminate' || undefined"
      :data-loading="loading || undefined"
      :data-active="tree.isActive(key) ? '' : undefined"
      :aria-selected="ariaSelected"
      :aria-checked="ariaChecked"
      :aria-busy="loading || undefined"
      :style="{ '--tree-level': props.item.level }"
      :class="
        cn(
          `
            group/tree-item relative flex cursor-default items-center gap-(--tree-item-gap) rounded-lg
            py-(--tree-item-py) ps-[calc(var(--tree-item-px)+(var(--tree-level)-1)*var(--tree-indent))]
            pe-(--tree-item-px) outline-none select-none
            before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-foreground
            before:opacity-0 before:transition-opacity before:duration-short-4 before:ease-standard
            hover:before:opacity-(--state-hover)
            active:not-has-[>[data-slot=ripple]>*]:before:opacity-(--state-pressed)
            focus-visible:focus-ring-inset
            data-selected:bg-primary/(--state-selected)
            data-disabled:pointer-events-none data-disabled:text-foreground/(--disabled-opacity)
            data-disabled:data-selected:bg-foreground/(--disabled-container-opacity)
            forced-colors:before:hidden
            forced-colors:data-selected:outline-2
            [&_svg]:pointer-events-none [&_svg]:shrink-0
            icon-size-(--tree-icon)
          `,
          tree.virtual.value
            ? 'h-(--tree-item-height) w-full'
            : `
              min-h-(--tree-item-height) transition-opacity duration-short-4 ease-standard-decelerate
              group-data-ready/tree:starting:opacity-0
              motion-reduce:transition-none
            `,
          props.class,
        )
      "
      @keydown="onKeydown"
      @dblclick="onDblclick"
    >
      <slot v-bind="slotProps" />
    </component>
  </TreeItemPrimitive>
</template>
