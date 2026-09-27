<script setup lang="ts">
import { OverlayScrim, injectOverlayPortalTarget, useModalScrim } from "@kappa-ui/core/overlay";
import {
  PopoverContent,
  type PopoverContentEmits,
  type PopoverContentProps,
  PopoverPortal,
  injectPopoverRootContext,
} from "@kappa-ui/core/popover";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed } from "vue";

import { modalScrim, overlaySurface } from "@/lib/overlay";
import { cn } from "@/lib/utils";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverContentProps & { class?: HTMLAttributes["class"] }>(), {
  align: "center",
  sideOffset: 4,
});
const emits = defineEmits<PopoverContentEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const rootContext = injectPopoverRootContext();
const scrim = useModalScrim({
  open: rootContext.open,
  modal: rootContext.modal,
  forceMount: () => props.forceMount,
});
const { ModalScrimHold } = scrim;
const portalTarget = injectOverlayPortalTarget(null);
</script>

<template>
  <PopoverPortal :to="portalTarget ?? undefined">
    <OverlayScrim :scrim="scrim" data-slot="popover-scrim" :class="modalScrim" />
    <PopoverContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="popover-content"
      :class="
        cn(
          overlaySurface,
          'w-72 max-w-(--reka-popover-content-available-width) p-4 origin-(--reka-popover-content-transform-origin)',
          props.class,
        )
      "
    >
      <ModalScrimHold />
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
