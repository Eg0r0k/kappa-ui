<script setup lang="ts">
import {
  PopoverContent,
  type PopoverContentEmits,
  type PopoverContentProps,
  PopoverPortal,
  injectPopoverRootContext,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { injectOverlayPortalTarget, modalScrim, overlaySurface, useModalScrim } from "@/lib/overlay";
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
const { scrimVisible, onScrimPointerdown, ModalScrimHold } = useModalScrim({
  open: rootContext.open,
  modal: rootContext.modal,
  forceMount: () => props.forceMount,
});
const portalTarget = injectOverlayPortalTarget(null);
</script>

<template>
  <PopoverPortal :to="portalTarget ?? undefined">
    <div
      v-if="scrimVisible"
      data-slot="popover-scrim"
      aria-hidden="true"
      :class="modalScrim"
      @pointerdown="onScrimPointerdown"
      @contextmenu.prevent
    />
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
