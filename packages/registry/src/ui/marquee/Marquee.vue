<script setup lang="ts">
import { useMutationObserver } from "@vueuse/core";
import { Primitive, type PrimitiveProps, useForwardExpose } from "reka-ui";
import { type HTMLAttributes, onMounted } from "vue";

import { cn } from "@/lib/utils";
import { type MarqueeOrientation, marqueeContentVariants, marqueeVariants } from ".";

const props = withDefaults(
  defineProps<{
    as?: PrimitiveProps["as"];
    pauseOnHover?: boolean;
    paused?: boolean;
    reverse?: boolean;
    orientation?: MarqueeOrientation;
    repeat?: number;
    fade?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { as: "div", pauseOnHover: false, paused: false, reverse: false, orientation: "horizontal", repeat: 2, fade: true },
);

const FOCUSABLE = "a[href], area[href], button, input, select, textarea, summary, iframe, [tabindex]";

const { forwardRef, currentElement } = useForwardExpose();

const untab = () => {
  const node = currentElement.value;
  if (!node) return;
  for (const copy of node.querySelectorAll<HTMLElement>("[data-slot=marquee-content][aria-hidden]")) {
    for (const element of copy.querySelectorAll<HTMLElement>(FOCUSABLE)) element.tabIndex = -1;
  }
};

onMounted(untab);
useMutationObserver(currentElement, untab, { childList: true, subtree: true });
</script>

<template>
  <Primitive
    :ref="forwardRef"
    :as="props.as"
    data-slot="marquee"
    :data-orientation="props.orientation"
    :class="cn(marqueeVariants({ orientation: props.orientation, fade: props.fade }), props.class)"
  >
    <div
      v-for="copy in props.repeat"
      :key="copy"
      data-slot="marquee-content"
      :aria-hidden="copy > 1 || undefined"
      :class="
        marqueeContentVariants({
          orientation: props.orientation,
          reverse: props.reverse,
          pauseOnHover: props.pauseOnHover,
          paused: props.paused,
        })
      "
    >
      <slot />
    </div>
  </Primitive>
</template>
