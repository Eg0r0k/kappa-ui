<script setup lang="ts">
import { type HTMLAttributes, nextTick, onMounted, useAttrs, useTemplateRef, watch } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import { type TextareaVariants, textareaVariants } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    id?: string;
    defaultValue?: string;
    variant?: TextareaVariants["variant"];
    size?: TextareaVariants["size"];
    rows?: number;
    maxrows?: number;
    autoresize?: boolean;
    disabled?: boolean;
    required?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { rows: 3 },
);

const model = defineModel<string>();
if (model.value === undefined && props.defaultValue !== undefined) model.value = props.defaultValue;

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
const textarea = useTemplateRef<HTMLTextAreaElement>("textarea");

const resize = () => {
  const element = textarea.value;
  if (!element) return;
  element.style.height = "";
  element.style.overflowY = "";
  if (!props.autoresize) return;

  const style = getComputedStyle(element);
  const frame = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth);
  const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
  const limit = props.maxrows ? props.maxrows * Number.parseFloat(style.lineHeight) + padding + frame : Infinity;
  const height = element.scrollHeight + frame;

  element.style.height = `${Math.min(height, limit)}px`;
  if (height <= limit) element.style.overflowY = "hidden";
};

onMounted(resize);
watch([model, () => props.autoresize, () => props.rows, () => props.maxrows], () => nextTick(resize));

defineExpose({ resize });
</script>

<template>
  <textarea
    v-bind="attrs"
    ref="textarea"
    v-model="model"
    data-slot="textarea"
    :data-variant="props.variant ?? 'outline'"
    :rows="props.rows"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :required="control.required.value"
    :aria-invalid="control.invalid.value"
    :aria-describedby="control.describedBy.value"
    :class="cn(textareaVariants({ variant: props.variant, size: props.size }), props.autoresize && 'resize-none', props.class)"
  />
</template>
