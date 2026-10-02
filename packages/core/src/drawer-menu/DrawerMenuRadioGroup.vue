<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { Primitive } from "reka-ui";

import {
  type DrawerMenuRadioGroupEmits,
  type DrawerMenuRadioGroupProps,
  provideDrawerMenuRadioGroupContext,
} from "./context";

const props = defineProps<DrawerMenuRadioGroupProps>();
const emits = defineEmits<DrawerMenuRadioGroupEmits>();

const modelValue = useVModel(props, "modelValue", emits);

provideDrawerMenuRadioGroupContext({
  modelValue,
  onValueChange: (value) => {
    modelValue.value = value;
  },
});
</script>

<template>
  <Primitive :as="props.as" :as-child="props.asChild" role="group">
    <slot :model-value="modelValue" />
  </Primitive>
</template>
