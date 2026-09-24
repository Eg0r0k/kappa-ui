<script setup lang="ts">
import {
  ContextMenuContent,
  type ContextMenuContentEmits,
  type ContextMenuContentProps,
  ContextMenuPortal,
  injectContextMenuRootContext,
} from "@delta-ui/core/context-menu";
import { useForwardPropsEmits } from "@delta-ui/core/utils";
import { type HTMLAttributes, computed, toRef } from "vue";

import { type MenuSize, menuSizeVariants, provideMenuSize } from "@/lib/menu";
import { injectOverlayPortalTarget, modalScrim, overlaySurface, useModalScrim } from "@/lib/overlay";
import { cn } from "@/lib/utils";

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
const { scrimVisible, onScrimPointerdown, ModalScrimHold } = useModalScrim({
  open: rootContext.open,
  modal: rootContext.modal,
  forceMount: () => props.forceMount,
});
const portalTarget = injectOverlayPortalTarget(null);
</script>

<template>
  <ContextMenuPortal :to="portalTarget ?? undefined">
    <div
      v-if="scrimVisible"
      data-slot="context-menu-scrim"
      aria-hidden="true"
      :class="modalScrim"
      @pointerdown="onScrimPointerdown"
      @contextmenu.prevent
    />
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
