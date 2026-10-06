<script setup lang="ts">
import {
  ComboboxInput,
  type ComboboxInputEmits,
  type ComboboxInputProps,
  useForwardExpose,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import { comboboxInputVariants, injectComboboxAnchorContext, injectComboboxListContext } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  ComboboxInputProps & {
    id?: string;
    required?: boolean;
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<ComboboxInputEmits>();

const delegated = computed(() => {
  const { class: _, id: __, required: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
const anchor = injectComboboxAnchorContext(null);
const list = injectComboboxListContext(null);
const size = computed(() => anchor?.value.size ?? list?.value.size);
const { forwardRef } = useForwardExpose();
</script>

<template>
  <ComboboxInput
    v-bind="{ ...attrs, ...forwarded }"
    :ref="forwardRef"
    data-slot="combobox-input"
    :id="control.id.value"
    :aria-invalid="control.invalid.value"
    :aria-describedby="control.describedBy.value"
    :aria-required="control.required.value || undefined"
    :class="cn(comboboxInputVariants({ size }), props.class)"
  />
</template>
