<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { tableStyles } from ".";

const props = defineProps<{ visible?: boolean; class?: HTMLAttributes["class"] }>();
</script>

<template>
  <caption
    data-slot="table-caption"
    :data-visible="props.visible ? '' : undefined"
    :class="cn(tableStyles.caption, props.class)"
  >
    <slot />
  </caption>
</template>
