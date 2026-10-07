<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { checkboxVariants } from "@/ui/checkbox";
import { injectTreeContext, injectTreeItemContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const tree = injectTreeContext();
const item = injectTreeItemContext();

const state = computed(() =>
  item.checked.value === "indeterminate" ? "indeterminate" : item.checked.value ? "checked" : "unchecked",
);
</script>

<!-- Drawn, not a control: the row is the treeitem and carries aria-checked, so nothing interactive nests in it. -->
<template>
  <span
    data-slot="tree-item-checkbox"
    aria-hidden="true"
    :data-state="state"
    :data-size="tree.size.value"
    :data-disabled="item.disabled.value || undefined"
    :class="
      cn(
        checkboxVariants({ size: tree.size.value }),
        `
          data-disabled:border-foreground/(--disabled-opacity) data-disabled:text-background
          data-disabled:data-[state=checked]:border-transparent
          data-disabled:data-[state=checked]:bg-foreground/(--disabled-opacity)
          data-disabled:data-[state=indeterminate]:border-transparent
          data-disabled:data-[state=indeterminate]:bg-foreground/(--disabled-opacity)
        `,
        props.class,
      )
    "
  >
    <span class="pointer-events-none absolute -inset-0.5">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-full"
      >
        <path
          d="M6 12.5l4 4 8-9"
          pathLength="1"
          class="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-short-4 ease-standard group-data-[state=checked]/checkbox:[stroke-dashoffset:0] motion-reduce:transition-none"
        />
        <path
          d="M7 12h10"
          pathLength="1"
          class="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-short-4 ease-standard group-data-[state=indeterminate]/checkbox:[stroke-dashoffset:0] motion-reduce:transition-none"
        />
      </svg>
    </span>
  </span>
</template>
