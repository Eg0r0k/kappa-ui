<script setup lang="ts">
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import {
  MenubarContent,
  type MenubarContentEmits,
  type MenubarContentProps,
  MenubarPortal,
  injectMenubarMenuContext,
  injectMenubarRootContext,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, shallowRef, toRef } from "vue";

import { cn } from "@/lib/utils";
import { menuSizeVariants, provideMenuSize } from "@/ui/menu";
import { overlaySurface } from "@/ui/popover";
import { type MenubarSize, injectMenubarSize, menubarContent, tabFromTrigger } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<MenubarContentProps & { size?: MenubarSize; class?: HTMLAttributes["class"] }>(),
  { align: "start", sideOffset: 4, collisionPadding: 8 },
);
const emits = defineEmits<MenubarContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
const portalTarget = injectOverlayPortalTarget(null);

const menubarSize = injectMenubarSize(null);
const size = toRef(() => props.size ?? menubarSize?.value ?? "md");
provideMenuSize(size);

const rootContext = injectMenubarRootContext();
const menuContext = injectMenubarMenuContext();

// When another menu opens, this one closes but its layer still sees the new menu take focus. If the new menu
// sits earlier in the page, Reka counts that as focus outside and closes the whole menubar.
const onFocusOutside = (event: MenubarContentEmits["focusOutside"][0]) => {
  emits("focusOutside", event);
  const open = rootContext.modelValue.value;
  if (open && open !== menuContext.value) event.preventDefault();
};

// Reka refocuses the trigger on close even when this event was prevented. Its handler runs after ours
// and reads the trigger from the menu context, so hide the trigger for that one call.
const onCloseAutoFocus = (event: Event) => {
  emits("closeAutoFocus", event);
  if (!event.defaultPrevented) return;
  const trigger = menuContext.triggerElement;
  menuContext.triggerElement = shallowRef<HTMLElement>();
  queueMicrotask(() => {
    menuContext.triggerElement = trigger;
  });
};

const onKeydown = (event: KeyboardEvent) => tabFromTrigger(event, menuContext.triggerElement.value);
</script>

<template>
  <MenubarPortal :to="portalTarget ?? undefined">
    <MenubarContent
      v-bind="{ ...$attrs, ...forwarded, onFocusOutside, onCloseAutoFocus }"
      data-slot="menubar-content"
      :data-size="size"
      :class="cn(overlaySurface, menubarContent, menuSizeVariants({ size }), props.class)"
      @keydown="onKeydown"
    >
      <slot />
    </MenubarContent>
  </MenubarPortal>
</template>
