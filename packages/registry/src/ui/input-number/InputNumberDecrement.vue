<script setup lang="ts">
import { ChevronDown, Minus } from "@lucide/vue";
import { NumberFieldDecrement } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { injectInputNumberContext, inputNumberButtonVariants } from ".";

const props = defineProps<{ disabled?: boolean; class?: HTMLAttributes["class"] }>();

const context = injectInputNumberContext();
</script>

<template>
  <NumberFieldDecrement as-child :disabled="props.disabled">
    <Button
      data-slot="input-number-decrement"
      variant="ghost"
      color="neutral"
      :class="cn(inputNumberButtonVariants({ orientation: context.orientation, part: 'decrement' }), props.class)"
    >
      <slot>
        <ChevronDown v-if="context.orientation === 'vertical'" />
        <Minus v-else />
      </slot>
    </Button>
  </NumberFieldDecrement>
</template>
