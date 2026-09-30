<script setup lang="ts">
import {
  HoverCardContent,
  type HoverCardContentEmits,
  type HoverCardContentProps,
  HoverCardPortal,
} from "@kappa-ui/core/hover-card";
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import { useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { overlaySurface } from "@/ui/popover";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HoverCardContentProps & { class?: HTMLAttributes["class"] }>(), {
  sideOffset: 4,
});
const emits = defineEmits<HoverCardContentEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
const portalTarget = injectOverlayPortalTarget(null);
</script>

<template>
  <HoverCardPortal :to="portalTarget ?? undefined">
    <HoverCardContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="hover-card-content"
      :class="
        cn(
          overlaySurface,
          'w-64 max-w-(--reka-hover-card-content-available-width) p-4 origin-(--reka-hover-card-content-transform-origin)',
          props.class,
        )
      "
    >
      <slot />
    </HoverCardContent>
  </HoverCardPortal>
</template>
