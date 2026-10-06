<script setup lang="ts">
import {
  RadioGroupIndicator,
  RadioGroupItem,
  type RadioGroupItemEmits,
  type RadioGroupItemProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, ref, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import { type RadioColor, type RadioVariants, injectRadioGroupContext, radioVariants } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  RadioGroupItemProps & {
    /** Defaults to the group's `color`, or `primary` outside a group. */
    color?: RadioColor | (string & {});
    size?: RadioVariants["size"];
    touchTarget?: RadioVariants["touchTarget"];
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<RadioGroupItemEmits>();

const delegated = computed(() => {
  const { class: _, size: __, touchTarget: ___, color: ____, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const attrs = useAttrs();
const control = useFieldControl(props, attrs);

const group = injectRadioGroupContext(null);
const color = computed(() => props.color ?? group?.color.value ?? "primary");

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
    :data-color="color"
    :data-size="props.size ?? 'md'"
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
        class="size-[round(calc(var(--choice-size)/2),2px)] scale-0 rounded-full bg-tone-text transition-[scale] duration-medium-2 ease-emphasized-decelerate group-data-[state=checked]/radio:scale-100 group-disabled/radio:bg-foreground/(--disabled-opacity) motion-reduce:transition-none"
      />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
