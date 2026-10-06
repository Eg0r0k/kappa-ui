<script setup lang="ts" generic="T extends object = TreeNode, M extends boolean = false">
import type { Virtualizer } from "@tanstack/vue-virtual";
import {
  type FlattenedItem,
  type TreeItemSelectEvent,
  type TreeItemToggleEvent,
  TreeRoot,
  TreeVirtualizer,
} from "reka-ui";
import { type HTMLAttributes, computed, nextTick, onMounted, ref, shallowRef, useAttrs, watch } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import {
  type TreeExpose,
  type TreeItemSlotProps,
  type TreeNode,
  type TreeVariants,
  fields,
  type TreeVirtualizeOptions,
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
import TreeItem from "./TreeItem.vue";

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
    labelKey?: string;
    /** `false`: a click on a row selects it, and only the chevron or a double click expands it. */
    toggleOnClick?: boolean;
    virtualize?: boolean | TreeVirtualizeOptions;
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
    labelKey: "label",
    selectionBehavior: "toggle",
    toggleOnClick: true,
    virtualize: false,
  },
);

const emits = defineEmits<{
  "update:modelValue": [value: Model | undefined];
  "update:expanded": [value: string[]];
  select: [event: TreeItemSelectEvent<T>, item: T];
  toggle: [event: TreeItemToggleEvent<T>, item: T];
}>();

const slots = defineSlots<{
  default?: (props: { items: FlattenedItem<T>[]; modelValue: Model | null | undefined; expanded: string[] }) => unknown;
  item?: (props: TreeItemSlotProps<T>) => unknown;
  "item-leading"?: (props: TreeItemSlotProps<T>) => unknown;
  "item-label"?: (props: TreeItemSlotProps<T>) => unknown;
  "item-trailing"?: (props: TreeItemSlotProps<T>) => unknown;
}>();

const attrs = useAttrs();
const control = useFieldControl(props, attrs);

const keyOf = (item: T) => (props.getKey ?? defaultGetKey)(item);
const childrenOf = (item: T) => (props.getChildren ?? defaultGetChildren<T>)(item);
const labelOf = (item: T) => {
  const value = props.labelKey
    .split(".")
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], item);
  return value == null ? "" : String(value);
};

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

// Tab lands on the selected row: RovingFocusGroup enters on the item marked data-active.
const activeKey = computed(() => visibleKeys.value.find((key) => stateOf(key) === true));

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

// Virtualization
const rootRef = ref<{ $el: HTMLElement }>();
const rootEl = () => rootRef.value?.$el as HTMLElement | undefined;

const virtualOptions = computed<TreeVirtualizeOptions | undefined>(() =>
  props.virtualize === true ? {} : props.virtualize || undefined,
);
const virtual = computed(() => virtualOptions.value !== undefined);

const probe = ref<HTMLElement>();
const rowSize = ref(0);
let virtualizer: Virtualizer<Element | Window, Element> | undefined;
const remember = (instance: Virtualizer<Element | Window, Element>, item: FlattenedItem<T>) => {
  virtualizer = instance;
  return item;
};

const checkScroller = () => {
  const el = rootEl();
  if (!virtual.value || !el || visibleKeys.value.length <= 50) return;
  if (el.clientHeight > 0 && el.scrollHeight <= el.clientHeight + 1) {
    warnOnce("virtualize-height", 'virtualize needs a height on the tree, such as class="h-80"; rendering every row.');
  }
};

const measure = () => {
  if (!virtual.value) return;
  // TreeVirtualizer has no measureElement: rows get a fixed height, read here from --tree-item-height.
  rowSize.value = virtualOptions.value?.estimateSize ?? (probe.value?.offsetHeight || 36);
  nextTick(() => requestAnimationFrame(checkScroller));
};
// Rows added after the first frame fade in; the rows the tree mounts with don't.
const ready = ref(false);
onMounted(() => {
  measure();
  requestAnimationFrame(() => requestAnimationFrame(() => (ready.value = true)));
});
watch([() => props.size, virtual], () => nextTick(measure));

const scrollToKey = (key: string) => {
  const position = visibleKeys.value.indexOf(key);
  if (position === -1) return false;
  if (virtual.value && virtualizer) {
    virtualizer.scrollToIndex(position, { align: "auto" });
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
  labelOf,
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
});

const submitKeys = computed(() => (props.name ? orderedKeys(index.value, selected.value) : []));

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
    :key="virtual ? 'virtual' : 'flat'"
    ref="rootRef"
    v-slot="{ flattenItems }"
    data-slot="tree"
    :as="virtual ? 'div' : 'ul'"
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
    <template v-if="virtual">
      <div
        ref="probe"
        aria-hidden="true"
        data-slot="tree-probe"
        class="pointer-events-none invisible absolute h-(--tree-item-height)"
      />
      <TreeVirtualizer
        v-if="rowSize > 0"
        :key="rowSize"
        v-slot="{ item, virtualizer: instance }"
        :estimate-size="rowSize"
        :overscan="virtualOptions?.overscan ?? 12"
        :text-content="(node) => labelOf(node as T)"
      >
        <TreeItem :item="remember(instance, item as FlattenedItem<T>)">
          <template v-if="slots.item" #default="row"><slot name="item" v-bind="row" /></template>
          <template v-if="slots['item-leading']" #leading="row"><slot name="item-leading" v-bind="row" /></template>
          <template v-if="slots['item-label']" #label="row"><slot name="item-label" v-bind="row" /></template>
          <template v-if="slots['item-trailing']" #trailing="row"><slot name="item-trailing" v-bind="row" /></template>
        </TreeItem>
      </TreeVirtualizer>
    </template>
    <slot v-else :items="flattenItems" :model-value="localModel" :expanded="localExpanded">
      <TreeItem v-for="item in flattenItems" :key="item._id" :item="item">
        <template v-if="slots.item" #default="row"><slot name="item" v-bind="row" /></template>
        <template v-if="slots['item-leading']" #leading="row"><slot name="item-leading" v-bind="row" /></template>
        <template v-if="slots['item-label']" #label="row"><slot name="item-label" v-bind="row" /></template>
        <template v-if="slots['item-trailing']" #trailing="row"><slot name="item-trailing" v-bind="row" /></template>
      </TreeItem>
    </slot>
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
  </template>
</template>
