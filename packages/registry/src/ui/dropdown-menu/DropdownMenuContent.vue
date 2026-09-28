<script setup lang="ts">
import {
  DropdownMenuContent,
  type DropdownMenuContentEmits,
  type DropdownMenuContentProps,
  DropdownMenuPortal,
  injectDropdownMenuRootContext,
} from "@kappa-ui/core/dropdown-menu";
import { OverlayScrim, injectOverlayPortalTarget, useModalScrim } from "@kappa-ui/core/overlay";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed, toRef } from "vue";

import { cn } from "@/lib/utils";
import { type MenuSize, menuSizeVariants, provideMenuSize } from "@/ui/menu";
import { overlaySurface } from "@/ui/popover";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<DropdownMenuContentProps & { size?: MenuSize; class?: HTMLAttributes["class"] }>(),
  { sideOffset: 4 },
);
const emits = defineEmits<DropdownMenuContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const size = toRef(() => props.size ?? "md");
provideMenuSize(size);

const rootContext = injectDropdownMenuRootContext();
const scrim = useModalScrim({
  open: rootContext.open,
  modal: rootContext.modal,
  forceMount: () => props.forceMount,
});
const { ModalScrimHold } = scrim;
const portalTarget = injectOverlayPortalTarget(null);
</script>

<template>
  <DropdownMenuPortal :to="portalTarget ?? undefined">
    <OverlayScrim :scrim="scrim" data-slot="dropdown-menu-scrim" class="z-50" />
    <DropdownMenuContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="dropdown-menu-content"
      :data-size="size"
      :class="
        cn(
          overlaySurface,
          'max-h-(--reka-dropdown-menu-content-available-height) flex min-w-32 flex-col gap-0.5 overflow-x-hidden overflow-y-auto origin-(--reka-dropdown-menu-content-transform-origin)',
          menuSizeVariants({ size }),
          props.class,
        )
      "
    >
      <ModalScrimHold />
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
