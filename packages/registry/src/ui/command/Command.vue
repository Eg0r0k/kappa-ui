<script setup lang="ts">
import { ListboxRoot, type ListboxRootEmits, type ListboxRootProps, useFilter, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed, reactive, ref, watch } from "vue";

import { cn } from "@/lib/utils";
import { type MenuSize, menuSizeVariants } from "@/ui/menu";
import { type CommandFilterState, provideCommandContext } from ".";

const props = withDefaults(
  defineProps<ListboxRootProps & { size?: MenuSize; ignoreFilter?: boolean; class?: HTMLAttributes["class"] }>(),
  {
    modelValue: "",
    highlightOnHover: true,
    size: "md",
    ignoreFilter: false,
  },
);
const emits = defineEmits<ListboxRootEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ignoreFilter: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const allItems = ref(new Map<string, string>());
const allGroups = ref(new Map<string, Set<string>>());
const filterState = reactive<CommandFilterState>({
  search: "",
  filtered: { count: 0, items: new Map(), groups: new Set() },
});

const { contains } = useFilter({ sensitivity: "base" });

const filtering = computed(() => Boolean(filterState.search) && !props.ignoreFilter);

const filterItems = () => {
  if (!filtering.value) {
    filterState.filtered.count = allItems.value.size;
    return;
  }
  let count = 0;
  for (const [id, text] of allItems.value) {
    const match = contains(text, filterState.search);
    filterState.filtered.items.set(id, match);
    if (match) count++;
  }
  filterState.filtered.groups = new Set(
    [...allGroups.value]
      .filter(([, ids]) => [...ids].some((id) => filterState.filtered.items.get(id)))
      .map(([groupId]) => groupId),
  );
  filterState.filtered.count = count;
};

watch(() => [filterState.search, filtering.value, allItems.value.size], filterItems);

provideCommandContext({ allItems, allGroups, filterState, filtering });
</script>

<template>
  <ListboxRoot
    v-bind="forwarded"
    data-slot="command"
    :data-size="props.size"
    :class="
      cn(
        'flex h-full w-full flex-col overflow-hidden bg-popover text-popover-foreground',
        menuSizeVariants({ size: props.size }),
        'p-0',
        props.class,
      )
    "
  >
    <slot />
  </ListboxRoot>
</template>
