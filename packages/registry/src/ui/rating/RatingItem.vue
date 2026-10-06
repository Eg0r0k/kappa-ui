<!--
  The layers (an empty icon behind one clipped indicator per step, the icon drawn once per layer) are adapted from
  Nuxt UI (https://github.com/nuxt/ui), modified for kappa-ui.
  Copyright (c) 2023 Nuxt. MIT License: https://github.com/nuxt/ui/blob/v4/LICENSE.md
-->
<script setup lang="ts">
import { Star } from "@lucide/vue";
import { RatingItemIndicator, RatingItem as RekaRatingItem } from "reka-ui";
import { type HTMLAttributes, ref } from "vue";

import { cn } from "@/lib/utils";

import {
  injectRatingContext,
  ratingClipClass,
  ratingEmptyIconClass,
  ratingIconClass,
  ratingIndicatorClass,
  ratingIndicatorIconClass,
  ratingItemVariants,
} from ".";

const props = defineProps<{ item: number; class?: HTMLAttributes["class"] }>();
defineSlots<{ default?: (props: { filled: boolean }) => unknown }>();

const rating = injectRatingContext();

// Only a mouse hovers: a tap fires pointerenter too
const hovered = ref(false);
const onEnter = (event: PointerEvent) => {
  if (event.pointerType === "mouse") hovered.value = true;
};
</script>

<template>
  <RekaRatingItem
    v-slot="{ steps }"
    :item="props.item"
    as="span"
    data-slot="rating-item"
    :data-hovered="hovered || undefined"
    :data-disabled="rating.disabled.value ? '' : undefined"
    :class="cn(ratingItemVariants({ interactive: true }), props.class)"
    @pointerenter="onEnter"
    @pointerleave="hovered = false"
  >
    <span data-slot="rating-empty-icon" aria-hidden="true" :class="ratingEmptyIconClass">
      <slot :filled="false"><Star /></slot>
    </span>
    <RatingItemIndicator
      v-for="step in steps"
      :key="step"
      :step="step"
      data-slot="rating-indicator"
      :aria-label="rating.labels.value.item(step, rating.length.value)"
      :class="ratingIndicatorClass"
    >
      <span :class="cn(ratingClipClass, 'end-0')">
        <span data-slot="rating-icon" aria-hidden="true" :class="cn(ratingIconClass, ratingIndicatorIconClass)">
          <slot :filled="true"><Star /></slot>
        </span>
      </span>
    </RatingItemIndicator>
  </RekaRatingItem>
</template>
