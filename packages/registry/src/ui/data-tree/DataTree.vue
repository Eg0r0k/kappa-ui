<script setup lang="ts" generic="T extends object = TreeNode, M extends boolean = false">
import {
  type HTMLAttributes,
  type PropType,
  Fragment,
  computed,
  defineComponent,
  h,
  ref,
  shallowRef,
  useAttrs,
} from "vue";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/ui/skeleton";
import {
  Tree,
  type TreeExpose,
  type TreeFlattenedItem,
  TreeItem,
  TreeItemCheckbox,
  TreeItemIcon,
  TreeItemLabel,
  type TreeItemSelectEvent,
  type TreeItemSlotProps,
  TreeItemToggle,
  type TreeItemToggleEvent,
  type TreeNode,
  type TreeSize,
  type TreeVariants,
  TreeVirtualizer,
} from "@/ui/tree";
import { type DataTreeExpose, type DataTreeVirtualize, dataTreeMessage, dataTreeVariants } from ".";

defineOptions({ inheritAttrs: false });

type Model = M extends true ? T[] : T;

const props = withDefaults(
  defineProps<{
    items: T[];
    defaultValue?: Model;
    multiple?: M & boolean;
    defaultExpanded?: string[];
    selectionBehavior?: "toggle" | "replace";
    checkbox?: boolean;
    cascade?: boolean;
    getKey?: (item: T) => string;
    getChildren?: (item: T) => T[] | undefined;
    toggleOnClick?: boolean;
    name?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    dir?: "ltr" | "rtl";
    variant?: TreeVariants["variant"];
    size?: TreeSize;
    virtualize?: DataTreeVirtualize<T>;
    loading?: boolean;
    loadingRows?: number;
    empty?: string;
    error?: unknown;
    class?: HTMLAttributes["class"];
  }>(),
  {
    defaultValue: undefined,
    cascade: undefined,
    selectionBehavior: "toggle",
    toggleOnClick: true,
    size: "md",
    virtualize: false,
    loading: false,
    loadingRows: 3,
    empty: "No items",
  },
);

const model = defineModel<Model | null | undefined>();
const expanded = defineModel<string[] | undefined>("expanded");

const emits = defineEmits<{
  select: [event: TreeItemSelectEvent<T>, item: T];
  toggle: [event: TreeItemToggleEvent<T>, item: T];
}>();

defineSlots<{
  item?: (props: TreeItemSlotProps<T>) => unknown;
  empty?: () => unknown;
  loading?: () => unknown;
  error?: (props: { error: unknown }) => unknown;
}>();

const attrs = useAttrs();
const treeAttrs = computed(() => {
  const { style: _, ...rest } = attrs;
  return rest;
});

const failed = computed(() => props.error !== undefined && props.error !== null && props.error !== false);
const errorText = computed(() =>
  typeof props.error === "string" && props.error !== "" ? props.error : "Something went wrong",
);
const state = computed(() => {
  if (failed.value) return "error";
  if (props.items.length > 0) return undefined;
  return props.loading ? "loading" : "empty";
});

// A cleared single selection is undefined, which a remounted Tree would read as "use defaultValue".
const modelTouched = ref(false);
const setModel = (value: Model | undefined) => {
  modelTouched.value = true;
  model.value = value;
};

const virtual = computed(() => props.virtualize !== false);
const virtualOptions = computed(() => (typeof props.virtualize === "object" ? props.virtualize : {}));

const TreeRows = defineComponent({
  props: { items: { type: Array as PropType<TreeFlattenedItem<T>[]>, required: true } },
  setup:
    (rowsProps, { slots }) =>
    () =>
      rowsProps.items.map((row) => h(Fragment, { key: row._id }, slots.default?.({ item: row }))),
});

const node = (item: T) => item as TreeNode;
const skeletonWidths = ["w-2/3", "w-1/2", "w-3/4"];

const treeRef = shallowRef<TreeExpose>();
defineExpose<DataTreeExpose>({
  expandAll: () => treeRef.value?.expandAll(),
  collapseAll: () => treeRef.value?.collapseAll(),
  scrollToKey: (key) => treeRef.value?.scrollToKey(key) ?? false,
});
</script>

<template>
  <div
    data-slot="data-tree"
    :data-size="props.size"
    :data-variant="props.variant ?? 'ghost'"
    :aria-busy="props.loading || undefined"
    :style="attrs.style"
    :class="cn(dataTreeVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <div v-if="state === 'error'" data-slot="data-tree-error" class="flex min-h-0 flex-1 flex-col">
      <slot name="error" :error="props.error">
        <p role="alert" :class="dataTreeMessage">{{ errorText }}</p>
      </slot>
    </div>
    <div v-else-if="state === 'loading'" data-slot="data-tree-loading" class="flex min-h-0 flex-1 flex-col">
      <slot name="loading">
        <div
          v-for="index in props.loadingRows"
          :key="index"
          aria-hidden="true"
          class="flex h-(--tree-item-height) shrink-0 items-center px-(--tree-item-px)"
        >
          <Skeleton variant="text" :class="skeletonWidths[(index - 1) % skeletonWidths.length]" />
        </div>
      </slot>
    </div>
    <div v-else-if="state === 'empty'" data-slot="data-tree-empty" class="flex min-h-0 flex-1 flex-col">
      <slot name="empty">
        <p :class="dataTreeMessage">{{ props.empty }}</p>
      </slot>
    </div>
    <Tree
      v-else
      v-bind="treeAttrs"
      ref="treeRef"
      v-slot="{ items }"
      :items="props.items"
      :model-value="model"
      :default-value="modelTouched ? undefined : props.defaultValue"
      :multiple="props.multiple"
      :expanded="expanded"
      :default-expanded="props.defaultExpanded"
      :selection-behavior="props.selectionBehavior"
      :checkbox="props.checkbox"
      :cascade="props.cascade"
      :get-key="props.getKey"
      :get-children="props.getChildren"
      :toggle-on-click="props.toggleOnClick"
      :name="props.name"
      :id="props.id"
      :disabled="props.disabled"
      :required="props.required"
      :dir="props.dir"
      :size="props.size"
      :as="virtual ? 'div' : 'ul'"
      class="min-h-0 flex-1 overflow-y-auto"
      @update:model-value="setModel"
      @update:expanded="(keys: string[]) => (expanded = keys)"
      @select="(event: TreeItemSelectEvent<T>, item: T) => emits('select', event, item)"
      @toggle="(event: TreeItemToggleEvent<T>, item: T) => emits('toggle', event, item)"
    >
      <component
        :is="virtual ? TreeVirtualizer : TreeRows"
        v-bind="virtual ? virtualOptions : { items }"
        v-slot="{ item: row }"
      >
        <TreeItem v-slot="scope" :item="row as TreeFlattenedItem<T>">
          <slot name="item" v-bind="scope">
            <TreeItemToggle />
            <TreeItemCheckbox v-if="props.checkbox" />
            <TreeItemIcon v-if="node(scope.item).icon">
              <component :is="node(scope.item).icon" />
            </TreeItemIcon>
            <TreeItemLabel>{{ node(scope.item).label }}</TreeItemLabel>
          </slot>
        </TreeItem>
      </component>
    </Tree>
  </div>
</template>
