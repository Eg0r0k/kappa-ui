<script setup lang="ts">
import { X } from "@lucide/vue";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { injectTourContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const { tour } = injectTourContext();
</script>

<template>
  <Button
    data-slot="tour-close"
    variant="ghost"
    color="neutral"
    size="icon-sm"
    aria-label="Close"
    :class="cn('absolute end-2 top-2 rounded-inset-surface-md/2', props.class)"
    @click="tour.finish()"
  >
    <slot>
      <X />
    </slot>
  </Button>
</template>
