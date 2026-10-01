<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Spinner } from "@/ui/spinner";
import { injectInnerLoadingContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

defineSlots<{ default?: () => unknown }>();

const { loading } = injectInnerLoadingContext();
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-short-4 ease-emphasized-decelerate motion-reduce:transition-none"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-short-2 ease-emphasized-accelerate motion-reduce:transition-none"
    leave-to-class="opacity-0"
  >
    <div
      v-if="loading"
      data-slot="inner-loading-overlay"
      role="status"
      :class="
        cn(
          'absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/70 text-body-sm',
          props.class,
        )
      "
    >
      <slot><Spinner class="size-6" /></slot>
    </div>
  </Transition>
</template>
