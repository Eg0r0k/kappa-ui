<script setup lang="ts">
import {
  AlertDialogContent,
  type AlertDialogContentEmits,
  type AlertDialogContentProps,
  DialogPortal,
} from "@kappa-ui/core/dialog";
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import { useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { DialogOverlay } from "@/ui/dialog";
import { type AlertDialogSize, alertDialogContentVariants } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<AlertDialogContentProps & { size?: AlertDialogSize; class?: HTMLAttributes["class"] }>(),
  { size: "default" },
);
const emits = defineEmits<AlertDialogContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const portalTarget = injectOverlayPortalTarget(null);
</script>

<template>
  <DialogPortal :to="portalTarget ?? undefined">
    <DialogOverlay />
    <AlertDialogContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="alert-dialog-content"
      :data-size="props.size"
      :class="cn(alertDialogContentVariants({ size: props.size }), props.class)"
    >
      <slot />
    </AlertDialogContent>
  </DialogPortal>
</template>
