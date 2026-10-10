<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type MarqueeOrientation, marqueeContentVariants, marqueeVariants } from ".";

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      pauseOnHover?: boolean;
      reverse?: boolean;
      orientation?: MarqueeOrientation;
      repeat?: number;
      fade?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  { as: "div", pauseOnHover: false, reverse: false, orientation: "horizontal", repeat: 4, fade: true },
);
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="marquee"
    :data-orientation="props.orientation"
    :class="cn(marqueeVariants({ orientation: props.orientation, fade: props.fade }), props.class)"
  >
    <div
      v-for="copy in props.repeat"
      :key="copy"
      data-slot="marquee-content"
      :inert="copy > 1"
      :aria-hidden="copy > 1 || undefined"
      :class="
        marqueeContentVariants({
          orientation: props.orientation,
          reverse: props.reverse,
          pauseOnHover: props.pauseOnHover,
        })
      "
    >
      <slot />
    </div>
  </Primitive>
</template>
