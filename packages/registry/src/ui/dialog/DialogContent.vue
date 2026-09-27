<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogPortal,
} from "@kappa-ui/core/dialog";
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
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
</script>

<template>
  <DialogPortal :to="portalTarget ?? undefined">
    <DialogOverlay />
    <DialogContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="dialog-content"
      :class="
        cn(
          'fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
          dialogSurface,
          props.class,
        )
      "
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
  </DialogPortal>
</template>
