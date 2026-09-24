<script setup lang="ts">
import {
  SelectContent,
  type SelectContentEmits,
  type SelectContentProps,
  SelectPortal,
  SelectViewport,
  injectSelectRootContext,
} from "@delta-ui/core/select";
import { useForwardPropsEmits } from "@delta-ui/core/utils";
import { type HTMLAttributes, computed } from "vue";

import { menuSizeVariants } from "@/lib/menu";
import { injectOverlayPortalTarget, modalScrim, overlaySurface, useModalScrim } from "@/lib/overlay";
import { cn } from "@/lib/utils";
import SelectScrollDownButton from "./SelectScrollDownButton.vue";
import SelectScrollUpButton from "./SelectScrollUpButton.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SelectContentProps & { class?: HTMLAttributes["class"] }>(), {
  position: "popper",
  sideOffset: 4,
  disableOutsidePointerEvents: true,
});
const emits = defineEmits<SelectContentEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const rootContext = injectSelectRootContext();
const { scrimVisible, onScrimPointerdown, ModalScrimHold } = useModalScrim({
  open: rootContext.open,
  modal: () => props.disableOutsidePointerEvents,
  forceMount: () => props.forceMount,
});
const portalTarget = injectOverlayPortalTarget(null);
</script>

<template>
  <SelectPortal :to="portalTarget ?? undefined">
    <div
      v-if="scrimVisible"
      data-slot="select-scrim"
      aria-hidden="true"
      :class="modalScrim"
      @pointerdown="onScrimPointerdown"
      @contextmenu.prevent
    />
    <SelectContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="select-content"
      :class="
        cn(
          overlaySurface,
          'relative flex max-h-(--reka-select-content-available-height) min-w-32 flex-col overflow-hidden origin-(--reka-select-content-transform-origin)',
          props.class,
        )
      "
    >
      <ModalScrimHold />
      <SelectScrollUpButton />
      <SelectViewport
        data-slot="select-viewport"
        :class="
          cn(
            menuSizeVariants(),
            'flex flex-col gap-0.5',
            props.position === 'popper' && 'h-(--reka-select-trigger-height) w-full min-w-(--reka-select-trigger-width) scroll-my-1',
          )
        "
      >
        <slot />
      </SelectViewport>
      <SelectScrollDownButton />
    </SelectContent>
  </SelectPortal>
</template>
