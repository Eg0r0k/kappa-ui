<script setup lang="ts">
import { ListboxGroup, type ListboxGroupProps, useId } from "reka-ui";
import { type HTMLAttributes, computed, onMounted, onUnmounted } from "vue";

import { cn } from "@/lib/utils";
import { injectCommandContext, provideCommandGroupContext } from ".";

const props = defineProps<ListboxGroupProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});

const { allGroups, filterState } = injectCommandContext();
const id = useId();
const visible = computed(() => !filterState.search || filterState.filtered.groups.has(id));

provideCommandGroupContext({ id });
onMounted(() => {
  if (!allGroups.value.has(id)) allGroups.value.set(id, new Set());
});
onUnmounted(() => {
  allGroups.value.delete(id);
});
</script>

<template>
  <ListboxGroup
    v-bind="delegated"
    :id="id"
    data-slot="command-group"
    :hidden="visible ? undefined : true"
    :class="cn('flex flex-col gap-0.5', props.class)"
  >
    <slot />
  </ListboxGroup>
</template>
