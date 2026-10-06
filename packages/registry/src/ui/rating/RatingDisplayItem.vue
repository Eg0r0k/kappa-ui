<!--
  The layers (an empty icon behind a filled icon clipped to the value) are adapted from Nuxt UI
  (https://github.com/nuxt/ui), modified for kappa-ui.
  Copyright (c) 2023 Nuxt. MIT License: https://github.com/nuxt/ui/blob/v4/LICENSE.md
-->
<script setup lang="ts">
import { Star } from "@lucide/vue";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

import {
  injectRatingDisplayContext,
  ratingClipClass,
  ratingEmptyIconClass,
  ratingIconClass,
  ratingItemVariants,
} from ".";

const props = defineProps<{ item: number; class?: HTMLAttributes["class"] }>();
defineSlots<{ default?: (props: { filled: boolean }) => unknown }>();

const display = injectRatingDisplayContext();
</script>

<template>
  <span data-slot="rating-item" :class="cn(ratingItemVariants({ interactive: false }), props.class)">
    <span data-slot="rating-empty-icon" aria-hidden="true" :class="ratingEmptyIconClass">
      <slot :filled="false"><Star /></slot>
    </span>
    <span :class="ratingClipClass" :style="{ width: display.fill(props.item) }">
      <span data-slot="rating-icon" aria-hidden="true" :class="ratingIconClass">
        <slot :filled="true"><Star /></slot>
      </span>
    </span>
  </span>
</template>
