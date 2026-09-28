<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { injectProgressContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const { percent, value, max } = injectProgressContext();
</script>

<template>
  <span
    data-slot="progress-value"
    aria-hidden="true"
    :class="cn('ms-auto text-body-md text-muted-foreground tabular-nums', props.class)"
  >
    <slot :percent="percent" :value="value" :max="max">
      <template v-if="percent !== undefined">{{ percent }}%</template>
    </slot>
  </span>
</template>
