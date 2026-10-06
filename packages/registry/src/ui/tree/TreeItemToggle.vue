<script setup lang="ts">
import { ChevronRight } from "@lucide/vue";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Spinner } from "@/ui/spinner";
import { injectTreeItemContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

defineSlots<{ default?: (props: { expanded: boolean }) => unknown }>();

const item = injectTreeItemContext();
</script>

<template>
  <span
    data-slot="tree-item-toggle"
    aria-hidden="true"
    :data-state="item.hasChildren.value ? (item.expanded.value ? 'open' : 'closed') : undefined"
    :class="
      cn(
        `
          relative flex size-(--tree-icon) shrink-0 items-center justify-center text-muted-foreground
          before:absolute before:top-1/2 before:left-1/2 before:size-6 before:-translate-1/2
          group-data-disabled/tree-item:text-foreground/(--disabled-opacity)
        `,
        props.class,
      )
    "
  >
    <Spinner v-if="item.loading.value" />
    <slot v-else-if="item.hasChildren.value" :expanded="item.expanded.value">
      <ChevronRight
        class="transition-transform duration-short-4 ease-standard group-data-expanded/tree-item:rotate-90 motion-reduce:transition-none rtl:rotate-180 rtl:group-data-expanded/tree-item:rotate-90"
      />
    </slot>
  </span>
</template>
