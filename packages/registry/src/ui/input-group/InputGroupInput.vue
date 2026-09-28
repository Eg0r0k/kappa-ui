<script setup lang="ts">
import { type HTMLAttributes, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { textControlBase } from "@/ui/input";
import { cn } from "@/lib/utils";
import { injectInputGroupContext, inputGroupControlText } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  id?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  required?: boolean;
  class?: HTMLAttributes["class"];
}>();

const model = defineModel<string | number>();
if (model.value === undefined && props.defaultValue !== undefined) model.value = props.defaultValue;

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
const group = injectInputGroupContext();
</script>

<template>
  <input
    v-bind="attrs"
    v-model="model"
    data-slot="input-group-control"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :required="control.required.value"
    :aria-invalid="control.invalid.value"
    :aria-describedby="control.describedBy.value"
    :class="
      cn(
        textControlBase,
        'h-full min-h-[calc(var(--input-group-height)-2px)] flex-1 rounded-none px-(--input-group-padding)',
        inputGroupControlText[group.size.value],
        props.class,
      )
    "
  />
</template>
