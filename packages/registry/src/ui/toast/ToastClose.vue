<script setup lang="ts">
import { X } from "@lucide/vue";
import { ToastClose } from "@kappa-ui/core/toast";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <ToastClose as-child>
    <Button
      data-slot="toast-close"
      variant="ghost"
      color="neutral"
      size="icon-xs"
      aria-label="Close"
      :class="cn('rounded-[max(0px,calc(--theme(--radius-xl)-var(--spacing)*2.5))] text-muted-foreground', props.class)"
    >
      <slot>
        <X />
      </slot>
    </Button>
  </ToastClose>
</template>
