<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import {
  type AcceptableValue,
  ComboboxRoot,
  type ComboboxRootEmits,
  type ComboboxRootProps,
  useForwardPropsEmits,
} from "reka-ui";
import { useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";

const props = defineProps<ComboboxRootProps<T>>();
const emits = defineEmits<ComboboxRootEmits<T>>();

const forwarded = useForwardPropsEmits(props, emits);
const control = useFieldControl(props, useAttrs());
</script>

<template>
  <ComboboxRoot
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="combobox"
    :disabled="control.disabled.value"
    :required="control.required.value"
  >
    <slot v-bind="slotProps" />
  </ComboboxRoot>
</template>
