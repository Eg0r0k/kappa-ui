<script setup lang="ts" generic="T extends object = TreeNode, M extends boolean = false">
import { type FlattenedItem, type TreeItemSelectEvent, type TreeItemToggleEvent, TreeRoot } from "reka-ui";
import { type HTMLAttributes, computed, nextTick, onMounted, ref, shallowRef, useAttrs, watch } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import {
  type TreeExpose,
  type TreeNode,
  type TreeRowVirtualizer,
  type TreeVariants,
  fields,
  provideTreeContext,
  treeVariants,
  warnOnce,
} from ".";
import {
  buildIndex,
  checkedStates,
  defaultGetChildren,
  defaultGetKey,
  orderedKeys,
  rangeKeys,
  resolveSelection,
  toggleSelection,
} from "./selection";

defineOptions({ inheritAttrs: false });

type Model = M extends true ? T[] : T;

const props = withDefaults(
  defineProps<{
    /** The nodes at the top level. */
    items: T[];
    modelValue?: Model | null;
    defaultValue?: Model;
    multiple?: M & boolean;
    /** The keys of the expanded nodes. */
    expanded?: string[];
    defaultExpanded?: string[];
    selectionBehavior?: "toggle" | "replace";
    /** A checkbox on every row; implies `multiple` and `cascade`. */
    checkbox?: boolean;
    /** Checking a parent checks its subtree, and a parent is checked while all its children are. */
    cascade?: boolean;
    getKey?: (item: T) => string;
    getChildren?: (item: T) => T[] | undefined;
    /** `false`: a click on a row selects it, and only the chevron or a double click expands it. */
    toggleOnClick?: boolean;
    /** The element to render: `ul`, or `div` around a TreeVirtualizer. */
    as?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    dir?: "ltr" | "rtl";
    variant?: TreeVariants["variant"];
    size?: TreeVariants["size"];
    class?: HTMLAttributes["class"];
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    cascade: undefined,
    selectionBehavior: "toggle",
    toggleOnClick: true,
    as: "ul",
  },
);

const emits = defineEmits<{
  "update:modelValue": [value: Model | undefined];
  "update:expanded": [value: string[]];
  select: [event: TreeItemSelectEvent<T>, item: T];
  toggle: [event: TreeItemToggleEvent<T>, item: T];
}>();

defineSlots<{
  default?: (props: { items: FlattenedItem<T>[]; modelValue: Model | null | undefined; expanded: string[] }) => unknown;
}>();

const attrs = useAttrs();
const control = useFieldControl(props, attrs);

const keyOf = (item: T) => (props.getKey ?? defaultGetKey)(item);
const childrenOf = (item: T) => (props.getChildren ?? defaultGetChildren<T>)(item);

const index = computed(() =>
  buildIndex(props.items, {
    getKey: keyOf,
    getChildren: childrenOf,
    isDisabled: (item) => fields(item).disabled === true,
  }),
);

watch(
  () => index.value.duplicates,
  (duplicates) => {
    const [key] = duplicates;
    if (key === undefined) return;
    warnOnce(
      `duplicate:${key}`,
      `two nodes share the key "${key}", so they expand and select together; pass a getKey that returns a unique string, such as a path.`,
    );
  },
  { immediate: true },
);

// Selection: kept here as keys, never in Reka UI's TreeRoot, which gets a constant empty model.
// Its model is deep-watched (reka-ui#2962), its cascade leaves duplicates, and it emits copies.
const NO_ITEM = Object.freeze({}) as T;
const NO_ITEMS = Object.freeze([]) as unknown as T[];
const rekaKey = (item: T) => (item === NO_ITEM ? "\u0000" : keyOf(item));
const rekaModel = () => (multiple.value ? NO_ITEMS : NO_ITEM) as never;

const multiple = computed(() => !!props.multiple || props.checkbox);
const cascade = computed(() => multiple.value && (props.cascade ?? props.checkbox));

const localModel = shallowRef<Model | null | undefined>(props.modelValue ?? props.defaultValue);
watch(
  () => props.modelValue,
  (value) => (localModel.value = value),
);

const modelNodes = computed(() => {
  const value = localModel.value;
  if (value == null) return [];
  return Array.isArray(value) ? (value as T[]) : [value as T];
});
const nodesByKey = computed(() => new Map(modelNodes.value.map((node) => [keyOf(node), node])));
const selected = computed(() =>
  resolveSelection(
    index.value,
    (multiple.value ? modelNodes.value : modelNodes.value.slice(0, 1)).map(keyOf),
    cascade.value,
  ),
);
const states = computed(() => (cascade.value ? checkedStates(index.value, selected.value, true) : undefined));
const stateOf = (key: string) => states.value?.get(key) ?? selected.value.has(key);

const nodeOf = (key: string) => index.value.entries.get(key)?.node ?? nodesByKey.value.get(key);

const setModel = (value: Model | undefined) => {
  localModel.value = value;
  emits("update:modelValue", value);
};

const emitKeys = (keys: ReadonlySet<string>) =>
  setModel(
    orderedKeys(index.value, keys)
      .map(nodeOf)
      .filter((node): node is T => node !== undefined) as Model,
  );

// A model of the wrong shape after `multiple` changes would leave the tree unable to select (nuxt/ui#3725).
watch(multiple, (isMultiple) => {
  const value = localModel.value;
  if (isMultiple && value != null && !Array.isArray(value)) setModel([value] as Model);
  else if (!isMultiple && Array.isArray(value)) setModel(value[0]);
});

// Expansion
const defaultExpandedKeys = () =>
  index.value.order.filter((key) => fields(index.value.entries.get(key)!.node).defaultExpanded === true);
const localExpanded = ref<string[]>(props.expanded ?? props.defaultExpanded ?? defaultExpandedKeys());
watch(
  () => props.expanded,
  (value) => {
    if (value) localExpanded.value = value;
  },
);
const expandedSet = computed(() => new Set(localExpanded.value));

const setExpanded = (keys: string[]) => {
  localExpanded.value = keys;
  emits("update:expanded", keys);
};

const toggleKey = (key: string) => {
  if (!index.value.entries.get(key)?.children) return;
  setExpanded(
    expandedSet.value.has(key) ? localExpanded.value.filter((k) => k !== key) : [...localExpanded.value, key],
  );
};

const expandAll = () => setExpanded(index.value.order.filter((key) => index.value.entries.get(key)!.children));
const collapseAll = () => setExpanded([]);

const expandSiblings = (key: string) => {
  const entry = index.value.entries.get(key);
  if (!entry) return;
  const siblings = entry.parent === undefined ? index.value.roots : index.value.entries.get(entry.parent)!.children!;
  const closed = siblings.filter((sibling) => {
    const node = index.value.entries.get(sibling)!;
    return node.children && !node.disabled && !expandedSet.value.has(sibling);
  });
  if (closed.length > 0) setExpanded([...localExpanded.value, ...closed]);
};

const visibleKeys = computed(() => {
  const keys: string[] = [];
  const walk = (level: readonly string[]) => {
    for (const key of level) {
      keys.push(key);
      const children = index.value.entries.get(key)!.children;
      if (children && expandedSet.value.has(key)) walk(children);
    }
  };
  walk(index.value.roots);
  return keys;
});

// Tab lands on the selected row: RovingFocusGroup enters on the item marked data-active, if enabled.
const activeKey = computed(() =>
  visibleKeys.value.find((key) => stateOf(key) === true && !index.value.entries.get(key)?.disabled),
);

// Reka UI's typeahead keeps what was typed for a second. A Space typed within it is part of a
// name, not a selection; rows read this to tell the two apart.
let typedAt = Number.NEGATIVE_INFINITY;
const isTyping = () => performance.now() - typedAt < 1000;
const typed = () => {
  typedAt = performance.now();
};

// Applying a selection
let anchor: string | undefined;
let extending = false;

const applySelect = (key: string, original?: Event) => {
  if (!multiple.value) {
    const current = modelNodes.value[0];
    const same = current !== undefined && keyOf(current) === key;
    setModel(same && props.selectionBehavior === "toggle" ? undefined : (nodeOf(key) as Model));
    return;
  }
  const modifiers = original as Partial<MouseEvent> | undefined;
  if (cascade.value || props.selectionBehavior === "toggle") {
    emitKeys(toggleSelection(index.value, selected.value, key, cascade.value));
  } else if (modifiers?.shiftKey && anchor !== undefined) {
    emitKeys(new Set(rangeKeys(index.value, visibleKeys.value, anchor, key)));
    return;
  } else if (modifiers?.ctrlKey || modifiers?.metaKey) {
    emitKeys(toggleSelection(index.value, selected.value, key, false));
  } else {
    emitKeys(new Set([key]));
  }
  anchor = key;
};

const extendOnFocus = (key: string) => {
  if (!multiple.value || cascade.value || props.selectionBehavior !== "replace") return;
  anchor ??= key;
  extending = true;
  // Focus moves a tick later, or a frame later in a virtualized tree; a key that moves nothing ends here.
  requestAnimationFrame(() => requestAnimationFrame(() => (extending = false)));
};

const onFocusin = (event: FocusEvent) => {
  if (!extending || anchor === undefined) return;
  extending = false;
  const key = (event.target as Element).closest<HTMLElement>("[data-slot=tree-item]")?.dataset.key;
  if (key !== undefined) emitKeys(new Set(rangeKeys(index.value, visibleKeys.value, anchor, key)));
};

// Virtualization: a TreeVirtualizer registers its virtualizer here
const rootRef = ref<{ $el: HTMLElement }>();
const rootEl = () => rootRef.value?.$el as HTMLElement | undefined;

const virtualizer = shallowRef<TreeRowVirtualizer>();
const virtual = computed(() => virtualizer.value !== undefined);
const registerVirtualizer = (instance: TreeRowVirtualizer) => {
  virtualizer.value = instance;
  return () => {
    if (virtualizer.value === instance) virtualizer.value = undefined;
  };
};

// Rows added after the first frame fade in; the rows the tree mounts with don't.
const ready = ref(false);
onMounted(() => requestAnimationFrame(() => requestAnimationFrame(() => (ready.value = true))));

const scrollToKey = (key: string) => {
  const position = visibleKeys.value.indexOf(key);
  if (position === -1) return false;
  if (virtualizer.value) {
    virtualizer.value.scrollToIndex(position, { align: "auto" });
  } else {
    rootEl()
      ?.querySelector(`[data-key="${CSS.escape(key)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }
  return true;
};

// TreeVirtualizer keys rows by index + key, so expanding a node above the focused row remounts it
// and focus falls to <body>. Put it back on the same node.
watch(
  localExpanded,
  () => {
    const el = rootEl();
    if (!virtual.value || !el) return;
    const focused = document.activeElement;
    const key =
      focused && el.contains(focused) ? focused.closest<HTMLElement>("[data-slot=tree-item]")?.dataset.key : undefined;
    if (key === undefined) return;
    nextTick(() => {
      const now = document.activeElement;
      if (now && now !== document.body) return;
      scrollToKey(key);
      requestAnimationFrame(() => el.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`)?.focus());
    });
  },
  { flush: "pre" },
);

provideTreeContext({
  size: computed(() => props.size ?? "md"),
  multiple,
  checkbox: computed(() => props.checkbox),
  virtual,
  disabled: computed(() => !!control.disabled.value),
  toggleOnClick: computed(() => props.toggleOnClick),
  keyOf,
  hasChildren: (item: T) => childrenOf(item) !== undefined,
  isDisabled: (item) => fields(item).disabled === true,
  isExpanded: (key) => expandedSet.value.has(key),
  isActive: (key) => activeKey.value === key,
  stateOf,
  onSelect: (event, item: T) => {
    emits("select", event as TreeItemSelectEvent<T>, item);
    if (!event.defaultPrevented) applySelect(keyOf(item), event.detail?.originalEvent);
  },
  onToggle: (event, item: T) => emits("toggle", event as TreeItemToggleEvent<T>, item),
  select: (item: T) => applySelect(keyOf(item)),
  toggle: toggleKey,
  expandSiblings,
  extendOnFocus,
  isTyping,
  typed,
  rootEl,
  registerVirtualizer,
});

const submitKeys = computed(() => (props.name ? orderedKeys(index.value, selected.value) : []));
// Hidden inputs can't be required, so an empty required one stands in: a plain form won't submit
// with nothing selected. The tree takes the focus instead of that input.
const blocksSubmit = computed(
  () => !!props.name && !!control.required.value && !control.disabled.value && submitKeys.value.length === 0,
);
const focusTree = () => {
  const rows = [...(rootEl()?.querySelectorAll<HTMLElement>("[role=treeitem]:not([data-disabled])") ?? [])];
  (rows.find((row) => row.dataset.active === "") ?? rows[0])?.focus();
};

defineExpose<TreeExpose>({
  get $el() {
    return rootEl();
  },
  expandAll,
  collapseAll,
  scrollToKey,
});
</script>

<template>
  <TreeRoot
    v-bind="attrs"
    ref="rootRef"
    v-slot="{ flattenItems }"
    data-slot="tree"
    :as="props.as"
    :items="props.items"
    :get-key="rekaKey"
    :get-children="childrenOf"
    :model-value="rekaModel()"
    :multiple="multiple"
    :expanded="localExpanded"
    :disabled="control.disabled.value"
    :dir="props.dir"
    :data-size="props.size ?? 'md'"
    :data-variant="props.variant ?? 'ghost'"
    :data-disabled="control.disabled.value || undefined"
    :data-virtual="virtual || undefined"
    :data-checkbox="props.checkbox || undefined"
    :data-ready="ready || undefined"
    :id="control.id.value"
    :aria-labelledby="control.labelledBy.value"
    :aria-describedby="control.describedBy.value"
    :aria-invalid="control.invalid.value"
    :aria-required="control.required.value || undefined"
    :class="
      cn(
        treeVariants({ variant: props.variant, size: props.size }),
        virtual && 'relative block overflow-y-auto overscroll-contain',
        props.class,
      )
    "
    @update:expanded="setExpanded"
    @focusin="onFocusin"
  >
    <slot :items="flattenItems" :model-value="localModel" :expanded="localExpanded" />
  </TreeRoot>
  <template v-if="props.name">
    <input
      v-for="key in submitKeys"
      :key="key"
      type="hidden"
      :name="props.name"
      :value="key"
      :disabled="control.disabled.value"
    />
    <input
      v-if="blocksSubmit"
      type="text"
      value=""
      required
      tabindex="-1"
      aria-hidden="true"
      data-slot="tree-required"
      class="sr-only"
      @invalid.prevent="focusTree"
    />
  </template>
</template>
