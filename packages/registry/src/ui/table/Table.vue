<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type TableDensity, type TableLayout, type TableOverflow, tableStyles } from ".";

const props = withDefaults(
  defineProps<{
    overflow?: TableOverflow;
    layout?: TableLayout;
    density?: TableDensity;
    striped?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { overflow: "x", layout: "auto", density: "md", striped: false },
);
</script>

<template>
  <div data-slot="table-container" :data-overflow="props.overflow" :class="cn(tableStyles.container, props.class)">
    <table
      data-slot="table"
      :data-layout="props.layout"
      :data-density="props.density"
      :data-striped="props.striped ? '' : undefined"
      :class="tableStyles.table"
    >
      <slot />
    </table>
  </div>
</template>
