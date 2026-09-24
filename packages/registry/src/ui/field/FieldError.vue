<script setup lang="ts">
import { type HTMLAttributes, computed, onBeforeUnmount, useSlots, watchEffect } from "vue";

import { injectFieldContext } from "@/lib/field-context";
import { cn } from "@/lib/utils";

type FieldErrorItem = string | { message?: string } | null | undefined;

const props = defineProps<{
  errors?: FieldErrorItem[] | string | null;
  class?: HTMLAttributes["class"];
}>();

const slots = useSlots();
const field = injectFieldContext(null);

const messages = computed(() => {
  const list = Array.isArray(props.errors) ? props.errors : [props.errors];
  const texts = list.map((error) => (typeof error === "string" ? error : error?.message)).filter(Boolean);
  return [...new Set(texts)] as string[];
});

const visible = computed(() => Boolean(slots.default) || messages.value.length > 0);

watchEffect(() => {
  if (field) field.hasError.value = visible.value;
});
onBeforeUnmount(() => {
  if (field) field.hasError.value = false;
});
</script>

<template>
  <div
    v-if="visible"
    data-slot="field-error"
    :id="field?.errorId"
    :class="cn('text-body-sm text-destructive', props.class)"
  >
    <slot>
      <template v-if="messages.length === 1">{{ messages[0] }}</template>
      <ul v-else class="ms-4 flex list-disc flex-col gap-1">
        <li v-for="message in messages" :key="message">{{ message }}</li>
      </ul>
    </slot>
  </div>
</template>
