<script setup lang="ts">
import { type HTMLAttributes, onBeforeUnmount } from "vue";

import { injectFieldContext } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import { Label } from "@/ui/label";

const props = defineProps<{
  for?: string;
  class?: HTMLAttributes["class"];
}>();

const field = injectFieldContext(null);
if (field) field.hasLabel.value = true;
onBeforeUnmount(() => {
  if (field) field.hasLabel.value = false;
});
</script>

<template>
  <Label
    data-slot="field-label"
    :id="field?.labelId"
    :for="props.for ?? field?.id"
    :class="
      cn(
        `
          group-data-disabled/field:text-foreground/(--disabled-opacity)
          group-data-disabled/fieldset:text-foreground/(--disabled-opacity)
          group-data-invalid/field:text-destructive
        `,
        props.class,
      )
    "
  >
    <slot />
    <span v-if="field?.required.value" aria-hidden="true" class="text-destructive">*</span>
  </Label>
</template>
