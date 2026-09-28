<script setup lang="ts">
import {
  ContextMenuContent,
  type ContextMenuContentEmits,
  type ContextMenuContentProps,
  ContextMenuPortal,
  injectContextMenuRootContext,
} from "@kappa-ui/core/context-menu";
import { OverlayScrim, injectOverlayPortalTarget, useModalScrim } from "@kappa-ui/core/overlay";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed, toRef } from "vue";

import { cn } from "@/lib/utils";
import { type MenuSize, menuSizeVariants, provideMenuSize } from "@/ui/menu";
import { overlaySurface } from "@/ui/popover";

defineOptions({ inheritAttrs: false });

const props = defineProps<ContextMenuContentProps & { size?: MenuSize; class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ContextMenuContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const size = toRef(() => props.size ?? "md");
provideMenuSize(size);

const rootContext = injectContextMenuRootContext();
const scrim = useModalScrim({
  open: rootContext.open,
  modal: rootContext.modal,
  forceMount: () => props.forceMount,
});
const { ModalScrimHold } = scrim;
const portalTarget = injectOverlayPortalTarget(null);
</script>

<template>
  <ContextMenuPortal :to="portalTarget ?? undefined">
    <OverlayScrim :scrim="scrim" data-slot="context-menu-scrim" class="z-50" />
    <ContextMenuContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="context-menu-content"
      :data-size="size"
      :class="
        cn(
          overlaySurface,
          'max-h-(--reka-context-menu-content-available-height) flex min-w-32 flex-col gap-0.5 overflow-x-hidden overflow-y-auto origin-(--reka-context-menu-content-transform-origin)',
          menuSizeVariants({ size }),
          props.class,
        )
      "
    >
      <ModalScrimHold />
      <slot />
    </ContextMenuContent>
  </ContextMenuPortal>
</template>
