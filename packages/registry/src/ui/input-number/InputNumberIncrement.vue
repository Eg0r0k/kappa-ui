<script setup lang="ts">
import { ChevronUp, Plus } from "@lucide/vue";
import { NumberFieldIncrement } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { injectInputNumberContext, inputNumberButtonVariants } from ".";

const props = defineProps<{ disabled?: boolean; class?: HTMLAttributes["class"] }>();

const context = injectInputNumberContext();
</script>

<template>
  <NumberFieldIncrement as-child :disabled="props.disabled">
    <Button
      data-slot="input-number-increment"
      variant="ghost"
      color="neutral"
      :class="cn(inputNumberButtonVariants({ orientation: context.orientation, part: 'increment' }), props.class)"
    >
      <slot>
        <ChevronUp v-if="context.orientation === 'vertical'" />
        <Plus v-else />
      </slot>
    </Button>
  </NumberFieldIncrement>
</template>
