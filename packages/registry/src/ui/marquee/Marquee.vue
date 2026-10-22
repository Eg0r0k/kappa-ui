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

// Keyboard focus on an item stops the scroll, so the item holds still while it
// has the ring. Set on the element at once, not through a render, and not with
// a :has() over the copies.
const onFocusin = (event: FocusEvent) => {
  const visible = event.target instanceof Element && event.target.matches(":focus-visible");
  (event.currentTarget as HTMLElement).toggleAttribute("data-focus-visible", visible);
};
const onFocusout = (event: FocusEvent) => {
  (event.currentTarget as HTMLElement).removeAttribute("data-focus-visible");
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
    @focusin="onFocusin"
    @focusout="onFocusout"
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
