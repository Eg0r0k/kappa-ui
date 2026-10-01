<script setup lang="ts">
import { DialogClose, type DialogContentEmits, type DialogContentProps, DialogPortal } from "@kappa-ui/core/dialog";
import { DrawerContent, useDrawerContext } from "@kappa-ui/core/drawer";
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import { X } from "@lucide/vue";
import { useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { drawerContentVariants, drawerSurface } from ".";
import DrawerHandle from "./DrawerHandle.vue";
import DrawerOverlay from "./DrawerOverlay.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    DialogContentProps & { class?: HTMLAttributes["class"]; showHandle?: boolean; showCloseButton?: boolean }
  >(),
  { showHandle: undefined, showCloseButton: false },
);
const emits = defineEmits<DialogContentEmits>();

const delegated = computed(() => {
  const { class: _, showHandle: __, showCloseButton: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const portalTarget = injectOverlayPortalTarget(null);
const context = useDrawerContext();
const withHandle = computed(
  () => props.showHandle ?? (context.side.value === "bottom" || context.side.value === "top"),
);
</script>

<template>
  <DialogPortal :to="portalTarget ?? undefined">
    <DrawerOverlay />
    <DrawerContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="drawer-content"
      :class="cn(drawerSurface, drawerContentVariants({ side: context.side.value }), props.class)"
    >
      <DrawerHandle v-if="withHandle" />
      <slot />
      <DialogClose v-if="props.showCloseButton" as-child>
        <Button
          variant="ghost"
          color="neutral"
          size="icon-sm"
          aria-label="Close"
          data-slot="drawer-close"
          class="absolute end-4 top-4"
        >
          <X />
        </Button>
      </DialogClose>
    </DrawerContent>
  </DialogPortal>
</template>
