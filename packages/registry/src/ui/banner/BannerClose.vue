<script setup lang="ts">
import { X } from "@lucide/vue";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { injectBannerContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const { close } = injectBannerContext();
</script>

<template>
  <Button
    data-slot="banner-close"
    variant="ghost"
    color="neutral"
    size="icon-sm"
    aria-label="Close"
    :class="cn('absolute end-2 top-1/2 -translate-y-1/2 text-current [--color-ring:currentColor]', props.class)"
    @click="close"
  >
    <slot>
      <X />
    </slot>
  </Button>
</template>
