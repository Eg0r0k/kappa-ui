<script setup lang="ts">
import {
  DropdownMenuContent,
  type DropdownMenuContentEmits,
  type DropdownMenuContentProps,
  DropdownMenuPortal,
  injectDropdownMenuRootContext,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, toRef } from "vue";

import { type MenuSize, menuSizeVariants, provideMenuSize } from "@/lib/menu";
import { injectOverlayPortalTarget, modalScrim, overlaySurface, useModalScrim } from "@/lib/overlay";
import { cn } from "@/lib/utils";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DropdownMenuContentProps & { size?: MenuSize; class?: HTMLAttributes["class"] }>(), { sideOffset: 4 });
const emits = defineEmits<DropdownMenuContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const size = toRef(() => props.size ?? "md");
provideMenuSize(size);

const rootContext = injectDropdownMenuRootContext();
const { scrimVisible, onScrimPointerdown, ModalScrimHold } = useModalScrim({
  open: rootContext.open,
  modal: rootContext.modal,
  forceMount: () => props.forceMount,
});
const portalTarget = injectOverlayPortalTarget(null);
</script>

<template>
  <DropdownMenuPortal :to="portalTarget ?? undefined">
    <div
      v-if="scrimVisible"
      data-slot="dropdown-menu-scrim"
      aria-hidden="true"
      :class="modalScrim"
      @pointerdown="onScrimPointerdown"
      @contextmenu.prevent
    />
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
