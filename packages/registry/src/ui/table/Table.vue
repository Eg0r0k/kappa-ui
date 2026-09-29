<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type TableDensity, type TableOverflow, tableStyles } from ".";

const props = withDefaults(
  defineProps<{
    overflow?: TableOverflow;
    density?: TableDensity;
    striped?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { overflow: "x", density: "md", striped: false },
);
</script>

<template>
  <div data-slot="table-container" :data-overflow="props.overflow" :class="cn(tableStyles.container, props.class)">
    <table
      data-slot="table"
      :data-density="props.density"
      :data-striped="props.striped ? '' : undefined"
      :class="tableStyles.table"
    >
      <slot />
    </table>
  </div>
</template>
