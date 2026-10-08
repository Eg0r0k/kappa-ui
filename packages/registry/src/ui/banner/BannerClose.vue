<script setup lang="ts">
import { X } from "@lucide/vue";
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { injectBannerContext } from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "button" });

const { close } = injectBannerContext();
</script>

<template>
  <Primitive
    v-ripple
    data-slot="banner-close"
    aria-label="Close"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        `
          absolute end-2 top-1/2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center
          rounded-md outline-none state-layer touch-target [--color-ring:currentColor]
          focus-visible:focus-ring
          [&_svg]:size-4
        `,
        props.class,
      )
    "
    @click="close"
  >
    <slot>
      <X />
    </slot>
  </Primitive>
</template>
