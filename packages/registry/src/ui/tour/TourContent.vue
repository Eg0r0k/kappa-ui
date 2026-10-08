<script setup lang="ts">
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import {
  PopoverContent,
  type PopoverContentEmits,
  type PopoverContentProps,
  PopoverPortal,
  injectPopoverRootContext,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { overlaySurface } from "@/ui/popover";
import { injectTourContext } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverContentProps & { class?: HTMLAttributes["class"] }>(), {
  align: "center",
  sideOffset: 8,
  collisionPadding: 8,
});
const emits = defineEmits<PopoverContentEmits>();

const { tour, titleId, descriptionId, restoreFocus } = injectTourContext();
// Reka names the popover after its trigger; a tour has none, so the title stands in.
injectPopoverRootContext().triggerId = titleId;

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  if (!tour.centered.value) return rest;
  return { ...rest, side: "bottom" as const, align: "center" as const, sideOffset: 0, avoidCollisions: false };
});
const forwarded = useForwardPropsEmits(delegated, emits);

const portalTarget = injectOverlayPortalTarget(null);

const onOpenAutoFocus = (event: Event) => {
  const content = event.target instanceof HTMLElement ? event.target : null;
  const next = content?.querySelector<HTMLElement>("[data-slot=tour-next]");
  if (!next) return;
  event.preventDefault();
  next.focus();
};

const onCloseAutoFocus = (event: Event) => {
  event.preventDefault();
  restoreFocus();
};
</script>

<template>
  <PopoverPortal :to="portalTarget ?? undefined">
    <PopoverContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="tour-content"
      :data-centered="tour.centered.value || undefined"
      :aria-describedby="descriptionId"
      :class="
        cn(
          overlaySurface,
          `
            group/tour relative flex w-80 max-w-(--reka-popover-content-available-width) flex-col gap-2 p-4
            origin-(--reka-popover-content-transform-origin)
            data-centered:-translate-y-1/2
          `,
          props.class,
        )
      "
      @interact-outside="(event: Event) => event.preventDefault()"
      @open-auto-focus="onOpenAutoFocus"
      @close-auto-focus="onCloseAutoFocus"
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
