<script setup lang="ts">
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import {
  ContextMenuPortal,
  ContextMenuSubContent,
  type ContextMenuSubContentEmits,
  type ContextMenuSubContentProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, toRef } from "vue";

import { cn } from "@/lib/utils";
import { overlaySurface } from "@/ui/popover";
import { type ContextMenuSize, injectContextMenuSize, contextMenuSizeVariants, provideContextMenuSize } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<ContextMenuSubContentProps & { size?: ContextMenuSize; class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ContextMenuSubContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
const portalTarget = injectOverlayPortalTarget(null);

const parentSize = injectContextMenuSize(null);
const size = toRef(() => props.size ?? parentSize?.value ?? "md");
provideContextMenuSize(size);
</script>

<template>
  <ContextMenuPortal :to="portalTarget ?? undefined">
    <ContextMenuSubContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="context-menu-sub-content"
      :data-size="size"
      :class="
        cn(
          overlaySurface,
          'max-h-(--reka-context-menu-content-available-height) flex min-w-32 flex-col gap-0.5 overflow-x-hidden overflow-y-auto origin-(--reka-context-menu-content-transform-origin)',
          contextMenuSizeVariants({ size }),
          props.class,
        )
      "
    >
      <slot />
    </ContextMenuSubContent>
  </ContextMenuPortal>
</template>
