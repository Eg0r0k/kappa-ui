<script setup lang="ts">
import {
  ListboxItem,
  type ListboxItemEmits,
  type ListboxItemProps,
  useForwardExpose,
  useForwardPropsEmits,
  useId,
} from "reka-ui";
import { type HTMLAttributes, computed, onMounted, onUnmounted } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { menuItem } from "@/ui/menu";
import { injectCommandContext, injectCommandGroupContext } from ".";

const props = defineProps<ListboxItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ListboxItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const id = useId();
const { allItems, allGroups, filterState, filtering } = injectCommandContext();
const group = injectCommandGroupContext(null);
const { forwardRef, currentElement } = useForwardExpose();

const visible = computed(() => !filtering.value || filterState.filtered.items.get(id) !== false);

onMounted(() => {
  allItems.value.set(id, currentElement.value?.textContent ?? String(props.value ?? ""));
  if (!group) return;
  const members = allGroups.value.get(group.id) ?? new Set<string>();
  allGroups.value.set(group.id, members.add(id));
});
onUnmounted(() => {
  allItems.value.delete(id);
  if (group) allGroups.value.get(group.id)?.delete(id);
});
</script>

<template>
  <ListboxItem
    v-ripple
    v-if="visible"
    v-bind="forwarded"
    :id="id"
    :ref="forwardRef"
    data-slot="command-item"
    :class="cn(menuItem, props.class)"
    @select="filterState.search = ''"
  >
    <slot />
  </ListboxItem>
</template>
