<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type BannerColor, provideBannerContext } from ".";

interface Props extends PrimitiveProps {
  color?: BannerColor | (string & {});
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "div",
  color: "primary",
});

const open = defineModel<boolean>("open", { default: true });

provideBannerContext({
  close: () => {
    open.value = false;
  },
});
</script>

<template>
  <Primitive
    v-if="open"
    data-slot="banner"
    :data-color="props.color"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        `
          relative flex min-h-12 w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-tone px-4 py-2
          text-center text-tone-foreground
          has-data-[slot=banner-close]:px-12
          [&>svg]:pointer-events-none [&>svg]:size-5 [&>svg]:shrink-0
        `,
        props.class,
      )
    "
  >
    <slot />
  </Primitive>
</template>
