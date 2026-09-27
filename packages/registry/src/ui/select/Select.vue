<script setup lang="ts">
import { SelectRoot, type SelectRootEmits, type SelectRootProps } from "@kappa-ui/core/select";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";

const props = defineProps<SelectRootProps>();
const emits = defineEmits<SelectRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const control = useFieldControl(props, useAttrs());
</script>

<template>
  <SelectRoot
    v-slot="slotProps"
    v-bind="forwarded"
    :disabled="control.disabled.value"
    :required="control.required.value"
  >
    <slot v-bind="slotProps" />
  </SelectRoot>
</template>
