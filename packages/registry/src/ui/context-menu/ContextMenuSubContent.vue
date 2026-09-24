<script setup lang="ts">
import { ContextMenuPortal, ContextMenuSubContent, type ContextMenuSubContentEmits, type ContextMenuSubContentProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed, toRef } from "vue";

import { type MenuSize, injectMenuSize, menuSizeVariants, provideMenuSize } from "@/lib/menu";
import { injectOverlayPortalTarget, overlaySurface } from "@/lib/overlay";
import { cn } from "@/lib/utils";

defineOptions({ inheritAttrs: false });

const props = defineProps<ContextMenuSubContentProps & { size?: MenuSize; class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ContextMenuSubContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
const portalTarget = injectOverlayPortalTarget(null);

const parentSize = injectMenuSize(null);
const size = toRef(() => props.size ?? parentSize?.value ?? "md");
provideMenuSize(size);
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
          menuSizeVariants({ size }),
          props.class,
        )
      "
    >
      <slot />
    </ContextMenuSubContent>
  </ContextMenuPortal>
</template>
