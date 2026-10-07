<script setup lang="ts">
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import {
  ComboboxContent,
  type ComboboxContentEmits,
  type ComboboxContentProps,
  ComboboxPortal,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuSizeVariants } from "@/ui/menu";
import { overlaySurface } from "@/ui/popover";
import { type ComboboxSize, injectComboboxSize, provideComboboxListContext } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<ComboboxContentProps & { size?: ComboboxSize; class?: HTMLAttributes["class"] }>(),
  {
    position: "popper",
    align: "start",
    sideOffset: 4,
  },
);
const emits = defineEmits<ComboboxContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const portalTarget = injectOverlayPortalTarget(null);

const anchorSize = injectComboboxSize(null);
const size = computed(() => props.size ?? anchorSize?.value ?? "md");
provideComboboxListContext(computed(() => ({ size: size.value })));
</script>

<template>
  <ComboboxPortal :to="portalTarget ?? undefined">
    <ComboboxContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="combobox-list"
      :data-size="size"
      :class="
        cn(
          overlaySurface,
          menuSizeVariants({ size }),
          `
            flex max-h-(--reka-combobox-content-available-height) w-(--reka-combobox-trigger-width) min-w-32 flex-col
            overflow-hidden p-0 origin-(--reka-combobox-content-transform-origin)
          `,
          props.class,
        )
      "
    >
      <slot />
    </ComboboxContent>
  </ComboboxPortal>
</template>
