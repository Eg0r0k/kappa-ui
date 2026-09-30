<script setup lang="ts" generic="Type extends 'text' | 'number' = 'text'">
import { PinInputRoot, type PinInputRootEmits, type PinInputRootProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import type { TextControlSize, TextControlVariant } from "@/ui/input";
import { pinInputVariants, providePinInputStyle } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    PinInputRootProps<Type> & {
      variant?: TextControlVariant;
      size?: TextControlSize;
      class?: HTMLAttributes["class"];
    }
  >(),
  { otp: true, variant: "outline", size: "md" },
);
const emits = defineEmits<PinInputRootEmits<Type>>();

const attrs = useAttrs();
const control = useFieldControl(props, attrs);

const delegated = computed(() => {
  const { class: _, variant: __, size: ___, id: ____, disabled: _____, required: ______, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

providePinInputStyle(computed(() => ({ variant: props.variant, size: props.size, invalid: control.invalid.value })));
</script>

<template>
  <PinInputRoot
    v-bind="{ ...attrs, ...forwarded }"
    data-slot="pin-input"
    :data-variant="props.variant"
    :data-size="props.size"
    role="group"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :required="control.required.value"
    :aria-labelledby="control.labelledBy.value"
    :aria-describedby="control.describedBy.value"
    :class="cn(pinInputVariants({ size: props.size }), props.class)"
  >
    <slot />
  </PinInputRoot>
</template>
