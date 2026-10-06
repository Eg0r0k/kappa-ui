<script setup lang="ts">
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import {
  MenubarPortal,
  MenubarSubContent,
  type MenubarSubContentEmits,
  type MenubarSubContentProps,
  injectMenubarMenuContext,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, toRef } from "vue";

import { cn } from "@/lib/utils";
import { injectMenuSize, menuSizeVariants, provideMenuSize } from "@/ui/menu";
import { overlaySurface } from "@/ui/popover";
import { type MenubarSize, injectMenubarSize, menubarContent, tabFromTrigger } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<MenubarSubContentProps & { size?: MenubarSize; class?: HTMLAttributes["class"] }>(),
  { collisionPadding: 8 },
);
const emits = defineEmits<MenubarSubContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
const portalTarget = injectOverlayPortalTarget(null);

const parentSize = injectMenuSize(null);
const menubarSize = injectMenubarSize(null);
const size = toRef(() => props.size ?? parentSize?.value ?? menubarSize?.value ?? "md");
provideMenuSize(size);

const menuContext = injectMenubarMenuContext();
const onKeydown = (event: KeyboardEvent) => tabFromTrigger(event, menuContext.triggerElement.value);
</script>

<template>
  <MenubarPortal :to="portalTarget ?? undefined">
    <MenubarSubContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="menubar-sub-content"
      :data-size="size"
      :class="cn(overlaySurface, menubarContent, menuSizeVariants({ size }), props.class)"
      @keydown="onKeydown"
    >
      <slot />
    </MenubarSubContent>
  </MenubarPortal>
</template>
