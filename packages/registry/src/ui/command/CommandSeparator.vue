<script setup lang="ts">
import { Separator, type SeparatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuSeparator } from "@/ui/menu";
import { injectCommandContext } from ".";

const props = defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});

const { filtering } = injectCommandContext();
</script>

<template>
  <Separator
    v-if="!filtering"
    v-bind="delegated"
    data-slot="command-separator"
    :class="cn(menuSeparator, props.class)"
  />
</template>
