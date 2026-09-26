<script setup lang="ts">
import { useForwardExpose, useId } from "@delta-ui/core/utils";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import {
  type InputVariants,
  floatingControlVariants,
  floatingInputVariants,
  floatingLabelVariants,
  floatingLegendVariants,
  floatingOutlineVariants,
  inputVariants,
} from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  id?: string;
  label?: string;
  defaultValue?: string | number;
  variant?: InputVariants["variant"];
  size?: InputVariants["size"];
  disabled?: boolean;
  required?: boolean;
  class?: HTMLAttributes["class"];
}>();

const model = defineModel<string | number>();
if (model.value === undefined && props.defaultValue !== undefined) model.value = props.defaultValue;

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
const generatedId = useId(undefined, "input");
const { forwardRef } = useForwardExpose();

const alwaysFloating = new Set(["date", "datetime-local", "month", "time", "week", "color", "file"]);

const id = computed(() => control.id.value ?? (props.label ? generatedId : undefined));

const inputBindings = computed(() => ({
  ...attrs,
  id: id.value,
  disabled: control.disabled.value,
  required: control.required.value,
  "aria-invalid": control.invalid.value,
  "aria-describedby": control.describedBy.value,
}));
</script>

<template>
  <div
    v-if="props.label"
    data-slot="input-control"
    :data-variant="props.variant ?? 'outline'"
    :data-float="alwaysFloating.has(String(attrs.type)) || undefined"
    :class="cn(floatingControlVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <input
      v-bind="inputBindings"
      :ref="forwardRef"
      v-model="model"
      data-slot="input"
      :placeholder="(attrs.placeholder as string | undefined) ?? ' '"
      :class="cn(floatingInputVariants({ variant: props.variant, size: props.size }))"
    />
    <label
      data-slot="input-label"
      :for="id"
      :class="cn(floatingLabelVariants({ variant: props.variant, size: props.size }))"
    >
      {{ props.label }}<span v-if="control.required.value" aria-hidden="true"> *</span>
    </label>
    <fieldset
      v-if="(props.variant ?? 'outline') === 'outline'"
      aria-hidden="true"
      :class="floatingOutlineVariants({ size: props.size })"
    >
      <legend :class="floatingLegendVariants()">{{ props.label }}<span v-if="control.required.value"> *</span></legend>
    </fieldset>
  </div>
  <input
    v-else
    v-bind="inputBindings"
    :ref="forwardRef"
    v-model="model"
    data-slot="input"
    :data-variant="props.variant ?? 'outline'"
    :class="cn(inputVariants({ variant: props.variant, size: props.size }), props.class)"
  />
</template>
