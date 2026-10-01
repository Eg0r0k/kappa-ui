<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { injectInnerLoadingContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

defineSlots<{ default?: () => unknown }>();

const context = injectInnerLoadingContext();
</script>

<template>
  <div
    :ref="context.content"
    data-slot="inner-loading-content"
    :inert="context.loading.value"
    :class="cn('contents', props.class)"
  >
    <slot />
  </div>
</template>
