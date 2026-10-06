<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type TableLayout, type TableOverflow, type TableSize, tableStyles } from ".";

const props = withDefaults(
  defineProps<{
    overflow?: TableOverflow;
    layout?: TableLayout;
    size?: TableSize;
    striped?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { overflow: "x", layout: "auto", size: "md", striped: false },
);
</script>

<template>
  <div data-slot="table-container" :data-overflow="props.overflow" :class="cn(tableStyles.container, props.class)">
    <table
      data-slot="table"
      :data-layout="props.layout"
      :data-size="props.size"
      :data-striped="props.striped ? '' : undefined"
      :class="tableStyles.table"
    >
      <slot />
    </table>
  </div>
</template>
