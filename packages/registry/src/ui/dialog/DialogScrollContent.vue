<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogPortal,
} from "@delta-ui/core/dialog";
import { injectOverlayPortalTarget } from "@delta-ui/core/overlay";
import { useForwardPropsEmits } from "@delta-ui/core/utils";
import { X } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { dialogSurface } from ".";
import DialogOverlay from "./DialogOverlay.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<DialogContentProps & { class?: HTMLAttributes["class"]; showCloseButton?: boolean }>(),
  { showCloseButton: true },
);
const emits = defineEmits<DialogContentEmits>();

const delegated = computed(() => {
  const { class: _, showCloseButton: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const portalTarget = injectOverlayPortalTarget(null);

const onPointerDownOutside = (event: CustomEvent<{ originalEvent: PointerEvent }>) => {
  const { originalEvent } = event.detail;
  const target = originalEvent.target as HTMLElement;
  if (target.dataset.slot !== "dialog-overlay") return;
  if (
    originalEvent.offsetX < 0 ||
    originalEvent.offsetX > target.clientWidth ||
    originalEvent.offsetY > target.clientHeight
  )
    event.preventDefault();
};
</script>

<template>
  <DialogPortal :to="portalTarget ?? undefined">
    <DialogOverlay class="grid place-items-center overflow-y-auto p-4 sm:p-8">
      <DialogContent
        v-bind="{ ...$attrs, ...forwarded }"
        data-slot="dialog-content"
        :class="cn('relative w-full max-w-lg', dialogSurface, props.class)"
        @pointer-down-outside="onPointerDownOutside"
      >
        <slot />
        <DialogClose v-if="props.showCloseButton" as-child>
          <Button
            variant="ghost"
            color="neutral"
            size="icon-sm"
            aria-label="Close"
            data-slot="dialog-close"
            class="absolute end-4 top-4"
          >
            <X />
          </Button>
        </DialogClose>
      </DialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>
