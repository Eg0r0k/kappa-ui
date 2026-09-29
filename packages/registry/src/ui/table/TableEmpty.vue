<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { tableStyles } from ".";

const props = defineProps<{ colspan: number; class?: HTMLAttributes["class"] }>();
</script>

<template>
  <tr data-slot="table-empty" :class="tableStyles.row">
    <td :colspan="props.colspan" :class="cn(tableStyles.cell, 'whitespace-normal')">
      <div :class="cn(tableStyles.empty, props.class)">
        <slot />
      </div>
    </td>
  </tr>
</template>
