<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { tableStyles } from ".";

const props = defineProps<{ sticky?: boolean; class?: HTMLAttributes["class"] }>();
</script>

<template>
  <tfoot
    data-slot="table-footer"
    :data-sticky="props.sticky ? '' : undefined"
    :class="cn(tableStyles.footer, props.class)"
  >
    <slot />
  </tfoot>
</template>
