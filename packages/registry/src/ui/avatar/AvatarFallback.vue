<script setup lang="ts">
import { AvatarFallback, type AvatarFallbackProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<AvatarFallbackProps & { class?: HTMLAttributes["class"] }>();
</script>

<template>
  <AvatarFallback
    data-slot="avatar-fallback"
    :delay-ms="props.delayMs"
    :as="props.as"
    :as-child="props.asChild"
    :class="cn('flex size-full items-center justify-center bg-muted text-muted-foreground', props.class)"
  >
    <slot />
  </AvatarFallback>
</template>
