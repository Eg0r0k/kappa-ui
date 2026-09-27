<script setup lang="ts">
import {
  RadioGroupIndicator,
  RadioGroupItem,
  type RadioGroupItemEmits,
  type RadioGroupItemProps,
} from "@kappa-ui/core/radio-group";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed, ref, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import { type RadioVariants, radioVariants } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  RadioGroupItemProps & {
    size?: RadioVariants["size"];
    touchTarget?: RadioVariants["touchTarget"];
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<RadioGroupItemEmits>();

const delegated = computed(() => {
  const { class: _, size: __, touchTarget: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const attrs = useAttrs();
const control = useFieldControl(props, attrs);

const hovered = ref(false);
const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === "mouse") hovered.value = true;
};
const onPointerLeave = () => {
  hovered.value = false;
};
</script>

<template>
  <RadioGroupItem
    v-bind="{ ...attrs, ...forwarded }"
    data-slot="radio"
    :data-touch-target="props.touchTarget"
    :data-hovered="hovered || undefined"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :aria-invalid="control.invalid.value"
    :aria-describedby="control.describedBy.value"
    :class="cn(radioVariants({ size: props.size, touchTarget: props.touchTarget }), props.class)"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <RadioGroupIndicator force-mount class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span
        class="size-[round(calc(var(--choice-size)/2),2px)] scale-0 rounded-full bg-primary transition-[scale] duration-medium-2 ease-emphasized-decelerate group-data-[state=checked]/radio:scale-100 in-aria-invalid:bg-destructive group-disabled/radio:bg-foreground/(--disabled-opacity) motion-reduce:transition-none"
      />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
