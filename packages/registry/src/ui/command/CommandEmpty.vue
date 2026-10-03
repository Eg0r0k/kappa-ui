<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectCommandContext } from ".";

const props = defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});

const { filterState } = injectCommandContext();
const visible = computed(() => Boolean(filterState.search) && filterState.filtered.count === 0);
</script>

<template>
  <Primitive
    v-if="visible"
    v-bind="delegated"
    data-slot="command-empty"
    :class="cn('px-(--menu-item-px) py-6 text-center text-muted-foreground', props.class)"
  >
    <slot />
  </Primitive>
</template>
